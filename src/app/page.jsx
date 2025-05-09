"use client";

import React from "react";
import ClientApp from "./ClientApp"; // ← ヘッダー／フッターを出すラッパー
import ReviewsDashboard from "./ReviewsDashboard";

export default function Page() {
  return (
    <ClientApp>
      <ReviewsDashboard />
    </ClientApp>
  );
}
