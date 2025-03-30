"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function GroupChatModal({ isOpen, onClose, onSuccess }) {
  const { data: session } = useSession();
  const [groupName, setGroupName] = useState("");
  const [participantUsername, setParticipantUsername] = useState("");
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddParticipant = () => {
    if (!participantUsername.trim()) {
      setError("Please enter a username");
      return;
    }
    if (participants.includes(participantUsername)) {
      setError("User already added");
      return;
    }
    setParticipants([...participants, participantUsername.trim()]);
    setParticipantUsername("");
    setError("");
  };

  const handleRemoveParticipant = (username) => {
    setParticipants(participants.filter((p) => p !== username));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError("Please enter a group name");
      return;
    }
    if (participants.length < 2) {
      setError("Please add at least 2 participants");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat/group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupName: groupName.trim(),
          participantUsernames: participants,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create group chat");
      }

      onSuccess(data.conversation);
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create Group Chat</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter group name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Add Participants
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={participantUsername}
                onChange={(e) => setParticipantUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter username"
              />
              <button
                type="button"
                onClick={handleAddParticipant}
                className="mt-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>

          {participants.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participants
              </label>
              <div className="space-y-2">
                {participants.map((username) => (
                  <div
                    key={username}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <span>{username}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(username)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 