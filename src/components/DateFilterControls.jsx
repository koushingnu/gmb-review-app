"use client";
import React from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useDateFilter } from "@/lib/DateFilterContext";

export default function DateFilterControls() {
  const { year, quarter, setYear, setQuarter } = useDateFilter();
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    yearOptions.push(y);
  }

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
      <FormControl size="small">
        <InputLabel id="year-label">年</InputLabel>
        <Select
          labelId="year-label"
          value={year}
          label="年"
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {yearOptions.map((y) => (
            <MenuItem key={y} value={y}>{`${y}年`}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small">
        <InputLabel id="quarter-label">四半期</InputLabel>
        <Select
          labelId="quarter-label"
          value={quarter}
          label="四半期"
          onChange={(e) => setQuarter(Number(e.target.value))}
        >
          {[1, 2, 3, 4].map((q) => (
            <MenuItem key={q} value={q}>{`Q${q}`}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
