"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ReviewsDashboard from "./ReviewsDashboard"; // 先ほどのレビュー画面を分割

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  // user がロード中 or null の間は何も表示せず
  if (!user) return null;

  return <ReviewsDashboard />;
}
