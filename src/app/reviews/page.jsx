// src/app/reviews/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  const { year, quarter } = useDateFilter();
  const [showAll, setShowAll] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newCount, setNewCount] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // 期間文字列をメモ化
  const fromDate = useMemo(() => {
    const m = (quarter - 1) * 3 + 1;
    return `${year}-${String(m).padStart(2, "0")}-01`;
  }, [year, quarter]);

  const toDate = useMemo(() => {
    const m = quarter * 3;
    const lastDay = new Date(year, m, 0).getDate();
    return `${year}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }, [year, quarter]);

  // レビュー取得
  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (!showAll) {
        params.set("from", fromDate);
        params.set("to", toDate);
      }
      params.set("sortBy", sortBy);
      if (filterRating) params.set("filterRating", filterRating);

      const res = await fetch(`/api/reviews?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Fetch failed");
      setReviews(json.reviews || []);
    } catch (e) {
      console.error("レビュー取得エラー:", e);
      setError(e.message || "レビュー取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // エフェクト：フィルタ変更時のみ実行
  useEffect(() => {
    loadReviews();
  }, [fromDate, toDate, sortBy, filterRating, showAll]);

  // 手動同期
  const handleSyncClick = async () => {
    setLoading(true);
    setError("");
    setNewCount(null);
    try {
      const syncRes = await fetch("/api/reviews/sync");
      const syncJson = await syncRes.json();
      if (!syncRes.ok) throw new Error(syncJson.error || "Sync failed");
      const match = String(syncJson.message).match(/(\d+)/);
      const count = match ? Number(match[1]) : 0;
      setNewCount(count);
      setSnackbarOpen(true);
      await loadReviews();
    } catch (e) {
      console.error("同期エラー:", e);
      setError(e.message || "同期に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>
        レビュー ダッシュボード
      </Typography>

      {/* 期間選択 & 全件表示 */}
      <DateFilterControls onShowAll={setShowAll} showAll={showAll} />

      {/* 同期 & 再読み込み */}
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <Button
          variant="contained"
          onClick={handleSyncClick}
          disabled={loading}
        >
          {loading ? "同期中…" : "手動同期"}
        </Button>
        <Button variant="outlined" onClick={loadReviews} disabled={loading}>
          再読み込み
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

      {/* ソート・評価フィルタ */}
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
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>評価フィルタ</InputLabel>
          <Select
            value={filterRating}
            label="評価フィルタ"
            onChange={(e) => setFilterRating(e.target.value)}
          >
            <MenuItem value="">全て</MenuItem>
            <MenuItem value="4">4 星以上</MenuItem>
            <MenuItem value="3">3 星以上</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ローディング・エラー をソートの下に移動 */}
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

      {/* レビュー一覧 */}
      {!loading && !error && <ReviewsList reviews={reviews} />}
    </Box>
  );
}
