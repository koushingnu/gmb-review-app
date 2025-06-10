import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function QuarterlyTrendCard() {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("四半期データの取得を開始");
        const response = await fetch("/api/analysis/quarterly");

        if (!response.ok) {
          throw new Error(`データの取得に失敗しました (${response.status})`);
        }

        const result = await response.json();
        console.log("四半期データのレスポンス:", result);

        if (!Array.isArray(result)) {
          console.warn("四半期データが配列ではありません:", result);
          setData([]);
          return;
        }

        if (result.length === 0) {
          console.warn("四半期データが空です");
          setData([]);
          return;
        }

        console.log("四半期データの処理完了:", {
          期間数: result.length,
          最新: result[result.length - 1],
          最古: result[0],
        });

        setData(result);
      } catch (err) {
        console.error("四半期データの取得エラー:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card
        sx={{
          height: "100%",
          maxHeight: 420,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        sx={{
          height: "100%",
          maxHeight: 420,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card
        sx={{
          height: "100%",
          maxHeight: 420,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="text.secondary">データがありません</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: "100%",
        maxHeight: 420,
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(8px)",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 24px 0 rgba(34, 41, 47, 0.1)",
      }}
    >
      <CardContent sx={{ height: "100%", p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            評価の推移
          </Typography>
          <Typography variant="caption" color="text.secondary">
            四半期ごとの評価推移（{data.length}期分）
          </Typography>
        </Box>

        <Box sx={{ height: "calc(100% - 60px)", width: "100%" }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.grey[100]}
              />
              <XAxis
                dataKey={(v) => {
                  const quarterToMonth = {
                    1: "1-3月",
                    2: "4-6月",
                    3: "7-9月",
                    4: "10-12月",
                  };
                  return `${v.year}年${quarterToMonth[v.quarter]}`;
                }}
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                stroke={theme.palette.grey[200]}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis
                domain={[3, 5]}
                ticks={[3, 3.5, 4, 4.5, 5]}
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                stroke={theme.palette.grey[200]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  padding: "12px",
                }}
                labelStyle={{
                  fontSize: 12,
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
                labelFormatter={(value, entry) => {
                  const data = entry[0]?.payload;
                  if (!data) return value;
                  const quarterToMonth = {
                    1: "1月～3月",
                    2: "4月～6月",
                    3: "7月～9月",
                    4: "10月～12月",
                  };
                  return `${data.year}年 ${quarterToMonth[data.quarter]}`;
                }}
                formatter={(value) => [`${value}点`, "評価"]}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: theme.palette.primary.main,
                  strokeWidth: 2,
                  stroke: theme.palette.background.paper,
                }}
                activeDot={{
                  r: 6,
                  stroke: theme.palette.background.paper,
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
