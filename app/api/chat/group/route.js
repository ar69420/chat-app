import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import ChatController from "../../../controller/chat.controller";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { groupName, participantUsernames } = await request.json();
    
    if (!groupName || !participantUsernames || !Array.isArray(participantUsernames)) {
      return NextResponse.json(
        { message: "Group name and participant usernames are required" },
        { status: 400 }
      );
    }

    // Get user IDs for all participants
    const participantIds = await Promise.all(
      participantUsernames.map(async (username) => {
        const user = await ChatController.getUserByUsername(username);
        if (!user) {
          throw new Error(`User not found: ${username}`);
        }
        return user._id;
      })
    );

    const conversation = await ChatController.createGroupChat(
      session.user.id,
      participantIds,
      groupName
    );

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Error creating group chat:", error);
    return NextResponse.json(
      { message: error.message || "Error creating group chat" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { conversationId, action, participantUsernames } = await request.json();
    
    if (!conversationId || !action || !participantUsernames) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user IDs for all participants
    const participantIds = await Promise.all(
      participantUsernames.map(async (username) => {
        const user = await ChatController.getUserByUsername(username);
        if (!user) {
          throw new Error(`User not found: ${username}`);
        }
        return user._id;
      })
    );

    let conversation;
    if (action === "add") {
      conversation = await ChatController.addGroupParticipants(
        conversationId,
        session.user.id,
        participantIds
      );
    } else if (action === "remove") {
      conversation = await ChatController.removeGroupParticipant(
        conversationId,
        session.user.id,
        participantIds[0] // For remove, we only handle one participant at a time
      );
    } else {
      return NextResponse.json(
        { message: "Invalid action" },
        { status: 400 }
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Error updating group chat:", error);
    return NextResponse.json(
      { message: error.message || "Error updating group chat" },
      { status: 500 }
    );
  }
} 