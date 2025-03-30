"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";



export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/chat");
    }
  }, [status, router]);

  return (
  <>
  <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-4xl font-bold">Welcome to the Inbox</h1>
    <p className="text-lg">Please sign in to continue</p>
    <Link href="/signin">
    <button  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
      Sign In
    </button>
    </Link>
  </div>
  </>
)
}
