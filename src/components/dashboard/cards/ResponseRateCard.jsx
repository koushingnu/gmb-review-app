import React from "react";
import { Paper, Box, Typography, CircularProgress } from "@mui/material";
import { Reply as ReplyIcon } from "@mui/icons-material";
import { colors } from "@/lib/tokens/colors";

export const ResponseRateCard = ({ value }) => {
  const rate = typeof value === "number" ? Number(value.toFixed(1)) : 0;

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
            返信率
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: colors.orange[700],
                lineHeight: 1.2,
              }}
            >
              {rate}%
            </Typography>
            <Box sx={{ position: "relative", width: 40, height: 40 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={40}
                thickness={4}
                sx={{
                  color: colors.gray[200],
                  position: "absolute",
                  left: 0,
                  "& .MuiCircularProgress-circle": {
                    strokeLinecap: "round",
                  },
                }}
              />
              <CircularProgress
                variant="determinate"
                value={rate}
                size={40}
                thickness={4}
                sx={{
                  color: colors.orange[400],
                  position: "absolute",
                  left: 0,
                  "& .MuiCircularProgress-circle": {
                    strokeLinecap: "round",
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
        <ReplyIcon
          sx={{
            fontSize: 48,
            color: colors.orange[200],
          }}
        />
      </Box>
    </Paper>
  );
};
