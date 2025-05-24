// src/app/ClientApp.jsx
"use client";

import Providers from "./providers";
import dynamic from "next/dynamic";
// Header はクライアントサイド専用コンポーネント
const Header = dynamic(() => import("@/components/Header"), { ssr: false });
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function ClientApp({ children }) {
  const pathname = usePathname();
  const hideNav = pathname === "/login" || pathname === "/signup";

  return (
    <Providers>
      {!hideNav && <Header />}
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "1rem",
        }}
      >
        {children}
      </main>
      {!hideNav && <Footer />}
    </Providers>
  );
}
