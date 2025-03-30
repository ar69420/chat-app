"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import GroupChatModal from "../GroupChatModal";

export default function Inbox() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/chat");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch conversations");
      }

      setConversations(data.conversations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant = conversation.participants.find(
      (p) => p._id !== session?.user?.id
    );
    return otherParticipant?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleGroupChatSuccess = (newConversation) => {
    setConversations([newConversation, ...conversations]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Conversations</h2>
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            New Group
          </button>
        </div>
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => {
          const otherParticipant = conversation.participants.find(
            (p) => p._id !== session?.user?.id
          );
          const displayName = conversation.isGroup
            ? conversation.groupName
            : otherParticipant?.username;
          const lastMessage = conversation.lastMessage?.content || "No messages yet";

          return (
            <Link
              key={conversation._id}
              href={`/chat/${conversation._id}`}
              className="block p-4 hover:bg-gray-50 border-b"
            >
              <div className="flex items-center">
                <div className="relative w-10 h-10 mr-3">
                  <img
                    src={otherParticipant?.profilePicture || "/default-avatar.png"}
                    alt={displayName}
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{displayName}</h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.lastMessage.createdAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <GroupChatModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSuccess={handleGroupChatSuccess}
      />
    </div>
  );
} 