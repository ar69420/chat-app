import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import ChatController from "../../../../controller/chat.controller";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const messages = await ChatController.getMessages(params.conversationId);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const content = formData.get("content");
    const attachments = formData.getAll("attachments");

    if (!content && attachments.length === 0) {
      return NextResponse.json(
        { message: "Message content or attachment is required" },
        { status: 400 }
      );
    }

    const message = await ChatController.createMessage(
      params.conversationId,
      session.user.id,
      content,
      attachments
    );

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 