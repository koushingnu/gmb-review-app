// src/app/analysis/summary/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

export default function SummaryPage() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/reviews/summary")
      .then(async (res) => {
        if (!res.ok) throw new Error("サマリ取得失敗");
        const { summary } = await res.json();
        setSummary(summary);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography>読み込み中...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        レビュー総評
      </Typography>
      <Typography
        variant="body1"
        component="pre"
        sx={{ whiteSpace: "pre-wrap" }}
      >
        {summary}
      </Typography>
    </Box>
  );
}
