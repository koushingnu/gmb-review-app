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
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import { supabase } from "@/lib/supabase";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// 月別トレンドとレーダーデータを生成するユーティリティ
function computeMonthlyTrend(rows) {
  // 年-月キーでグループ化
  const map = {};
  rows.forEach((r) => {
    const dt = new Date(r.create_time);
    const ym = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    if (!map[ym])
      map[ym] = {
        month: ym,
        taste: [],
        service: [],
        price: [],
        location: [],
        hygiene: [],
      };
    map[ym].taste.push(r.taste_score);
    map[ym].service.push(r.service_score);
    map[ym].price.push(r.price_score);
    map[ym].location.push(r.location_score);
    map[ym].hygiene.push(r.hygiene_score);
  });
  // 平均化
  return Object.values(map)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((grp) => ({
      month: grp.month,
      味: +(grp.taste.reduce((s, v) => s + v, 0) / grp.taste.length).toFixed(1),
      接客: +(
        grp.service.reduce((s, v) => s + v, 0) / grp.service.length
      ).toFixed(1),
      価格: +(grp.price.reduce((s, v) => s + v, 0) / grp.price.length).toFixed(
        1
      ),
      立地: +(
        grp.location.reduce((s, v) => s + v, 0) / grp.location.length
      ).toFixed(1),
      衛生面: +(
        grp.hygiene.reduce((s, v) => s + v, 0) / grp.hygiene.length
      ).toFixed(1),
    }));
}

function computeRadarData(rows) {
  const cats = [
    { key: "taste_score", label: "味" },
    { key: "service_score", label: "接客" },
    { key: "price_score", label: "価格" },
    { key: "location_score", label: "立地" },
    { key: "hygiene_score", label: "衛生面" },
  ];
  return cats.map(({ key, label }) => {
    const vals = rows.map((r) => r[key]).filter((v) => v > 0);
    const avg = vals.length
      ? +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1)
      : 0;
    return { category: label, value: avg };
  });
}

