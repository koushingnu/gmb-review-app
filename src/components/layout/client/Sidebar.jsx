import React, { useState, useEffect } from "react";

import {
  Box,
  IconButton,
  List,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Paper,
} from "@mui/material";
import { gradients } from "../../../lib/tokens/colors";
import {
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  RateReview as RateReviewIcon,
  Reviews as ReviewsIcon,
  Settings as SettingsIcon,
  Store as StoreIcon,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import BarChartIcon from "@mui/icons-material/BarChart";
import SummarizeIcon from "@mui/icons-material/Summarize";
import CompareIcon from "@mui/icons-material/Compare";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import StarIcon from "@mui/icons-material/Star";
import ChatIcon from "@mui/icons-material/Chat";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "ダッシュボード", href: "/dashboard", icon: <DashboardIcon /> },
  { label: "口コミ一覧", href: "/", icon: <RateReviewIcon /> },
  { label: "分析グラフ", href: "/analysis/graphs", icon: <BarChartIcon /> },
  { label: "総評", href: "/analysis/summary", icon: <SummarizeIcon /> },
  { label: "四半期AI比較", href: "/analysis/compare", icon: <CompareIcon /> },
];

export default function Sidebar({
  isSidebarOpen,
  toggleSidebar,
  isMenuOpen,
  setIsMenuOpen,
}) {
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageScore: 0,
    replyRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/reviews/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      component="aside"
      sx={{
        width: "240px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: isSidebarOpen ? 0 : -240,
        bgcolor: "white",
        borderRight: "1px solid rgba(0, 0, 0, 0.06)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1200,
        transition: "left 0.3s ease-in-out",
        boxShadow: { xs: "4px 0 8px rgba(0, 0, 0, 0.1)", md: "none" },
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          height: "100%",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0, 0, 0, 0.02)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0, 0, 0, 0.1)",
            borderRadius: "2px",
          },
        }}
      >
        {/* アプリロゴ */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            component={Link}
            href="/"
            sx={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 1,
              ml: -1,
            }}
          >
            <Box
              sx={{
                borderRadius: "12px",
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DashboardIcon
                sx={{
                  fontSize: "2.2rem",
                  color: "primary.main",
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: gradients.primary.default,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "160px",
                }}
              >
                GMB Review
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={toggleSidebar}
            sx={{
              display: { xs: "flex", md: "none" },
              color: "primary.main",
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.75rem",
            pl: 0,
            mt: -3,
          }}
        >
          口コミ管理システム
        </Typography>

        {/* ナビゲーションメニュー */}
        <List sx={{ py: 0 }}>
          {/* メニューヘッダー */}
          <ListItemButton
            sx={{
              py: 0.5,
              mt: 2,
              mb: 1,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              color: "primary.main",
              width: "auto",
              minWidth: "unset",
              ml: "-56px",
              pl: "51px",
              "&:hover": {
                bgcolor: "primary.lighter",
              },
            }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <ChevronRightIcon
              sx={{
                transform: isMenuOpen ? "rotate(90deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                ml: 1,
              }}
            >
              メニュー
            </Typography>
          </ListItemButton>

          {/* メニューアイテム */}
          <Box
            sx={{
              height: isMenuOpen ? "auto" : 0,
              overflow: "hidden",
              visibility: isMenuOpen ? "visible" : "hidden",
              transition: "all 0.2s ease-in-out",
              transform: isMenuOpen ? "translateY(0)" : "translateY(-20px)",
              opacity: isMenuOpen ? 1 : 0,
              mb: isMenuOpen ? 2 : 0,
            }}
          >
            {navItems.map((item) => (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                selected={pathname === item.href}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  color:
                    pathname === item.href ? "primary.main" : "text.primary",
                  bgcolor:
                    pathname === item.href ? "primary.lighter" : "transparent",
                  "&:hover": {
                    bgcolor: "primary.lighter",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color:
                      pathname === item.href
                        ? "primary.main"
                        : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: pathname === item.href ? 600 : 500,
                  }}
                />
              </ListItemButton>
            ))}
          </Box>
        </List>

        {/* 統計カード */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
            }}
          >
            統計情報
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid rgba(0, 0, 0, 0.06)",
              borderRadius: 2,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(253, 186, 116, 0.2) 100%)",
                }}
              >
                <StarIcon sx={{ color: "#f97316" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {isLoading ? "-" : stats.averageScore.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  平均評価
                </Typography>
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid rgba(0, 0, 0, 0.06)",
              borderRadius: 2,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(253, 186, 116, 0.2) 100%)",
                }}
              >
                <RateReviewIcon sx={{ color: "#f97316" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {isLoading ? "-" : stats.totalReviews}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  レビュー数
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* 返信状況 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
            }}
          >
            返信状況
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid rgba(0, 0, 0, 0.06)",
              borderRadius: 2,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(253, 186, 116, 0.2) 100%)",
                }}
              >
                <ChatIcon sx={{ color: "#f97316" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {isLoading ? "-" : `${stats.replyRate}%`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  返信率
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* 管理者ボタンとユーザーメニュー */}
        <Box sx={{ mt: "auto", pt: 2 }}>
          <Button
            component={Link}
            href="/admin"
            startIcon={<AdminPanelSettingsIcon />}
            variant="contained"
            fullWidth
            sx={{
              mb: 2,
              background: gradients.primary.default,
              color: "white",
              fontWeight: 600,
              fontSize: "0.9rem",
              py: 1.2,
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 2px 12px rgba(249, 115, 22, 0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: gradients.primary.hover,
                transform: "translateY(-1px)",
                boxShadow: "0 4px 16px rgba(249, 115, 22, 0.3)",
              },
            }}
          >
            管理者
          </Button>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title="ユーザーメニュー">
              <IconButton
                onClick={handleMenu}
                size="small"
                sx={{
                  p: 0.5,
                  border: "2px solid",
                  borderColor: "transparent",
                  background:
                    "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(253, 186, 116, 0.08) 100%)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(253, 186, 116, 0.1) 100%)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: gradients.primary.default,
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  U
                </Avatar>
              </IconButton>
            </Tooltip>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                ユーザー名
              </Typography>
              <Typography variant="caption" color="text.secondary">
                user@example.com
              </Typography>
            </Box>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "rgba(249, 115, 22, 0.1)",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
                "& .MuiMenuItem-root": {
                  fontSize: "0.9rem",
                  py: 1.2,
                  px: 2,
                  color: "text.primary",
                  transition: "all 0.2s ease",
                  position: "relative",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(253, 186, 116, 0.08) 100%)",
                    color: "#f97316",
                  },
                  "&:not(:last-child)": {
                    borderBottom: "1px solid",
                    borderColor: "rgba(249, 115, 22, 0.08)",
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem component={Link} href="/profile">
              プロフィール
            </MenuItem>
            <MenuItem component={Link} href="/settings">
              設定
            </MenuItem>
            <MenuItem
              sx={{
                color: "#ef4444 !important",
                "&:hover": {
                  background: "rgba(239, 68, 68, 0.08) !important",
                },
              }}
            >
              ログアウト
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
}
