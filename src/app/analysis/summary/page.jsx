// src/app/analysis/summary/page.jsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Tabs,
  Tab,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import OverallSummary from "@/components/OverallSummary";
import { useDateFilter } from "@/lib/DateFilterContext";
import { LABELS } from "@/components/LineTrendChart";

// summaryTextを「【観点】」ごとに分割するヘルパー
function parseSections(summaryText) {
  const matches = summaryText.match(/【[^】]+】[\s\S]*?(?=(【|$))/g);
  if (!matches) return [];
  return matches.map((section) => {
    const titleMatch = section.match(/【([^】]+)】/);
    const title = titleMatch ? titleMatch[1] : "";
    const content = section.replace(/【[^】]+】/, "").trim();
    return { title, content };
  });
}

export default function SummaryPage() {
  const { year, quarter, setYear, setQuarter } = useDateFilter();
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0);
  const [allReviews, setAllReviews] = useState([]);
  const [allAverages, setAllAverages] = useState({});

  // 年・四半期選択肢
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const quarterOptions = [
    { value: 1, label: "1〜3月" },
    { value: 2, label: "4〜6月" },
    { value: 3, label: "7〜9月" },
    { value: 4, label: "10〜12月" },
  ];

  // 全レビュー取得（全期間スコア算出用）
  useEffect(() => {
    fetch("/api/reviews?all=1")
      .then((res) => res.json())
      .then((json) => setAllReviews(json || []));
  }, []);

  // 平均値算出
  useEffect(() => {
    if (!allReviews.length) return;
    const keys = Object.keys(LABELS);
    const result = {};
    keys.forEach((avgKey) => {
      const scoreKey = avgKey.replace("_avg", "_score");
      const vals = allReviews
        .map((r) => Number(r[scoreKey]))
        .filter((v) => typeof v === "number" && !isNaN(v) && v > 0);
      result[avgKey] = vals.length
        ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
        : null;
    });
    setAllAverages(result);
  }, [allReviews]);

  // 総評取得（全期間 or 四半期指定）
  useEffect(() => {
    setLoading(true);
    setError("");
    let url = "/api/reviews/summary";
    if (tab === 1) {
      // 四半期モードでfrom/to生成
      const m = (quarter - 1) * 3 + 1;
      const from = `${year}-${String(m).padStart(2, "0")}-01`;
      const toMonth = quarter * 3;
      const lastDay = new Date(year, toMonth, 0).getDate();
      const to = `${year}-${String(toMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      url += `?from=${from}&to=${to}`;
    }
    fetch(url)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch");
        return json;
      })
      .then((data) => setSummary(data.summary))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tab, year, quarter]);

  // 観点ごとセクション分割
  const sections = useMemo(() => parseSections(summary), [summary]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#f5f7fa 0%,#e3eeff 100%)",
        px: { xs: 1, sm: 4, md: 8 },
        py: { xs: 2, sm: 4, md: 6 },
      }}
    >
      {/* スコアも連動表示 */}
      <OverallSummary
        summary={{
          totalScore: (() => {
            const vals = Object.values(allAverages)
              .map(Number)
              .filter((v) => !isNaN(v));
            return vals.length
              ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 20)
              : 0;
          })(),
          rating: (() => {
            const vals = Object.values(allAverages)
              .map(Number)
              .filter((v) => !isNaN(v));
            return vals.length
              ? vals.reduce((a, b) => a + b, 0) / vals.length
              : 0;
          })(),
          metrics: Object.entries(LABELS).map(([k, v]) => ({
            label: v.label,
            score: Number(allAverages[k]) || 0,
          })),
        }}
      />

      <Paper
        elevation={4}
        sx={{
          maxWidth: 900,
          mx: "auto",
          mb: 5,
          p: { xs: 2, sm: 4 },
          borderRadius: 5,
          background: "#fff",
          boxShadow: "0 4px 24px rgba(25, 118, 210, 0.10)",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 2 }}
        >
          <Tab label="全期間サマリー" />
          <Tab label="四半期ごとサマリー" />
        </Tabs>

        {/* --- 四半期モードなら期間選択 --- */}
        {tab === 1 && (
          <Box
            sx={{ display: "flex", gap: 2, mb: 2, mt: 1, alignItems: "center" }}
          >
            <FormControl size="small">
              <InputLabel id="year-label">年</InputLabel>
              <Select
                labelId="year-label"
                value={year}
                label="年"
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={y}>{`${y}年`}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel id="quarter-label">四半期</InputLabel>
              <Select
                labelId="quarter-label"
                value={quarter}
                label="四半期"
                onChange={(e) => setQuarter(Number(e.target.value))}
              >
                {quarterOptions.map((q) => (
                  <MenuItem key={q.value} value={q.value}>
                    {q.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box textAlign="center" my={6}>
            <CircularProgress />
            <Typography mt={2}>総評を生成中…</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            エラー: {error}
          </Alert>
        ) : (
          <Box>
            {sections.length ? (
              sections.map(({ title, content }) => (
                <Paper
                  key={title}
                  elevation={0}
                  sx={{
                    bgcolor: "#f8fafc",
                    p: 3,
                    borderRadius: 3,
                    mb: 3,
                    boxShadow: "0 2px 8px rgba(33,42,90,0.04)",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    color="primary.main"
                    fontWeight={800}
                    gutterBottom
                    sx={{ letterSpacing: 1 }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.primary"
                    sx={{ whiteSpace: "pre-line", fontSize: 17 }}
                  >
                    {content}
                  </Typography>
                </Paper>
              ))
            ) : (
              <Typography color="text.secondary">
                AI総評がありません。
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
