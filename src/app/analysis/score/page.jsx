// src/app/analysis/score/page.jsx
"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";

export default function ScorePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const runScore = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/reviews/score", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "スコア付与に失敗");
      setResult(json.updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box m={4}>
      <Typography variant="h5" gutterBottom>
        AI 点数化
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
        <Typography>
          未スコアのレビューに対して AI
          が「味・接客・価格・立地・衛生面」の点数を 自動で付与します。
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button variant="contained" onClick={runScore} disabled={loading}>
        {loading ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            点数付与中…
          </>
        ) : (
          "スコア付与を実行"
        )}
      </Button>

      {result !== null && (
        <Typography mt={2}>
          {result} 件のレビューに点数を付けました。
        </Typography>
      )}
    </Box>
  );
}
