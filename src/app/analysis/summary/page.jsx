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
  Container,
  Grid,
} from "@mui/material";
import { OverallSummary } from "@/features/reviews/components/OverallSummary";
import { LineTrendChart, LABELS } from "@/components/charts/LineTrendChart";
import { useDateFilter } from "@/lib/DateFilterContext";

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
      .then((json) => setAllReviews(json.reviews || []));
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
        background:
          "linear-gradient(135deg, rgba(56, 189, 248, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%)",
        pl: { xs: 2, sm: 3 },
        py: 4,
      }}
    >
      {/* ヘッダー */}
      <Box
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)",
          borderRadius: "20px",
          p: { xs: 2.5, sm: 3 },
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px -12px rgba(14, 165, 233, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          width: "100%",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            background:
              "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
            transform: "skewX(-20deg) translateX(50%)",
            filter: "blur(2px)",
          }}
        />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#fff",
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            fontFamily: '"Inter", "Noto Sans JP", sans-serif',
            mb: 1,
          }}
        >
          レビュー分析サマリー
        </Typography>
        <Typography
          sx={{
            color: "rgba(255, 255, 255, 0.8)",
            fontWeight: 500,
            fontSize: "1.1rem",
      }}
    >
          お客様の声を総合的に分析し、重要なインサイトを提供します
        </Typography>
      </Box>

      {/* スコアサマリー */}
      <Box sx={{ width: "100%", mb: 4 }}>
      <OverallSummary
        summary={{
          totalScore: (() => {
            const vals = Object.values(allAverages)
              .map(Number)
              .filter((v) => !isNaN(v));
            return vals.length
                ? Math.round(
                    (vals.reduce((a, b) => a + b, 0) / vals.length) * 20
                  )
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
      </Box>

      {/* メインコンテンツ */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          background: "white",
          border: "1px solid rgba(99, 102, 241, 0.1)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* タブ */}
        <Box sx={{ borderBottom: "1px solid rgba(99, 102, 241, 0.1)" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
            sx={{
              px: { xs: 2, sm: 3 },
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#64748b",
                "&.Mui-selected": {
                  color: "#0ea5e9",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#0ea5e9",
              },
            }}
        >
          <Tab label="全期間サマリー" />
          <Tab label="四半期ごとサマリー" />
        </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* 四半期選択 */}
        {tab === 1 && (
          <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                flexWrap: "wrap",
                alignItems: "center",
              }}
          >
              <FormControl
                size="small"
                sx={{
                  minWidth: 120,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#0ea5e9",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#0ea5e9",
                    },
                  },
                }}
              >
                <InputLabel>年</InputLabel>
              <Select
                value={year}
                label="年"
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={y}>{`${y}年`}</MenuItem>
                ))}
              </Select>
            </FormControl>
              <FormControl
                size="small"
                sx={{
                  minWidth: 120,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#0ea5e9",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#0ea5e9",
                    },
                  },
                }}
              >
                <InputLabel>四半期</InputLabel>
              <Select
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

          {/* エラー表示 */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: "12px",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.05)",
              }}
            >
              {error}
            </Alert>
          )}

          {/* ローディング */}
        {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 8,
              }}
            >
              <CircularProgress sx={{ color: "#0ea5e9" }} />
          </Box>
        ) : (
            /* サマリーセクション */
          <Box>
              {sections.map((section, i) => (
                <Box
                  key={i}
                  sx={{
                    mb: 3,
                    p: 3,
                    borderRadius: "12px",
                    border: "1px solid rgba(99, 102, 241, 0.1)",
                    background: "rgba(99, 102, 241, 0.02)",
                    "&:hover": {
                      background: "rgba(99, 102, 241, 0.05)",
                      transform: "translateY(-2px)",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: "#1e293b",
                      mb: 2,
                    }}
                  >
                    {section.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#334155",
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {section.content}
                  </Typography>
                </Box>
              ))}
            </Box>
            )}
          </Box>
      </Paper>
    </Box>
  );
}
