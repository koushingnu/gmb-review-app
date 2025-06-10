import React from "react";
import { Paper, Box, Typography } from "@mui/material";
import { RateReview as ReviewIcon } from "@mui/icons-material";
import { colors } from "@/lib/tokens/colors";

export const TotalReviewsCard = ({ value }) => {
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
            総レビュー数
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: colors.orange[700],
              lineHeight: 1.2,
            }}
          >
            {value.toLocaleString()}
          </Typography>
        </Box>
        <ReviewIcon
          sx={{
            fontSize: 48,
            color: colors.orange[200],
          }}
        />
      </Box>
    </Paper>
  );
};
