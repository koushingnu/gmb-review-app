"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppBar, Toolbar, Box, Button, Typography } from "@mui/material";

const navItems = [
  { label: "ダッシュボード", href: "/" },
  { label: "AI 点数化", href: "/analysis/score" },
  { label: "分析グラフ", href: "/analysis/graphs" },
  { label: "総評", href: "/analysis/summary" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <AppBar component="header" position="static" color="inherit" elevation={1}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          GMB レビュー管理
        </Typography>
        <Box>
          {navItems.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Button
                key={href}
                component={Link}
                href={href}
                sx={{
                  mx: 1,
                  color: isActive ? "primary.main" : "text.primary",
                  borderBottom: isActive
                    ? "2px solid"
                    : "2px solid transparent",
                  borderColor: isActive ? "primary.main" : "transparent",
                  borderRadius: 0,
                  "&:hover": {
                    bgcolor: "transparent",
                    borderColor: isActive ? "primary.dark" : "text.secondary",
                  },
                }}
              >
                {label}
              </Button>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
