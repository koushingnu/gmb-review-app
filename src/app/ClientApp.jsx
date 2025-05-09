// src/app/ClientApp.jsx
"use client";

import React from "react";
import Providers from "./providers";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { usePathname } from "next/navigation";
import { Container } from "@mui/material";

export default function ClientApp({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  return (
    <Providers>
      {!isAuthPage && <Header />}

      <Container
        maxWidth="xl" //  xs | sm | md | lg | xl から選べる
        sx={{ flex: 1, py: 4 }}
      >
        {children}
      </Container>

      {!isAuthPage && <Footer />}
    </Providers>
  );
}
