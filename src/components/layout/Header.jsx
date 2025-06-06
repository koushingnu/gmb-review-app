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
  Container,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  SvgIcon,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuIcon from "@mui/icons-material/Menu";
import BarChartIcon from "@mui/icons-material/BarChart";
import SummarizeIcon from "@mui/icons-material/Summarize";
import CompareIcon from "@mui/icons-material/Compare";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useState } from "react";

const navItems = [
  { label: "ダッシュボード", href: "/", icon: <DashboardIcon /> },
  { label: "分析グラフ", href: "/analysis/graphs", icon: <BarChartIcon /> },
  { label: "総評", href: "/analysis/summary", icon: <SummarizeIcon /> },
  { label: "四半期AI比較", href: "/analysis/compare", icon: <CompareIcon /> },
];

const AppLogo = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
    <path d="M7 12h2v5H7zm8-5h2v10h-2zm-4 7h2v3h-2zm0-4h2v2h-2z" />
  </SvgIcon>
);

export default function Header() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <List>
        {navItems.map(({ label, href, icon }) => (
          <ListItem
            key={href}
            component={Link}
            href={href}
            selected={pathname === href}
            onClick={handleDrawerToggle}
            sx={{
              borderRadius: 2,
              mx: 1,
              mb: 1,
              color: pathname === href ? "primary.main" : "text.primary",
              bgcolor: pathname === href ? "primary.lighter" : "transparent",
              "&:hover": {
                bgcolor: pathname === href ? "primary.lighter" : "action.hover",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: pathname === href ? "primary.main" : "text.secondary",
                minWidth: 40,
              }}
            >
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={label}
              primaryTypographyProps={{
                fontSize: "0.9rem",
                fontWeight: pathname === href ? 600 : 500,
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar
      component="header"
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          sx={{
            minHeight: { xs: 64, md: 72 },
            px: { xs: 2, md: 3 },
            gap: 2,
          }}
        >
          {isMobile && (
            <IconButton
              color="primary"
              aria-label="メニューを開く"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                display: { md: "none" },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: "pointer",
              textDecoration: "none",
              position: "relative",
              py: 1,
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "1px",
                background:
                  "linear-gradient(90deg, rgba(234, 88, 12, 0.2) 0%, rgba(194, 65, 12, 0.2) 50%, rgba(234, 88, 12, 0) 100%)",
                borderRadius: "1px",
              },
            }}
            component={Link}
            href="/"
          >
            <DashboardIcon
              sx={{
                fontSize: { xs: 28, md: 32 },
                transition: "all 0.3s ease",
                fill: "url(#logoGradient)",
                filter: "drop-shadow(0 2px 4px rgba(234, 88, 12, 0.2))",
                animation: "gradientShift 3s ease infinite",
                "&:hover": {
                  transform: "scale(1.05) translateY(-1px)",
                },
                "@keyframes gradientShift": {
                  "0%": {
                    filter: "drop-shadow(0 2px 4px rgba(234, 88, 12, 0.2))",
                  },
                  "50%": {
                    filter: "drop-shadow(0 2px 6px rgba(194, 65, 12, 0.3))",
                  },
                  "100%": {
                    filter: "drop-shadow(0 2px 4px rgba(234, 88, 12, 0.2))",
                  },
                },
              }}
            />
            <svg width="0" height="0">
              <defs>
                <linearGradient
                  id="logoGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#c2410c" />
                </linearGradient>
              </defs>
            </svg>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "1.1rem", md: "1.25rem" },
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  background:
                    "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 2px 10px rgba(234, 88, 12, 0.2)",
                  mb: 0.3,
                  fontFamily: '"Inter", "Noto Sans JP", sans-serif',
                }}
              >
                GMB レビュー管理
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: "0.7rem", md: "0.75rem" },
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  background:
                    "linear-gradient(135deg, rgba(234, 88, 12, 0.8) 0%, rgba(194, 65, 12, 0.8) 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  opacity: 0.9,
                  fontFamily: '"Noto Sans JP", sans-serif',
                }}
              >
                Google My Business Review Dashboard
              </Typography>
            </Box>
          </Box>

          {!isMobile && (
            <Box
              sx={{
                ml: 4,
                display: "flex",
                gap: { xs: 1, md: 2 },
                alignItems: "center",
              }}
            >
              {navItems.map(({ label, href, icon }) => (
                <Button
                  key={href}
                  component={Link}
                  href={href}
                  startIcon={icon}
                  sx={{
                    minHeight: 40,
                    px: 2.5,
                    py: 1,
                    color: pathname === href ? "#f97316" : "text.primary",
                    fontWeight: pathname === href ? 600 : 500,
                    fontSize: "0.9rem",
                    fontFamily: '"Noto Sans JP", sans-serif',
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        pathname === href
                          ? "linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(194, 65, 12, 0.08) 100%)"
                          : "transparent",
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: -1,
                      left: "10%",
                      width: "80%",
                      height: 2,
                      background: "linear-gradient(90deg, #f97316, #c2410c)",
                      transform: pathname === href ? "scaleX(1)" : "scaleX(0)",
                      transformOrigin: "left center",
                      transition: "transform 0.3s ease",
                      borderRadius: "2px",
                    },
                    "&:hover": {
                      bgcolor: "transparent",
                      "&::before": {
                        background:
                          "linear-gradient(135deg, rgba(234, 88, 12, 0.05) 0%, rgba(194, 65, 12, 0.05) 100%)",
                      },
                      "&::after": {
                        transform: "scaleX(1)",
                      },
                      "& .MuiSvgIcon-root": {
                        transform: "translateY(-1px)",
                      },
                    },
                    "& .MuiSvgIcon-root": {
                      transition: "transform 0.3s ease",
                      fontSize: "1.2rem",
                      background:
                        pathname === href
                          ? "linear-gradient(135deg, #f97316 0%, #c2410c 100%)"
                          : "none",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor:
                        pathname === href ? "transparent" : "inherit",
                    },
                  }}
                >
                  {label}
                </Button>
              ))}
            </Box>
          )}

          <Box
            sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2 }}
          >
            {!isMobile && (
              <Button
                component={Link}
                href="/admin"
                startIcon={<AdminPanelSettingsIcon />}
                variant="contained"
                sx={{
                  background:
                    "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  px: 3,
                  py: 1.2,
                  borderRadius: "12px",
                  fontFamily: '"Noto Sans JP", sans-serif',
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 2px 12px rgba(234, 88, 12, 0.2)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 16px rgba(234, 88, 12, 0.3)",
                  },
                  "& .MuiSvgIcon-root": {
                    fontSize: "1.2rem",
                    transition: "transform 0.3s ease",
                  },
                  "&:hover .MuiSvgIcon-root": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                管理者
              </Button>
            )}

            <Tooltip title="ユーザーメニュー">
              <IconButton
                onClick={handleMenu}
                size="small"
                sx={{
                  p: 0.5,
                  border: "2px solid",
                  borderColor: "transparent",
                  background:
                    "linear-gradient(135deg, rgba(234, 88, 12, 0.1) 0%, rgba(194, 65, 12, 0.1) 100%)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(234, 88, 12, 0.15) 0%, rgba(194, 65, 12, 0.15) 100%)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background:
                      "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  U
                </Avatar>
              </IconButton>
            </Tooltip>
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
                  borderColor: "rgba(234, 88, 12, 0.1)",
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
                  "& .MuiMenuItem-root": {
                    fontSize: "0.9rem",
                    py: 1.2,
                    px: 2,
                    fontFamily: '"Noto Sans JP", sans-serif',
                    color: "text.primary",
                    transition: "all 0.2s ease",
                    position: "relative",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(194, 65, 12, 0.08) 100%)",
                      color: "#f97316",
                    },
                    "&:not(:last-child)": {
                      borderBottom: "1px solid",
                      borderColor: "rgba(234, 88, 12, 0.08)",
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem
                component={Link}
                href="/profile"
                sx={{
                  "&:hover .MuiSvgIcon-root": {
                    transform: "translateX(4px)",
                  },
                }}
              >
                プロフィール
              </MenuItem>
              <MenuItem
                component={Link}
                href="/settings"
                sx={{
                  "&:hover .MuiSvgIcon-root": {
                    transform: "translateX(4px)",
                  },
                }}
              >
                設定
              </MenuItem>
              <MenuItem
                sx={{
                  color: "#ef4444 !important",
                  "&:hover": {
                    background: "rgba(239, 68, 68, 0.08) !important",
                  },
                  "&:hover .MuiSvgIcon-root": {
                    transform: "translateX(4px)",
                  },
                }}
              >
                ログアウト
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            width: 280,
            borderRight: "none",
            boxShadow: "4px 0 24px rgba(0, 0, 0, 0.05)",
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}
