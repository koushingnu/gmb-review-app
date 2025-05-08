// src/app/components/Footer.js
"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        textAlign: "center",
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Typography variant="body2">© 2025 GMB レビュー管理</Typography>
    </Box>
  );
}
