// src/app/analysis/summary/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert, Paper } from "@mui/material";

export default function SummaryPage() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reviews/summary")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch");
        return json;
      })
      .then((data) => setSummary(data.summary))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography mt={2}>総評を生成中…</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={4}>
        <Alert severity="error">エラー: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box m={4}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          レビュー総評
        </Typography>
        <Typography component="div" sx={{ whiteSpace: "pre-wrap", mt: 2 }}>
          {summary}
        </Typography>
      </Paper>
    </Box>
  );
}
