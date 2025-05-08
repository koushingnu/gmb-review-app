"use client";
import React, { useEffect, useState } from "react";
import ReviewsList from "./components/ReviewsList";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";

export default function ReviewsDashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("date_desc");
  const [syncMsg, setSyncMsg] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews");
      const { reviews: data, message } = await res.json();
      if (res.ok) setReviews(data);
      else setError(message);
    } catch {
      setError("読み込み失敗");
    }
    setLoading(false);
  };

  const handleSync = async () => {
    const res = await fetch("/api/reviews/sync");
    const { newCount } = await res.json();
    setSyncMsg(`${newCount} 件の新規レビューを同期しました`);
    fetchReviews();
  };

  const sorted = React.useMemo(() => {
    const arr = [...reviews];
    switch (sortBy) {
      case "date_asc":
        return arr.sort(
          (a, b) => new Date(a.create_time) - new Date(b.create_time)
        );
      case "rating_desc":
        return arr.sort((a, b) => b.star_rating - a.star_rating);
      case "rating_asc":
        return arr.sort((a, b) => a.star_rating - b.star_rating);
      default:
        return arr.sort(
          (a, b) => new Date(b.create_time) - new Date(a.create_time)
        );
    }
  }, [reviews, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box maxWidth="800px" mx="auto" py={4}>
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          レビュー管理
        </Typography>
        <FormControl size="small">
          <InputLabel>ソート</InputLabel>
          <Select
            value={sortBy}
            label="ソート"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="date_desc">日時 新→古</MenuItem>
            <MenuItem value="date_asc">日時 古→新</MenuItem>
            <MenuItem value="rating_desc">評価 高→低</MenuItem>
            <MenuItem value="rating_asc">評価 低→高</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSync}>
          同期
        </Button>
      </Box>

      <ReviewsList reviews={sorted} />

      <Snackbar
        open={!!syncMsg}
        autoHideDuration={3000}
        onClose={() => setSyncMsg("")}
      >
        <Alert severity="success">{syncMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
