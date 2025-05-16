"use client";
import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  LinearProgress,
  Rating,
} from "@mui/material";

export default function OverallSummary({ summary }) {
  // ダミー値で安全にフォールバック
  const s = summary || {
    totalScore: 0,
    rating: 0,
    metrics: [],
  };

  return (
    <Paper
      elevation={4}
      sx={{
        background: "linear-gradient(90deg, #f7fafd 70%, #eef1f8 100%)",
        px: { xs: 2, sm: 5 },
        py: { xs: 3, sm: 3 },
        borderRadius: 4,
        mb: 5,
        maxWidth: 1200,
        mx: "auto",
        boxShadow: "0 4px 24px rgba(33,42,90,0.08)",
      }}
    >
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        spacing={0}
        sx={{ flexWrap: "nowrap" }}
      >
        {/* 左端：総合点サマリー */}
        <Grid item xs={12} md={2.5} sx={{ minWidth: 150, textAlign: "center" }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "grey.700", fontWeight: 700, mb: 0.5 }}
          >
            総合評価
          </Typography>
          <Typography
            variant="h2"
            fontWeight={900}
            sx={{
              color: "#274472",
              letterSpacing: 1,
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            {s.totalScore}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 0.5,
            }}
          >
            <Rating
              value={s.rating}
              readOnly
              precision={0.1}
              size="large"
              sx={{ color: "#1976d2" }}
            />
            <Typography
              variant="body2"
              sx={{ ml: 1, color: "grey.600", fontWeight: 600 }}
            >
              {s.rating?.toFixed
                ? s.rating.toFixed(1)
                : Number(s.rating).toFixed(1)}
            </Typography>
          </Box>
        </Grid>
        {/* 区切り */}
        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 2, borderColor: "#e3eeff" }}
        />
        {/* 各指標：横並び */}
        <Grid item xs={12} md sx={{ overflowX: "auto" }}>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {(s.metrics || []).map((m) => (
              <Box
                key={m.label}
                sx={{
                  minWidth: 110,
                  p: 1,
                  textAlign: "center",
                  background: "#f8fafc",
                  borderRadius: 2,
                  boxShadow: "0 2px 12px rgba(33,42,90,0.04)",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "primary.main",
                    fontWeight: 700,
                    mb: 0.5,
                    letterSpacing: 1,
                  }}
                >
                  {m.label}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ color: "#274472", mb: 0.5, letterSpacing: 1 }}
                >
                  {m.score?.toFixed
                    ? m.score.toFixed(1)
                    : Number(m.score).toFixed(1)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={m.score * 20}
                  sx={{
                    height: 6,
                    borderRadius: 4,
                    background: "#e3e8f0",
                    "& .MuiLinearProgress-bar": {
                      background: "#1976d2",
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
