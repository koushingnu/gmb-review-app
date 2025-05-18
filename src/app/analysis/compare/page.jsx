"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RemoveIcon from "@mui/icons-material/Remove";

// 年月選択値生成
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);
const quarterOptions = [
  { value: 1, label: "1〜3月" },
  { value: 2, label: "4〜6月" },
  { value: 3, label: "7〜9月" },
  { value: 4, label: "10〜12月" },
];

// 日付範囲取得
function getQuarterDates(year, quarter) {
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = quarter * 3;
  const from = `${year}-${String(startMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(year, endMonth, 0).getDate();
  const to = `${year}-${String(endMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

const LABELS = {
  taste_avg: "味",
  service_avg: "接客",
  price_avg: "価格",
  location_avg: "店内環境",
};

export default function QuarterlyComparePage() {
  const [year1, setYear1] = useState(currentYear);
  const [quarter1, setQuarter1] = useState(1);
  const [year2, setYear2] = useState(currentYear);
  const [quarter2, setQuarter2] = useState(2);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // ==== AIサマリー ====
  const [aiSummary, setAISummary] = useState("");
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState("");

  const handleCompare = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setAISummary("");
    setAIError("");

    const { from: from1, to: to1 } = getQuarterDates(year1, quarter1);
    const { from: from2, to: to2 } = getQuarterDates(year2, quarter2);

    try {
      // 1. スコア比較取得（既存のAPI）
      const res = await fetch(
        `/api/analysis/quarterly_compare?from1=${from1}&to1=${to1}&from2=${from2}&to2=${to2}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "比較データ取得失敗");
      setResult(json);

      // 2. AIサマリー取得（レビュー本文・増減値・期間情報も送信）
      setAILoading(true);
      setAISummary("");
      setAIError("");

      // スコア増減値
      const deltaTaste = json.diffs.taste_avg ?? 0;
      const deltaService = json.diffs.service_avg ?? 0;
      const deltaPrice = json.diffs.price_avg ?? 0;
      const deltaLocation = json.diffs.location_avg ?? 0;

      const aiParams = new URLSearchParams({
        from1,
        to1,
        from2,
        to2,
        delta_taste: String(Number(deltaTaste).toFixed(2)),
        delta_service: String(Number(deltaService).toFixed(2)),
        delta_price: String(Number(deltaPrice).toFixed(2)),
        delta_location: String(Number(deltaLocation).toFixed(2)),
      });

      const aiRes = await fetch(
        `/api/reviews/compare-summary?${aiParams.toString()}`
      );
      const aiJson = await aiRes.json();
      if (!aiRes.ok) throw new Error(aiJson.error || "AI分析取得失敗");
      setAISummary(aiJson.summary);
    } catch (err) {
      setError(err.message || "比較に失敗しました");
    } finally {
      setLoading(false);
      setAILoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#f5f7fa 0%,#e3eeff 100%)",
        px: { xs: 1, sm: 4, md: 8 },
        py: { xs: 2, sm: 4, md: 6 },
      }}
    >
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
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
          四半期データ比較・AI分析
        </Typography>

        {/* 四半期比較選択 */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} md={5}>
            <FormControl size="small" sx={{ minWidth: 100, mr: 2 }}>
              <InputLabel>年</InputLabel>
              <Select
                value={year1}
                label="年"
                onChange={(e) => setYear1(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={y}>{`${y}年`}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>四半期</InputLabel>
              <Select
                value={quarter1}
                label="四半期"
                onChange={(e) => setQuarter1(Number(e.target.value))}
              >
                {quarterOptions.map((q) => (
                  <MenuItem key={q.value} value={q.value}>
                    {q.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2} sx={{ textAlign: "center" }}>
            <Typography sx={{ fontWeight: 600, fontSize: 18 }}>⇄</Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <FormControl size="small" sx={{ minWidth: 100, mr: 2 }}>
              <InputLabel>年</InputLabel>
              <Select
                value={year2}
                label="年"
                onChange={(e) => setYear2(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={y}>{`${y}年`}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>四半期</InputLabel>
              <Select
                value={quarter2}
                label="四半期"
                onChange={(e) => setQuarter2(Number(e.target.value))}
              >
                {quarterOptions.map((q) => (
                  <MenuItem key={q.value} value={q.value}>
                    {q.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCompare}
          disabled={loading || aiLoading}
          sx={{ mt: 1, mb: 2, fontWeight: 800, letterSpacing: 2 }}
        >
          比較・AI分析
        </Button>

        <Divider sx={{ my: 3 }} />

        {loading && (
          <Box textAlign="center" my={4}>
            <CircularProgress />
            <Typography mt={2}>データ取得中…</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            エラー: {error}
          </Alert>
        )}

        {result && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              スコア比較表
            </Typography>
            {/* ==== テーブル表示 ==== */}
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                overflowX: "auto",
                mb: 3,
                bgcolor: "#f7fafd",
                p: 2,
                borderRadius: 3,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        width: 110,
                        textAlign: "left",
                        padding: 8,
                        fontWeight: 700,
                      }}
                    >
                      項目
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: 8,
                        fontWeight: 700,
                        color: "#1976d2",
                      }}
                    >
                      {result.quarter1.label}
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: 8,
                        fontWeight: 700,
                        color: "#02885d",
                      }}
                    >
                      {result.quarter2.label}
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: 8,
                        fontWeight: 700,
                      }}
                    >
                      増減
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(LABELS).map((k) => {
                    const diff = result.diffs[k];
                    let diffColor = "text.secondary";
                    let DiffIcon = RemoveIcon;
                    if (diff > 0) {
                      diffColor = "success.main";
                      DiffIcon = ArrowUpwardIcon;
                    } else if (diff < 0) {
                      diffColor = "error.main";
                      DiffIcon = ArrowDownwardIcon;
                    }
                    return (
                      <tr
                        key={k}
                        style={{ borderBottom: "1.5px solid #e3eeff" }}
                      >
                        <td
                          style={{ padding: 8, fontWeight: 600, fontSize: 16 }}
                        >
                          {LABELS[k]}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: 8,
                            fontSize: 16,
                          }}
                        >
                          {result.quarter1[k] != null
                            ? Number(result.quarter1[k]).toFixed(1)
                            : "-"}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: 8,
                            fontSize: 16,
                          }}
                        >
                          {result.quarter2[k] != null
                            ? Number(result.quarter2[k]).toFixed(1)
                            : "-"}
                        </td>
                        <td style={{ textAlign: "center", padding: 8 }}>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              bgcolor: "#fff",
                              px: 1.5,
                              py: 0.3,
                              borderRadius: 2,
                              fontWeight: 700,
                              color: diffColor,
                              minWidth: 60,
                              justifyContent: "center",
                              boxShadow: "0 1px 5px #e3eeff90",
                              fontSize: 15,
                            }}
                          >
                            {diff > 0 && "+"}
                            {diff != null ? Number(diff).toFixed(1) : "-"}
                            <DiffIcon
                              sx={{
                                fontSize: 18,
                                ml: 0.5,
                                color: diffColor,
                                verticalAlign: "middle",
                              }}
                            />
                          </Box>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Paper>

            {/* ==== AIサマリー表示 ==== */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              AI分析サマリー
            </Typography>
            {aiLoading ? (
              <Box textAlign="center" my={4}>
                <CircularProgress />
                <Typography mt={2}>AI分析を実行中…</Typography>
              </Box>
            ) : aiError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                AI分析サマリー: {aiError}
              </Alert>
            ) : aiSummary ? (
              <Paper
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
                  variant="body1"
                  color="text.primary"
                  sx={{ whiteSpace: "pre-line", fontSize: 17 }}
                >
                  {aiSummary}
                </Typography>
              </Paper>
            ) : null}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
