// src/app/analysis/graphs/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
} from "@mui/material";
import { useDateFilter } from "@/lib/DateFilterContext";
import LineTrendChart from "@/components/LineTrendChart";
import BalanceRadarChart from "@/components/BalanceRadarChart";

export default function GraphPage() {
  const { year, quarter, setYear, setQuarter } = useDateFilter();
  const [data, setData] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareYear, setCompareYear] = useState(year - 1);
  const [compareQuarter, setCompareQuarter] = useState(quarter);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const quarterOptions = [
    { value: 1, label: "1〜3月" },
    { value: 2, label: "4〜6月" },
    { value: 3, label: "7〜9月" },
    { value: 4, label: "10〜12月" },
  ];

  useEffect(() => {
    fetch(`/api/analysis/quarterly?year=${year}&quarter=${quarter}`)
      .then((res) => res.json())
      .then((json) => setData(json || []));
  }, [year, quarter]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        四半期スコア分析
      </Typography>

      {/* 期間・比較モードコントロール */}
      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 4, borderRadius: 2, width: "100%" }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
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
            <InputLabel id="quarter-label">期間</InputLabel>
            <Select
              labelId="quarter-label"
              value={quarter}
              label="期間"
              onChange={(e) => setQuarter(Number(e.target.value))}
            >
              {quarterOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={comparisonMode}
                onChange={(e) => setComparisonMode(e.target.checked)}
              />
            }
            label="比較モード"
          />
          {comparisonMode && (
            <>
              <FormControl size="small">
                <InputLabel id="compare-year-label">比較年</InputLabel>
                <Select
                  labelId="compare-year-label"
                  value={compareYear}
                  label="比較年"
                  onChange={(e) => setCompareYear(Number(e.target.value))}
                >
                  {yearOptions.map((y) => (
                    <MenuItem key={y} value={y}>{`${y}年`}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel id="compare-quarter-label">比較期間</InputLabel>
                <Select
                  labelId="compare-quarter-label"
                  value={compareQuarter}
                  label="比較期間"
                  onChange={(e) => setCompareQuarter(Number(e.target.value))}
                >
                  {quarterOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </Box>
      </Paper>

      {/* チャート２つを等分して横並び */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 4,
          width: "100%",
        }}
      >
        {/* 左チャート */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            height: 400,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" gutterBottom>
            月ごとの5項目スコア推移
          </Typography>
          <Box sx={{ flex: 1 }}>
            <LineTrendChart data={data} />
          </Box>
        </Paper>

        {/* 右チャート */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            height: 400,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" gutterBottom>
            項目別スコアバランス
          </Typography>
          <Box sx={{ flex: 1 }}>
            <BalanceRadarChart
              data={data}
              mainYear={year}
              mainQuarter={quarter}
              compareMode={comparisonMode}
              compareYear={compareYear}
              compareQuarter={compareQuarter}
            />
          </Box>
        </Paper>
      </Box>

      {/* AIによる総評パネル */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, width: "100%" }}>
        <Typography variant="subtitle1" gutterBottom>
          AIによる四半期総評
        </Typography>
        <Typography>
          {`${year}年度 Q${quarter}は「味」のスコアが前年同四半期より向上しましたが、「接客」はやや低下傾向にあります。改善優先度は接客対応です。`}
        </Typography>
      </Paper>
    </Box>
  );
}
