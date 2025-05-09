// src/app/components/Footer.jsx
"use client";

import React from "react";
import { Box, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        mt: 4,
        bgcolor: "background.paper",
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        &copy; {new Date().getFullYear()} Your Company.
      </Typography>
      <Link
        href="https://github.com/koushingnu/gmb-review-app"
        target="_blank"
        rel="noopener"
      >
        GitHub
      </Link>
    </Box>
  );
}
