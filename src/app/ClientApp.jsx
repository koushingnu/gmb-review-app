// src/app/ClientApp.jsx
"use client";

import Providers from "./providers";
import dynamic from "next/dynamic";
// Header はクライアントサイド専用コンポーネント
const Header = dynamic(() => import("@/components/Header"), { ssr: false });
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import { DateFilterProvider } from "@/lib/DateFilterContext";

export default function ClientApp({ children }) {
  const pathname = usePathname();
  const hideNav = pathname === "/login" || pathname === "/signup";

  return (
    <Providers>
      <DateFilterProvider>
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
      </DateFilterProvider>
    </Providers>
  );
}
