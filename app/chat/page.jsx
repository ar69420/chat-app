"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Inbox from "../components/Inbox";
import ChatBox from "../components/ChatBox";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Inbox Sidebar */}
      <div className="w-1/3 border-r">
        <Inbox />
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        <ChatBox />
      </div>
    </div>
  );
} 