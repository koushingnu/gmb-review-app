"use client";

import React, { useState, useEffect, useMemo } from "react";
import ReviewsList from "@/features/reviews/components/list/ReviewsList";
import DateFilterControls from "@/features/reviews/components/filters/DateFilterControls";
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
  Paper,
  Divider,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import SyncIcon from "@mui/icons-material/Sync";
import RefreshIcon from "@mui/icons-material/Refresh";
import CommentIcon from "@mui/icons-material/Comment";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TuneIcon from "@mui/icons-material/Tune";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import Rating from "@mui/material/Rating";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CompareIcon from "@mui/icons-material/Compare";

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
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  // 年の選択肢を生成（現在の年から3年前まで）
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 4 }, (_, i) => currentYear - i);
  }, []);

  // 四半期の選択肢
  const quarters = [1, 2, 3, 4];

  // 年と四半期のステート
  const [selectedYear, setSelectedYear] = useState(
    year || new Date().getFullYear()
  );
  const [selectedQuarter, setSelectedQuarter] = useState(
    quarter || Math.floor(new Date().getMonth() / 3) + 1
  );

  // 統計情報の計算
  const stats = useMemo(() => {
    if (!reviews.length)
      return {
        total: 0,
        averageRating: 0,
        replied: 0,
        pending: 0,
      };

    const total = reviews.length;
    const averageRating =
      reviews.reduce((acc, rev) => acc + rev.star_rating, 0) / total;
    const replied = reviews.filter((rev) => rev.reply).length;
    const pending = total - replied;

    return { total, averageRating, replied, pending };
  }, [reviews]);

  // 期間文字列をメモ化
  const fromDate = useMemo(() => {
    if (showAll) return null;
    const m = (selectedQuarter - 1) * 3 + 1;
    return `${selectedYear}-${String(m).padStart(2, "0")}-01`;
  }, [selectedYear, selectedQuarter, showAll]);

  const toDate = useMemo(() => {
    if (showAll) return null;
    const m = selectedQuarter * 3;
    const lastDay = new Date(selectedYear, m, 0).getDate();
    return `${selectedYear}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }, [selectedYear, selectedQuarter, showAll]);

  // Googleトークンチェック＆更新（初期マウント時）
  useEffect(() => {
    async function checkGoogleToken() {
      try {
        const res = await fetch("/api/google/token-check");
        if (!res.ok) {
          throw new Error(
            "Googleトークン認証エラー。再ログインが必要かもしれません。"
          );
        }
        const json = await res.json();
        console.log("アクセストークン有効:", json.access_token);
      } catch (e) {
        console.error(e);
        setError(e.message);
      }
    }
    checkGoogleToken();
  }, []);

  // レビュー取得
  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (!showAll && fromDate && toDate) {
        params.set("from", fromDate);
        params.set("to", toDate);
      }

      // ソートパラメータの変換
      let sortParam;
      switch (sortBy) {
        case "newest":
          sortParam = "date_desc";
          break;
        case "oldest":
          sortParam = "date_asc";
          break;
        case "rating_high":
          sortParam = "rating_desc";
          break;
        case "rating_low":
          sortParam = "rating_asc";
          break;
        case "replied_first":
          sortParam = "replied_desc";
          break;
        case "unreplied_first":
          sortParam = "replied_asc";
          break;
        case "longest":
          sortParam = "length_desc";
          break;
        case "shortest":
          sortParam = "length_asc";
          break;
        default:
          sortParam = "date_desc";
      }
      params.set("sortBy", sortParam);

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

  useEffect(() => {
    loadReviews();
  }, [fromDate, toDate, sortBy, filterRating, showAll]);

  // 手動同期
  const handleSync = async () => {
    setLoading(true);
    setError("");
    setNewCount(null);
    try {
      const syncRes = await fetch("/api/reviews/sync");
      const syncJson = await syncRes.json();
      if (!syncRes.ok) {
        throw new Error(syncJson.error || "同期に失敗しました");
      }
      const match = syncJson.message?.match(/(\d+)件更新/);
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
    <Paper
      elevation={2}
      sx={{
        background: "linear-gradient(90deg, #f7fafd 70%, #eef1f8 100%)",
        borderRadius: 2,
        boxShadow: "0 4px 24px rgba(33,42,90,0.08)",
      }}
    >
      {/* フィルター部分 */}
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <DateFilterControls
          onShowAll={setShowAll}
          showAll={showAll}
          onSync={handleSync}
          loading={loading}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </Box>

      <Divider />

      {/* レビュー一覧部分 */}
      <Box>
        {loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mx: 3, mt: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <ReviewsList reviews={reviews} onReviewUpdated={loadReviews} />
        )}
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <AlertSnackbar
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {newCount === 0
            ? "新しいレビューはありません"
            : `${newCount}件のレビューを更新しました`}
        </AlertSnackbar>
      </Snackbar>
    </Paper>
  );
}
