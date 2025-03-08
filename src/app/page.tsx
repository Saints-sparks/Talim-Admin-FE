"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/talimadmindashboard"); // Redirect to login page on load
  }, [router]);

  return null; // Prevents any other content from rendering
}
