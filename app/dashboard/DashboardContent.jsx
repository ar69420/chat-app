"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function DashboardContent() {
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
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16">
                
              </div>
              <div>
                <h2 className="text-xl font-semibold">Welcome, {session?.user?.username}!</h2>
                <p className="text-gray-600">{session?.user?.email}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                  session?.user?.status === 'online' ? 'bg-green-100 text-green-800' :
                  session?.user?.status === 'away' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {session?.user?.status}
                </span>
              </div>
            </div>
            {/* Add your dashboard content here */}
          </div>
        </div>
      </div>
    </div>
  );
} 