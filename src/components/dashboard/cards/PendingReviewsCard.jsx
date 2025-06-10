import React from "react";
import { Paper, Box, Typography, Badge } from "@mui/material";
import { Comment as CommentIcon } from "@mui/icons-material";
import { colors } from "@/lib/tokens/colors";

export const PendingReviewsCard = ({ count }) => {
  return (
    <Paper
      sx={{
        p: 3,
        height: "100%",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(8px)",
        borderRadius: 2,
        boxShadow: "0 4px 24px 0 rgba(34, 41, 47, 0.1)",
        cursor: "pointer",
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
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: colors.gray[700],
          }}
        >
          未返信レビュー
        </Typography>
        <Badge
          badgeContent={count}
          color="error"
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.75rem",
              height: "1.5rem",
              minWidth: "1.5rem",
              fontWeight: 600,
            },
          }}
        >
          <CommentIcon
            sx={{
              fontSize: 28,
              color: colors.gray[400],
            }}
          />
        </Badge>
      </Box>
    </Paper>
  );
};
