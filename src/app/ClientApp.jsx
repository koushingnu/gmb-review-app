// src/app/ClientApp.jsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Providers from "./providers";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function ClientApp({ children }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  return (
    <Providers>
      {/* ログイン／サインアップページ以外だけ表示 */}
      {!isAuthPage && <Header />}

      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 1200, // ダッシュボードなど広く使うなら1200pxに
          margin: "0 auto",
          padding: "1rem",
        }}
      >
        {children}
      </main>

      {!isAuthPage && <Footer />}
    </Providers>
  );
}
