"use client";

import React from "react";
import { Box, Container, Grid, Typography, Skeleton } from "@mui/material";
import { DashboardGrid } from "@/components/dashboard/layout/DashboardGrid";
import { PendingReviewsCard } from "@/components/dashboard/cards/PendingReviewsCard";
import { colors } from "@/lib/tokens/colors";

export default function DashboardPage() {
  const [stats, setStats] = React.useState(null);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    Promise.all([
      // 基本統計情報
      fetch("/api/reviews/stats").then((res) => res.json()),
      // 四半期データ
      fetch("/api/analysis/quarterly").then((res) => res.json()),
      // 未返信レビュー数
      fetch("/api/reviews/stats/response").then((res) => res.json()),
      // 月間比較データ
      fetch("/api/analysis/monthly").then((res) => res.json()),
    ])
      .then(([statsData, quarterlyData, pendingData, monthlyData]) => {
        if (!statsData || typeof statsData !== "object") {
          throw new Error("統計データの形式が不正です");
        }

        setStats({
          totalReviews: statsData.totalReviews || 0,
          averageRating: statsData.averageRating || 0,
          monthlyReviews: statsData.monthlyReviews || 0,
          monthlyTrend: statsData.monthlyTrend || 0,
          replyRate:
            typeof statsData.replyRate === "number"
              ? Number(statsData.replyRate.toFixed(1))
              : 0,
          quarterlyTrend: Array.isArray(quarterlyData) ? quarterlyData : [],
          monthlyComparison: monthlyData || {
            comparison: {},
            thisMonth: {},
            lastMonth: {},
          },
        });
        setPendingCount(pendingData?.total - pendingData?.responded || 0);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          background: `linear-gradient(135deg, ${colors.orange[50]} 0%, #ffffff 100%)`,
          minHeight: "100vh",
          margin: { xs: -2, sm: -3 },
          width: { xs: "calc(100% + 32px)", sm: "calc(100% + 48px)" },
        }}
      >
        <Container
          disableGutters
          maxWidth={false}
          sx={{
            height: "100%",
          }}
        >
          <Skeleton variant="text" width="200px" height={48} sx={{ mb: 4 }} />
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={400} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={400} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Typography color="error">
          データの取得に失敗しました: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        background: `linear-gradient(135deg, ${colors.orange[50]} 0%, #ffffff 100%)`,
        minHeight: "100vh",
        margin: { xs: -2, sm: -3 },
        width: { xs: "calc(100% + 32px)", sm: "calc(100% + 48px)" },
      }}
    >
      <Container
        disableGutters
        maxWidth={false}
        sx={{
          height: "100%",
          px: { xs: 3, sm: 4, md: 5 },
          py: { xs: 3, sm: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: { xs: 2, sm: 0 },
            mb: { xs: 3, sm: 4 },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem" },
              fontWeight: "bold",
              color: colors.orange[900],
            }}
          >
            ダッシュボード
          </Typography>
          <Box sx={{ minWidth: { xs: "100%", sm: "auto" } }}>
            <PendingReviewsCard count={pendingCount} />
          </Box>
        </Box>

        <DashboardGrid stats={stats} />
      </Container>
    </Box>
  );
}
