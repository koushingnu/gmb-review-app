// src/app/components/Footer.jsx
"use client";
import React from "react";
import { Box, Typography, Link, IconButton } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        background: "linear-gradient(90deg, #f5f7fa 60%, #e3eeff 100%)",
        borderTop: "1.5px solid #e3eeff",
        py: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 6 },
        mt: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: { xs: "center", sm: "space-between" },
        flexWrap: "wrap",
        fontSize: 15,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          letterSpacing: 0.5,
          mb: { xs: 1, sm: 0 },
          fontWeight: 500,
        }}
      >
        © {new Date().getFullYear()} GMB Review Dashboard | All Rights
        Reserved.
      </Typography>
      <Box>
        <IconButton
          component={Link}
          href="https://github.com/yourrepo" // 必要に応じて
          target="_blank"
          rel="noopener"
          sx={{
            color: "primary.main",
            ml: 2,
            "&:hover": { color: "primary.dark" },
          }}
        >
          <GitHubIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
