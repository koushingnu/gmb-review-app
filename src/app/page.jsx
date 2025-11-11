// src/app/page.jsx
"use client";

import { Suspense } from "react";
import ReviewsDashboard from "./reviews/page";
import { Box, CircularProgress, Typography, Paper } from "@mui/material";

export default function Page() {
  return (
    <Suspense
      fallback={
        <Paper
          elevation={2}
          sx={{
            background: "linear-gradient(90deg, #f7fafd 70%, #eef1f8 100%)",
            borderRadius: 2,
            boxShadow: "0 4px 24px rgba(33,42,90,0.08)",
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              読み込み中...
            </Typography>
          </Box>
        </Paper>
      }
    >
      <ReviewsDashboard />
    </Suspense>
  );
}
