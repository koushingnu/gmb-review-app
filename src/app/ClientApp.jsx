// src/app/ClientApp.jsx
"use client";

import React from "react";
import Providers from "./providers";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { usePathname } from "next/navigation";

export default function ClientApp({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  return (
    <AuthProvider>
      <Providers>
        {/* ログインページ以外ではヘッダー表示 */}
        {!isAuthPage && <Header />}

        <main
          style={{
            flex: 1,
            width: "100%",
            maxWidth: 960,
            margin: "0 auto",
            padding: "1rem",
          }}
        >
          {children}
        </main>

        {/* ログインページ以外ではフッター表示 */}
        {!isAuthPage && <Footer />}
      </Providers>
    </AuthProvider>
  );
}
