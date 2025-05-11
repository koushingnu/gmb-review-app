// src/app/reviews/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import ReviewsList from "@/components/ReviewsList";
import DateFilterControls from "@/components/DateFilterControls";
import { useDateFilter } from "@/lib/DateFilterContext";
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
  const { from, to } = useDateFilter();
  const [reviews, setReviews] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newCount, setNewCount] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // API からレビューを取得（サーバー側でフィルタ・ソートを適用）
  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (from?.year && from?.month) {
        params.set(
          "from",
          `${from.year}-${String(from.month).padStart(2, "0")}-01`
        );
      }
      if (to?.year && to?.month) {
        // ここで「月の最終日」を取得
        const lastDay = new Date(to.year, to.month, 0).getDate();
        params.set(
          "to",
          `${to.year}-${String(to.month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
        );
      }
      // ソートと評価フィルタをパラメータに追加
      params.set("sortBy", sortBy);
      if (filterRating) {
        params.set("filterRating", filterRating);
      }

      const res = await fetch(`/api/reviews?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Fetch failed");
      }
      setReviews(json.reviews || []);
    } catch (e) {
      console.error("レビュー取得エラー:", e);
      setError(e.message || "レビュー取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 初回ロード & パラメータ変更時に再取得
  useEffect(() => {
    loadReviews();
  }, [from, to, sortBy, filterRating]);

  // 手動同期
  const handleSyncClick = async () => {
    setLoading(true);
    setError("");
    setNewCount(null);
    try {
      const syncRes = await fetch("/api/reviews/sync");
      const syncJson = await syncRes.json();
      if (!syncRes.ok) {
        throw new Error(syncJson.error || "Sync failed");
      }
      const match = String(syncJson.message).match(/(\d+) 件/);
      const count = match ? Number(match[1]) : 0;
      setNewCount(count);
      setSnackbarOpen(true);
      await loadReviews();
    } catch (e) {
      console.error("同期エラー:", e);
      setError(e.message || "同期に失敗しました");
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

      {/* 日付フィルタ */}
      <DateFilterControls />

      {/* 手動同期 */}
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

      {/* 通知 */}
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

      {/* フィルタ/ソート */}
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

      {/* レビューリスト表示 */}
      {!loading && !error && <ReviewsList reviews={reviews} />}
    </Box>
  );
}
