// src/app/analysis/graphs/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import DateFilterControls from "@/components/DateFilterControls";
import { useDateFilter } from "@/lib/DateFilterContext";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  useTheme,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { supabase } from "@/lib/supabase";

export default function GraphsPage() {
  const theme = useTheme();
  const { from, to, compareFrom, compareTo } = useDateFilter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchScores() {
      try {
        const { data: rows, error: fetchError } = await supabase
          .from("reviews")
          .select(
            "taste_score, service_score, price_score, location_score, hygiene_score"
          )
          .not("taste_score", "is", null);
        if (fetchError) throw fetchError;
        if (!rows || rows.length === 0) {
          setError("スコア付きレビューが見つかりませんでした");
          return;
        }

        const categories = [
          { key: "taste_score", label: "味" },
          { key: "service_score", label: "接客" },
          { key: "price_score", label: "価格" },
          { key: "location_score", label: "立地" },
          { key: "hygiene_score", label: "衛生面" },
        ];

        const avgData = categories.reduce((acc, { key, label }) => {
          const valid = rows
            .map((r) => r[key])
            .filter((v) => v != null && v > 0);
          if (valid.length > 0) {
            const sum = valid.reduce((s, v) => s + v, 0);
            acc.push({
              category: label,
              value: +(sum / valid.length).toFixed(1),
            });
          }
          return acc;
        }, []);

        setData(avgData);
      } catch (e) {
        console.error("グラフデータ取得エラー:", e);
        setError(e.message || "データ取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchScores();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress color="primary" />
        <Typography mt={2} color="text.secondary">
          データ取得中…
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={4}>
        <Alert severity="error">エラー: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box m={4}>
      <Typography variant="h4" gutterBottom>
        レビュー平均スコア 可視化
      </Typography>

      {/* 日付フィルタ + 比較 */}
      <DateFilterControls enableCompare={true} />

      {/* 棒グラフ */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          棒グラフ
        </Typography>
        <Box height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
              />
              <XAxis dataKey="category" tick={{ fontSize: 14 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 14 }} />
              <Tooltip
                wrapperStyle={{ outline: "none", boxShadow: theme.shadows[3] }}
              />
              <Bar
                dataKey="value"
                fill={theme.palette.primary.main}
                cornerRadius={4}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* レーダーチャート */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          レーダーチャート
        </Typography>
        <Box height={400}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="90%">
              <PolarGrid
                gridType="circle"
                stroke={theme.palette.divider}
                strokeDasharray="3 3"
              />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 14 }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 5]} />
              <Radar
                name="平均スコア"
                dataKey="value"
                stroke={theme.palette.primary.dark}
                fill={theme.palette.primary.light}
                fillOpacity={0.6}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
}
