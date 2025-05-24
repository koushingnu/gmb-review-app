"use client";
import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { useDateFilter } from "@/lib/DateFilterContext";

export default function DateFilterControls({ onShowAll, showAll }) {
  const { year, quarter, setYear, setQuarter } = useDateFilter();
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    yearOptions.push(y);
  }

  const quarterOptions = [
    { value: 1, label: "1〜3月" },
    { value: 2, label: "4〜6月" },
    { value: 3, label: "7〜9月" },
    { value: 4, label: "10〜12月" },
  ];

  const handleYearChange = (e) => {
    setYear(Number(e.target.value));
    onShowAll(false);
  };
  const handleQuarterChange = (e) => {
    setQuarter(Number(e.target.value));
    onShowAll(false);
  };

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 4, alignItems: "center" }}>
      <FormControl size="small">
        <InputLabel id="year-label">年</InputLabel>
        <Select
          labelId="year-label"
          value={year}
          label="年"
          onChange={handleYearChange}
          disabled={showAll}
        >
          {yearOptions.map((y) => (
            <MenuItem key={y} value={y}>
              {`${y}年`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small">
        <InputLabel id="quarter-label">期間</InputLabel>
        <Select
          labelId="quarter-label"
          value={quarter}
          label="期間"
          onChange={handleQuarterChange}
          disabled={showAll}
        >
          {quarterOptions.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant={showAll ? "contained" : "outlined"}
        onClick={() => onShowAll(!showAll)}
      >
        {showAll ? "期間選択に戻す" : "全件表示"}
      </Button>
    </Box>
  );
}
