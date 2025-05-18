// src/app/analysis/graphs/page.jsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import OverallSummary from "@/components/OverallSummary";
import { Box, Typography, Paper, Divider } from "@mui/material";
import LineTrendChart, { LABELS } from "@/components/LineTrendChart";
import MetricSelector from "@/components/MetricSelector";
import BalanceRadarChart from "@/components/BalanceRadarChart";
import RatingDistributionChart from "@/components/RatingDistributionChart";
import { useDateFilter } from "@/lib/DateFilterContext";

export default function GraphPage() {
  const { year, quarter, setYear, setQuarter } = useDateFilter();
  const [data, setData] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareYear, setCompareYear] = useState(year - 1);
  const [compareQuarter, setCompareQuarter] = useState(quarter);

  // トレンド表示する項目を初期化（全部ON）
  const allKeys = Object.keys(LABELS);
  const [selectedMetrics, setSelectedMetrics] = useState(allKeys);
  const toggleMetric = (key) => {
    setSelectedMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // 四半期データ取得
  useEffect(() => {
    fetch(`/api/analysis/quarterly?year=${year}&quarter=${quarter}`)
      .then((res) => res.json())
      .then((json) => setData(json || []));
  }, [year, quarter]);

  // 全レビュー取得
  useEffect(() => {
    fetch("/api/reviews?all=1")
      .then((res) => res.json())
      .then((json) => setAllReviews(json || []));
  }, []);

  // 全期間平均値の計算（グラフ用）
  const allAverages = useMemo(() => {
    if (!allReviews.length) return {};

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

    return result;
  }, [allReviews]);

  // --- ★ 全期間「すごいUI」点数サマリー生成 ---
  const summaryData = useMemo(() => {
    if (!allReviews.length) {
      return {
        totalScore: 0,
        rating: 0,
        metrics: Object.entries(LABELS).map(([k, v]) => ({
          label: v.label,
          score: 0,
        })),
      };
    }
    // 各項目ごとに平均
    const metrics = Object.entries(LABELS).map(([avgKey, { label }]) => {
      const scoreKey = avgKey.replace("_avg", "_score");
      const vals = allReviews
        .map((r) => Number(r[scoreKey]))
        .filter((v) => typeof v === "number" && !isNaN(v) && v > 0);
      const avg = vals.length
        ? vals.reduce((a, b) => a + b, 0) / vals.length
        : 0;
      return { label, score: avg };
    });
    // 総合点＝各項目の平均値の平均（5点満点→100点にスケール）
    const avgScore =
      metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length;
    return {
      totalScore: Math.round(avgScore * 20), // 100点満点で表示
      rating: avgScore,
      metrics,
    };
  }, [allReviews]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#f5f7fa 0%,#e3eeff 100%)",
        px: { xs: 1, sm: 4, md: 8 },
        py: { xs: 2, sm: 4, md: 6 },
      }}
    >
      {/* === 総合評価サマリー（全期間）=== */}
      <OverallSummary summary={summaryData} />

      {/* === グラフUIカード === */}
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          mt: 2,
          mb: 5,
          p: { xs: 2, sm: 4 },
          borderRadius: 5,
          background: "#fff",
          boxShadow: "0 4px 24px rgba(25, 118, 210, 0.10)",
        }}
      >
        <Typography
          variant="h5"
          fontWeight={800}
          color="primary.main"
          sx={{ mb: 2, letterSpacing: 1 }}
        >
          四半期スコア分析・グラフ
        </Typography>

        {/* MetricSelector */}
        <MetricSelector selected={selectedMetrics} onToggle={toggleMetric} />

        <Divider sx={{ my: 3, borderColor: "#e3eeff" }} />

        {/* 折れ線グラフ */}
        <Box sx={{ width: "100%", height: 380, mb: 5 }}>
          <LineTrendChart
            data={data}
            selectedMetrics={selectedMetrics}
            allAverages={allAverages}
          />
        </Box>

        {/* レーダーチャート＋評価分布を横並び */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            width: "100%",
            flexWrap: { xs: "wrap", md: "nowrap" },
            mb: 4,
          }}
        >
          <Paper
            elevation={1}
            sx={{
              flex: 1,
              minWidth: 260,
              minHeight: 320,
              p: 2,
              borderRadius: 3,
              background: "#f7fafc",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={800}
              color="primary.main"
              mb={1}
            >
              項目別バランス（レーダー）
            </Typography>
            <BalanceRadarChart
              data={data}
              mainYear={year}
              mainQuarter={quarter}
              compareMode={comparisonMode}
              compareYear={compareYear}
              compareQuarter={compareQuarter}
            />
          </Paper>

          <Paper
            elevation={1}
            sx={{
              flex: 1,
              minWidth: 260,
              minHeight: 320,
              p: 2,
              borderRadius: 3,
              background: "#f7fafc",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={800}
              color="primary.main"
              mb={1}
            >
              ☆5段階評価分布
            </Typography>
            <RatingDistributionChart />
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
