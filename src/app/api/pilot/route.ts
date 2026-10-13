import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendEmailSafe } from "@/lib/email/sendgrid";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APPLICATIONS_PER_HOUR_PER_IP = 5;

const PILOT_ORG_TYPES = [
  "Nonprofit",
  "Veteran-owned business",
  "Small business",
  "Grant consultant or writer",
  "Other",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeWebsite(raw: string): string | null {
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    if (!u.hostname.includes(".")) return null;
    return u.toString().slice(0, 300);
  } catch {
    return null;
  }
}

// POST /api/pilot - public, unauthenticated application to the free pilot.
// Abuse control: hidden honeypot field + per-IP rate limit (no auth to lean on).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot: real people never fill this. Pretend success so bots move on.
    if (clean(body?.company_url, 200)) {
      return NextResponse.json({ success: true });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limit = await checkRateLimit(`pilot-apply-ip:${ip}`, APPLICATIONS_PER_HOUR_PER_IP, 60 * 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many submissions from this connection. Please try again later." },
        { status: 429 }
      );
    }

    const name = clean(body?.name, 120);
    const email = clean(body?.email, 254).toLowerCase();
    const organization = clean(body?.organization, 160);
    const role = clean(body?.role, 120);
    const orgType = clean(body?.orgType, 60);
    const state = clean(body?.state, 60) || null;
    const challenge = clean(body?.challenge, 1000);
    const websiteRaw = clean(body?.website, 300);
    const feedbackConsent = body?.feedbackConsent === true;

    if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!organization) return NextResponse.json({ error: "Please enter your organization." }, { status: 400 });
    if (!role) return NextResponse.json({ error: "Please enter your role." }, { status: 400 });
    if (!(PILOT_ORG_TYPES as readonly string[]).includes(orgType)) {
      return NextResponse.json({ error: "Please choose an organization type." }, { status: 400 });
    }
    if (challenge.length < 10) {
      return NextResponse.json({ error: "Tell us a little about your biggest grant challenge." }, { status: 400 });
    }
    if (!feedbackConsent) {
      return NextResponse.json(
        { error: "The pilot is free in exchange for feedback. Please confirm you're open to follow-up." },
        { status: 400 }
      );
    }
    const website = normalizeWebsite(websiteRaw);
    if (websiteRaw && !website) {
      return NextResponse.json({ error: "That website doesn't look right. Try something like yourorg.org." }, { status: 400 });
    }

    const existing = await prisma.pilotApplication.findUnique({ where: { email } });
    if (existing) {
      // Idempotent: don't reveal whether an address has applied, don't re-email.
      return NextResponse.json({ success: true });
    }

    await prisma.pilotApplication.create({
      data: { email, name, organization, role, orgType, website, state, challenge, feedbackConsent },
    });

    const notifyTo = process.env.PILOT_NOTIFY_EMAIL;
    if (notifyTo) {
      await sendEmailSafe({
        to: notifyTo,
        replyTo: email,
        subject: `New pilot application: ${organization}`,
        text: [
          `New Grant Scout Pro pilot application`,
          ``,
          `Name: ${name}`,
          `Email: ${email}`,
          `Organization: ${organization} (${orgType})`,
          `Role: ${role}`,
          `Website: ${website ?? "-"}`,
          `State: ${state ?? "-"}`,
          ``,
          `Biggest grant challenge:`,
          challenge,
        ].join("\n"),
        html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#111">
<h2 style="margin:0 0 12px">New pilot application</h2>
<p><b>${esc(name)}</b> &lt;${esc(email)}&gt;<br/>${esc(role)}, ${esc(organization)} (${esc(orgType)})<br/>Website: ${esc(website ?? "-")}<br/>State: ${esc(state ?? "-")}</p>
<p><b>Biggest grant challenge</b><br/>${esc(challenge).replace(/\n/g, "<br/>")}</p>
<p style="color:#666">Reply to this email to reach the applicant directly.</p></div>`,
      });
    } else {
      console.warn("PILOT_NOTIFY_EMAIL is not set; pilot application saved without a notification email.");
    }

    const first = name.split(/\s+/)[0];
    await sendEmailSafe({
      to: email,
      subject: "We got your Grant Scout Pro pilot application",
      text: `Hi ${first},\n\nThanks for applying to the Grant Scout Pro pilot. We're selecting a small first group of about 10 users and will email you either way once we've reviewed applications.\n\nIf you're selected, you'll get free access in exchange for honest feedback. To make that quick, create your free account at https://www.grantscoutpro.com using this same email address (${email}).\n\nDarryl Barnes\nFounder, Grant Scout Pro`,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#111">
<p>Hi ${esc(first)},</p>
<p>Thanks for applying to the Grant Scout Pro pilot. We're selecting a small first group of about 10 users and will email you either way once we've reviewed applications.</p>
<p>If you're selected, you'll get free access in exchange for honest feedback. To make that quick, create your free account at <a href="https://www.grantscoutpro.com">grantscoutpro.com</a> using this same email address (${esc(email)}).</p>
<p>Darryl Barnes<br/>Founder, Grant Scout Pro</p></div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PILOT APPLICATION ERROR:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
