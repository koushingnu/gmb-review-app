import React from "react";
import { Box } from "@mui/material";
import { TotalReviewsCard } from "../cards/TotalReviewsCard";
import { AverageRatingCard } from "../cards/AverageRatingCard";
import { MonthlyReviewsCard } from "../cards/MonthlyReviewsCard";
import { ResponseRateCard } from "../cards/ResponseRateCard";
import { QuarterlyTrendCard } from "../cards/QuarterlyTrendCard";
import MonthlyComparisonCard from "../cards/MonthlyComparisonCard";

export const DashboardGrid = ({ stats }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 2, sm: 2.5, md: 3 },
      }}
    >
      {/* 上部の4つのカード */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: { xs: 2, sm: 2.5 },
        }}
      >
        <TotalReviewsCard value={stats.totalReviews} />
        <AverageRatingCard value={stats.averageRating} />
        <MonthlyReviewsCard
          value={stats.monthlyReviews}
          trend={stats.monthlyTrend}
        />
        <ResponseRateCard value={stats.replyRate} />
      </Box>

      {/* 下部の2つのカード */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "3fr 1fr",
          },
          gap: { xs: 2, sm: 2.5 },
        }}
      >
        <Box sx={{ minHeight: { xs: 300, sm: 400 } }}>
          <QuarterlyTrendCard data={stats.quarterlyTrend} />
        </Box>
        <Box sx={{ minHeight: { xs: 300, sm: 400 } }}>
          <MonthlyComparisonCard data={stats.monthlyComparison} />
        </Box>
      </Box>
    </Box>
  );
};
