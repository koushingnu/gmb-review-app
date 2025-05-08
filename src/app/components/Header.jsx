// src/app/components/Header.jsx
"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export default function Header() {
  return (
    <AppBar position="static" enableColorOnDark>
      <Toolbar>
        {/* 左寄せはデフォルトで OK */}
        <Typography variant="h6" component="div">
          GMB レビュー管理
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
