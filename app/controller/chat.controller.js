import { connectToDatabase } from "../lib/mongodb";
import { ObjectId } from "mongodb";

class ChatController {
  async getConversations(userId) {
    const { db } = await connectToDatabase();
    const conversations = await db
      .collection("conversations")
      .find({
        participants: userId,
      })
      .sort({ updatedAt: -1 })
      .toArray();

    // Populate participants and last message
    for (let conversation of conversations) {
      const participants = await db
        .collection("users")
        .find({
          _id: { $in: conversation.participants },
        })
        .toArray();
      conversation.participants = participants;

      if (conversation.lastMessage) {
        const lastMessage = await db
          .collection("messages")
          .findOne({ _id: conversation.lastMessage });
        conversation.lastMessage = lastMessage;
      }
    }

    return conversations;
  }

  async createConversation(userId, otherUserId, isGroup = false, groupName = null) {
    const { db } = await connectToDatabase();
    
    // For direct messages, check if conversation already exists
    if (!isGroup) {
      const existingConversation = await db
        .collection("conversations")
        .findOne({
          participants: { $all: [userId, otherUserId] },
          isGroup: false,
        });

      if (existingConversation) {
        return existingConversation;
      }
    }

    const conversation = {
      participants: isGroup ? [userId, ...otherUserId] : [userId, otherUserId],
      isGroup,
      groupName: isGroup ? groupName : null,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("conversations").insertOne(conversation);
    conversation._id = result.insertedId;

    // Populate participants
    const participants = await db
      .collection("users")
      .find({
        _id: { $in: conversation.participants },
      })
      .toArray();
    conversation.participants = participants;

    return conversation;
  }

  async createGroupChat(userId, participantIds, groupName) {
    if (!groupName) {
      throw new Error("Group name is required");
    }
    if (participantIds.length < 2) {
      throw new Error("At least 2 participants are required for a group chat");
    }
    return this.createConversation(userId, participantIds, true, groupName);
  }

  async addGroupParticipants(conversationId, userId, newParticipantIds) {
    const { db } = await connectToDatabase();
    
    const conversation = await db
      .collection("conversations")
      .findOne({ _id: conversationId });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.isGroup) {
      throw new Error("This is not a group chat");
    }

    if (conversation.createdBy.toString() !== userId.toString()) {
      throw new Error("Only group creator can add participants");
    }

    const updatedConversation = await db
      .collection("conversations")
      .findOneAndUpdate(
        { _id: conversationId },
        {
          $addToSet: { participants: { $each: newParticipantIds } },
          $set: { updatedAt: new Date() },
        },
        { returnDocument: "after" }
      );

    // Populate participants
    const participants = await db
      .collection("users")
      .find({
        _id: { $in: updatedConversation.participants },
      })
      .toArray();
    updatedConversation.participants = participants;

    return updatedConversation;
  }

  async removeGroupParticipant(conversationId, userId, participantId) {
    const { db } = await connectToDatabase();
    
    const conversation = await db
      .collection("conversations")
      .findOne({ _id: conversationId });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.isGroup) {
      throw new Error("This is not a group chat");
    }

    if (conversation.createdBy.toString() !== userId.toString()) {
      throw new Error("Only group creator can remove participants");
    }

    if (participantId.toString() === conversation.createdBy.toString()) {
      throw new Error("Cannot remove the group creator");
    }

    const updatedConversation = await db
      .collection("conversations")
      .findOneAndUpdate(
        { _id: conversationId },
        {
          $pull: { participants: participantId },
          $set: { updatedAt: new Date() },
        },
        { returnDocument: "after" }
      );

    // Populate participants
    const participants = await db
      .collection("users")
      .find({
        _id: { $in: updatedConversation.participants },
      })
      .toArray();
    updatedConversation.participants = participants;

    return updatedConversation;
  }

  async getMessages(conversationId) {
    const { db } = await connectToDatabase();
    const messages = await db
      .collection("messages")
      .find({ conversationId })
      .sort({ createdAt: 1 })
      .toArray();

    // Populate sender information
    for (let message of messages) {
      const sender = await db
        .collection("users")
        .findOne({ _id: message.sender });
      message.sender = sender;
    }

    return messages;
  }

  async createMessage(conversationId, senderId, content, attachments = []) {
    const { db } = await connectToDatabase();
    
    // Convert string IDs to ObjectId
    const message = {
      conversationId: new ObjectId(conversationId),
      sender: new ObjectId(senderId),
      content,
      attachments,
      createdAt: new Date(),
    };

    const result = await db.collection("messages").insertOne(message);
    message._id = result.insertedId;

    // Update conversation's last message and timestamp
    await db.collection("conversations").updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: {
          lastMessage: message._id,
          updatedAt: new Date(),
        },
      }
    );

    // Populate sender information
    const sender = await db.collection("users").findOne({ _id: new ObjectId(senderId) });
    message.sender = sender;

    return message;
  }

  async getUserByUsername(username) {
    const { db } = await connectToDatabase();
    return await db.collection("users").findOne({ username });
  }
}

export default new ChatController(); 