"use client";

import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import LoadingScreen from "../common/LoadingScreen";

export default function ClientLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f8fafc",
        }}
      />
    );
  }

  return (
    <>
      <LoadingScreen />
      {children}
    </>
  );
}
