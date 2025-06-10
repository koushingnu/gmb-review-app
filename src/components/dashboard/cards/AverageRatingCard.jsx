import React from "react";
import { Paper, Box, Typography, Rating } from "@mui/material";
import { Star as StarIcon } from "@mui/icons-material";
import { colors } from "@/lib/tokens/colors";

export const AverageRatingCard = ({ value }) => {
  const rating = typeof value === "number" ? Number(value.toFixed(1)) : 0;

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
            平均評価
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: colors.orange[700],
                lineHeight: 1.2,
              }}
            >
              {rating}
            </Typography>
            <Rating
              value={rating}
              precision={0.1}
              readOnly
              sx={{
                mt: 1,
                "& .MuiRating-icon": {
                  color: colors.orange[400],
                },
              }}
            />
          </Box>
        </Box>
        <StarIcon
          sx={{
            fontSize: 48,
            color: colors.orange[200],
          }}
        />
      </Box>
    </Paper>
  );
};