export default function GraphsPage() {
  const theme = useTheme();
  const now = new Date();
  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId] = useState(null);

  // 選択状態
  const [yearMonthA, setYearMonthA] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  const [compareMode, setCompareMode] = useState(false);
  const [yearMonthB, setYearMonthB] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  // データ
  const [trendData, setTrendData] = useState(null);
  const [radarA, setRadarA] = useState(null);
  const [radarB, setRadarB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 店舗リスト取得
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("locations")
        .select("id,resource_name");
      setLocations(data || []);
      if (data && data.length && !locationId) setLocationId(data[0].id);
    })();
  }, []);

  // データ取得
  useEffect(() => {
    if (!locationId) return;
    setLoading(true);
    setError("");
    (async () => {
      try {
        // 総期間: 過去6ヶ月分
        const toDate = new Date(yearMonthA.year, yearMonthA.month, 0);
        const fromDate = new Date(toDate);
        fromDate.setMonth(toDate.getMonth() - 5);
        const { data: rows } = await supabase
          .from("reviews")
          .select(
            "taste_score,service_score,price_score,location_score,hygiene_score,create_time"
          )
          .eq("location_id", locationId)
          .gte("create_time", fromDate.toISOString())
          .lte("create_time", toDate.toISOString());
        const trend = computeMonthlyTrend(rows);
        setTrendData(trend);

        // 月別レーダー
        const aStart = new Date(
          yearMonthA.year,
          yearMonthA.month - 1,
          1
        ).toISOString();
        const aEnd = new Date(
          yearMonthA.year,
          yearMonthA.month,
          0
        ).toISOString();
        const { data: rowsA } = await supabase
          .from("reviews")
          .select(
            "taste_score,service_score,price_score,location_score,hygiene_score,create_time"
          )
          .eq("location_id", locationId)
          .gte("create_time", aStart)
          .lte("create_time", aEnd);
        setRadarA(computeRadarData(rowsA));

        if (compareMode) {
          const bStart = new Date(
            yearMonthB.year,
            yearMonthB.month - 1,
            1
          ).toISOString();
          const bEnd = new Date(
            yearMonthB.year,
            yearMonthB.month,
            0
          ).toISOString();
          const { data: rowsB } = await supabase
            .from("reviews")
            .select(
              "taste_score,service_score,price_score,location_score,hygiene_score,create_time"
            )
            .eq("location_id", locationId)
            .gte("create_time", bStart)
            .lte("create_time", bEnd);
          setRadarB(computeRadarData(rowsB));
        } else {
          setRadarB(null);
        }
      } catch (e) {
        console.error(e);
        setError(e.message || "データ取得エラー");
      } finally {
        setLoading(false);
      }
    })();
  }, [locationId, yearMonthA, yearMonthB, compareMode]);

  if (loading)
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">エラー: {error}</Alert>;

  // ドロップダウン用年/月リスト
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Box m={4}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <FormControl size="small">
          <InputLabel>期間</InputLabel>
          <Select
            value={`${yearMonthA.year}-${yearMonthA.month}`}
            label="期間"
            onChange={(e) => {
              const [y, m] = e.target.value.split("-").map(Number);
              setYearMonthA({ year: y, month: m });
            }}
          >
            {years.map((y) =>
              months.map((m) => (
                <MenuItem
                  key={`${y}-${m}`}
                  value={`${y}-${m}`}
                >{`${y}年 ${m}月`}</MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
            />
          }
          label="比較モード"
        />

        {compareMode && (
          <FormControl size="small">
            <InputLabel>比較期間</InputLabel>
            <Select
              value={`${yearMonthB.year}-${yearMonthB.month}`}
              label="比較期間"
              onChange={(e) => {
                const [y, m] = e.target.value.split("-").map(Number);
                setYearMonthB({ year: y, month: m });
              }}
            >
              {years.map((y) =>
                months.map((m) => (
                  <MenuItem
                    key={`${y}-${m}`}
                    value={`${y}-${m}`}
                  >{`${y}年 ${m}月`}</MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}

        <FormControl size="small">
          <InputLabel>店舗</InputLabel>
          <Select
            value={locationId}
            label="店舗"
            onChange={(e) => setLocationId(e.target.value)}
          >
            {locations.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.resource_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box display="flex" gap={4} flexWrap="wrap">
        <Paper sx={{ flex: 1, p: 2 }}>
          <Typography variant="h6">月ごとの5項目スコア推移</Typography>
          <Box height={300}>
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid stroke={theme.palette.divider} />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="味"
                  stroke={theme.palette.primary.main}
                />
                <Line
                  type="monotone"
                  dataKey="接客"
                  stroke={theme.palette.info.main}
                />
                <Line
                  type="monotone"
                  dataKey="価格"
                  stroke={theme.palette.success.main}
                />
                <Line
                  type="monotone"
                  dataKey="立地"
                  stroke={theme.palette.warning.main}
                />
                <Line
                  type="monotone"
                  dataKey="衛生面"
                  stroke={theme.palette.error.main}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        <Paper sx={{ flex: 1, p: 2 }}>
          <Typography variant="h6">項目別スコアバランス</Typography>
          <Box height={300}>
            <ResponsiveContainer>
              <RadarChart data={radarA}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis domain={[0, 5]} tick={false} />
                <Radar
                  name={`${yearMonthA.year}年${yearMonthA.month}月`}
                  dataKey="value"
                  stroke={theme.palette.primary.dark}
                  fill={theme.palette.primary.light}
                  fillOpacity={0.6}
                />
                {compareMode && radarB && (
                  <Radar
                    name={`${yearMonthB.year}年${yearMonthB.month}月`}
                    dataKey="value"
                    stroke={theme.palette.error.dark}
                    fill={theme.palette.error.light}
                    fillOpacity={0.6}
                  />
                )}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>

      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6">AIによる月別総評</Typography>
        <Typography>{/* AI分析結果を表示 */}</Typography>
      </Paper>
    </Box>
  );
}
