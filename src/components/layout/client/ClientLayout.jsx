"use client";

import React, { useState } from "react";
import { Box, IconButton, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar";

const ClientLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#F8FAFC",
      }}
    >
      {/* モバイル用ハンバーガーメニュー */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1300,
          p: 1,
          display: { xs: "block", md: "none" },
        }}
      >
        <IconButton
          onClick={toggleSidebar}
          sx={{
            color: "primary.main",
            bgcolor: "white",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              bgcolor: "white",
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* サイドバー */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          ml: { xs: 0, md: "240px" },
          width: { xs: "100%", md: "calc(100% - 240px)" },
          minHeight: "100vh",
          position: "relative",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default ClientLayout;
