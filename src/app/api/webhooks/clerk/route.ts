import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Clerk sends these three headers on every webhook delivery; svix uses them
// (plus your signing secret) to verify the payload actually came from Clerk
// and hasn't been tampered with in transit.
const REQUIRED_HEADERS = ["svix-id", "svix-timestamp", "svix-signature"] as const;

type ClerkEmailAddress = {
  id: string;
  email_address: string;
};

type ClerkUserData = {
  id: string;
  email_addresses?: ClerkEmailAddress[];
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
};

function primaryEmail(data: ClerkUserData): string | null {
  const addresses = data.email_addresses ?? [];
  const primary = addresses.find((a) => a.id === data.primary_email_address_id);
  return primary?.email_address ?? addresses[0]?.email_address ?? null;
}

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error("CLERK WEBHOOK ERROR: CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const headerEntries: Record<string, string> = {};
  for (const key of REQUIRED_HEADERS) {
    const value = req.headers.get(key);
    if (!value) {
      return NextResponse.json({ error: `Missing ${key} header` }, { status: 400 });
    }
    headerEntries[key] = value;
  }

  const rawBody = await req.text();

  let event: { type: string; data: ClerkUserData };

  try {
    const wh = new Webhook(secret);
    event = wh.verify(rawBody, headerEntries) as { type: string; data: ClerkUserData };
  } catch (err) {
    console.error("CLERK WEBHOOK SIGNATURE VERIFICATION FAILED:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const data = event.data;
        const email = primaryEmail(data);
        const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

        await prisma.user.upsert({
          where: { id: data.id },
          update: {
            ...(email ? { email } : {}),
            ...(name ? { name } : {}),
            ...(data.image_url ? { image: data.image_url } : {}),
          },
          create: {
            id: data.id,
            email,
            name,
            image: data.image_url ?? null,
          },
        });

        break;
      }

      case "user.deleted": {
        // Deliberately not hard-deleting the User row here: it's the
        // owner/author on Workspaces, documents, billing history, etc.,
        // and several of those foreign keys don't cascade. A real "user
        // left" flow (reassign or archive their workspaces) is a product
        // decision, not something safe to do silently from a webhook.
        // We log it so it's visible, without breaking referential
        // integrity for everything that still points at this user.
        console.log("CLERK WEBHOOK: user.deleted received for", event.data.id, "- no DB action taken (see comment).");
        break;
      }

      default:
        console.log(`CLERK WEBHOOK: unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("CLERK WEBHOOK HANDLER ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
