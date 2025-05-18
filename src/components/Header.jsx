"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";

const navItems = [
  { label: "ダッシュボード", href: "/" },
  { label: "AI 点数化", href: "/analysis/score" },
  { label: "分析グラフ", href: "/analysis/graphs" },
  { label: "四半期AI比較", href: "/analysis/compare" }, // ← ここ追加
  { label: "総評", href: "/analysis/summary" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <AppBar
      component="header"
      position="sticky"
      elevation={4}
      sx={{
        background: "linear-gradient(90deg, #f5f7fa 60%, #e3eeff 100%)",
        color: "#222",
        backdropFilter: "blur(6px)",
        boxShadow: "0 2px 16px 0 rgba(25, 118, 210, 0.10)",
        borderBottom: "1.5px solid #e3eeff",
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 6 } }}>
        {/* ロゴ＋サービス名 */}
        <DashboardIcon sx={{ color: "primary.main", mr: 1, fontSize: 32 }} />
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            color: "primary.main",
            letterSpacing: 1,
            mr: 4,
            userSelect: "none",
          }}
        >
          GMB レビュー管理
        </Typography>
        {/* ナビゲーション */}
        <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
          {navItems.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Button
                key={href}
                component={Link}
                href={href}
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: isActive ? "primary.main" : "text.primary",
                  borderBottom: isActive
                    ? "2.5px solid"
                    : "2.5px solid transparent",
                  borderColor: isActive ? "primary.main" : "transparent",
                  borderRadius: 0,
                  px: 2,
                  py: 1,
                  transition: "all 0.2s",
                  bgcolor: "transparent",
                  "&:hover": {
                    bgcolor: "#e3eeff88",
                    borderColor: isActive ? "primary.dark" : "primary.light",
                    color: "primary.dark",
                  },
                }}
              >
                {label}
              </Button>
            );
          })}
        </Box>
        {/* 右端：ユーザー/アバター */}
        <Box sx={{ ml: 2 }}>
          <Tooltip title="ユーザーメニュー（ダミー）">
            <IconButton size="large">
              <Avatar sx={{ bgcolor: "primary.main", color: "#fff" }}>U</Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
