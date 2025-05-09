// src/app/reviews/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import ReviewsList from "@/components/ReviewsList";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";

// Snackbar 用アラート
const AlertSnackbar = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function ReviewsDashboard() {
  const [reviews, setReviews] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newCount, setNewCount] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // API からレビューを取得
  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews");
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Fetch failed");
      let list = json.reviews || [];
      // ソート処理
      if (sortBy === "newest") {
        list.sort((a, b) => new Date(b.create_time) - new Date(a.create_time));
      } else {
        list.sort((a, b) => b.star_rating - a.star_rating);
      }
      // 評価フィルタ処理
      if (filterRating) {
        list = list.filter((r) => r.star_rating >= Number(filterRating));
      }
      setReviews(list);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // マウント時に最初のデータ取得
  useEffect(() => {
    loadReviews();
  }, []);

  // 手動同期と再取得
  const handleSyncClick = async () => {
    setLoading(true);
    setError("");
    setNewCount(null);
    try {
      const syncRes = await fetch("/api/reviews/sync");
      const syncJson = await syncRes.json();
      if (!syncRes.ok) throw new Error(syncJson.error || "Sync failed");
      const match = String(syncJson.message).match(/(\d+) 件/);
      const count = match ? Number(match[1]) : 0;
      setNewCount(count);
      setSnackbarOpen(true);
      await loadReviews();
    } catch (e) {
      console.error(e);
      setError(e.message);
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <Box m={4}>
      <Typography variant="h4" gutterBottom>
        レビュー一覧
      </Typography>

      {/* 手動同期ボタン */}
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <Button
          variant="outlined"
          onClick={handleSyncClick}
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? "同期中…" : "手動同期"}
        </Button>
      </Box>

      {/* 新規件数通知 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <AlertSnackbar onClose={handleSnackbarClose} severity="success">
          新規レビューを {newCount} 件同期しました
        </AlertSnackbar>
      </Snackbar>

      {/* ローディング・エラー */}
      {loading && (
        <Box textAlign="center" my={4}>
          <CircularProgress />
          <Typography mt={2}>レビュー取得中…</Typography>
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* フィルタ／ソートエリア */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>ソート</InputLabel>
          <Select
            value={sortBy}
            label="ソート"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="newest">新着順</MenuItem>
            <MenuItem value="highest">評価順</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>評価フィルタ</InputLabel>
          <Select
            value={filterRating}
            label="評価フィルタ"
            onChange={(e) => setFilterRating(e.target.value)}
          >
            <MenuItem value="">全て</MenuItem>
            <MenuItem value="5">5 星</MenuItem>
            <MenuItem value="4">4 星以上</MenuItem>
            <MenuItem value="3">3 星以上</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" onClick={loadReviews} disabled={loading}>
          再読み込み
        </Button>
      </Box>

      {/* レビューリスト */}
      {!loading && !error && <ReviewsList reviews={reviews} />}
    </Box>
  );
}
