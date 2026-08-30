import { NextResponse } from "next/server";
import { Models } from "@/lib/models";
import { requireWorkspaceMember } from "@/lib/route-guards";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: {
      workspaceId: string;
      documentId: string;
    };
  }
) {
  try {
    const { workspaceId, documentId } =
      params;

    await requireWorkspaceMember(
      workspaceId
    );

    const messages =
      await Models.DocumentMessage.findMany({
        where: {
          documentId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    return NextResponse.json(
      messages
    );
  } catch (err) {
    console.error(
      "Messages error:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Failed to load messages.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: {
      workspaceId: string;
      documentId: string;
    };
  }
) {
  try {
    const { workspaceId, documentId } =
      params;

    const member =
      await requireWorkspaceMember(
        workspaceId
      );

    const body =
      await req.json();

    const { message } = body;

    const msg =
      await Models.DocumentMessage.create({
        data: {
          documentId,
          userId:
            member.userId,
          message,
        },
      });

    return NextResponse.json(
      msg
    );
  } catch (err) {
    console.error(
      "Message create error:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Failed to send message.",
      },
      {
        status: 500,
      }
    );
  }
}