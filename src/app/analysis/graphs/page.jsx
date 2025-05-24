"use client";
import React, { useState, useEffect, useMemo } from "react";
import OverallSummary from "@/components/OverallSummary";
import {
  Box,
  Typography,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";
import LineTrendChart, { LABELS } from "@/components/LineTrendChart";
import MetricSelector from "@/components/MetricSelector";
import BalanceRadarChart from "@/components/BalanceRadarChart";
import RatingDistributionChart from "@/components/RatingDistributionChart";

// 現在の年・四半期を自動計算
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const getQuarter = (month) => Math.floor((month - 1) / 3) + 1;
const currentQuarter = getQuarter(currentMonth);

export default function GraphPage() {
  // 年・四半期選択肢
  const [year, setYear] = useState(currentYear);
  const [quarter, setQuarter] = useState(currentQuarter);
  // 全期間表示フラグ
  const [allPeriod, setAllPeriod] = useState(false);

  const [data, setData] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareYear, setCompareYear] = useState(currentYear - 1);
  const [compareQuarter, setCompareQuarter] = useState(currentQuarter);

  const allKeys = Object.keys(LABELS);
  const [selectedMetrics, setSelectedMetrics] = useState(allKeys);
  const toggleMetric = (key) => {
    setSelectedMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // 年・四半期or全期間の切替でデータ取得
  useEffect(() => {
    if (allPeriod) {
      // 全期間の場合
      fetch(`/api/analysis/quarterly`)
        .then((res) => res.json())
        .then((json) => setData(Array.isArray(json) ? json : []));
    } else {
      fetch(`/api/analysis/quarterly?year=${year}&quarter=${quarter}`)
        .then((res) => res.json())
        .then((json) => setData(Array.isArray(json) ? json : []));
    }
  }, [year, quarter, allPeriod]);

  useEffect(() => {
    fetch("/api/reviews?all=1")
      .then((res) => res.json())
      .then((json) => setAllReviews(json.reviews || []));
  }, []);

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
    const avgScore =
      metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length;
    return {
      totalScore: Math.round(avgScore * 20),
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
      <OverallSummary summary={summaryData} />

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
        {/* 年・四半期＋全期間ボタン */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 120 }} disabled={allPeriod}>
            <InputLabel>年</InputLabel>
            <Select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              label="年"
            >
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <MenuItem value={y} key={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }} disabled={allPeriod}>
            <InputLabel>四半期</InputLabel>
            <Select
              value={quarter}
              onChange={(e) => setQuarter(Number(e.target.value))}
              label="四半期"
            >
              {[1, 2, 3, 4].map((q) => (
                <MenuItem value={q} key={q}>
                  {q} - {q * 3}月
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant={allPeriod ? "contained" : "outlined"}
            color="primary"
            onClick={() => setAllPeriod((prev) => !prev)}
            sx={{
              height: 48,
              px: 3,
              fontWeight: 700,
              ml: 2,
              bgcolor: allPeriod ? "primary.main" : "#fff",
            }}
          >
            {allPeriod ? "全期間表示中" : "全期間"}
          </Button>
        </Stack>

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

        {/* レーダーチャート＋評価分布 */}
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
              {allPeriod && "（全期間平均）"}
            </Typography>
            <BalanceRadarChart
              data={
                allPeriod
                  ? // 全期間なら平均を各指標で構成した1件配列で渡す
                    [
                      Object.entries(LABELS).reduce(
                        (acc, [avgKey, { label }]) => {
                          acc[label] = Number(allAverages[avgKey]) || 0;
                          return acc;
                        },
                        {}
                      ),
                    ]
                  : data
              }
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
