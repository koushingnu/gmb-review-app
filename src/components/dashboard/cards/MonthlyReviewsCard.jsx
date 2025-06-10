import React from "react";
import { Paper, Box, Typography } from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import { colors } from "@/lib/tokens/colors";

export const MonthlyReviewsCard = ({ value, trend }) => {
  const reviewCount = typeof value === "number" ? value : 0;
  const trendValue = typeof trend === "number" ? Number(trend.toFixed(1)) : 0;
  const isPositive = trendValue >= 0;
  const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;
  const trendColor = isPositive ? colors.green[500] : colors.red[500];

  return (
    <Paper
      sx={{
        p: 3,
        height: "100%",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(8px)",
        borderRadius: 2,
        boxShadow: "0 4px 24px 0 rgba(34, 41, 47, 0.1)",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 6px 30px 0 rgba(34, 41, 47, 0.15)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: colors.gray[600],
              mb: 1,
            }}
          >
            今月のレビュー
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: colors.orange[700],
                lineHeight: 1.2,
              }}
            >
              {reviewCount}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: trendColor,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <TrendIcon sx={{ fontSize: 20 }} />
              {Math.abs(trendValue)}%
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: colors.gray[500],
              mt: 1,
              display: "block",
            }}
          >
            先月比
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
