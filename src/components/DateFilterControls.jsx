// src/components/DateFilterControls.jsx
"use client";

import React from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useDateFilter } from "@/lib/DateFilterContext";

export default function DateFilterControls({ enableCompare = false }) {
  const {
    from,
    to,
    compareFrom,
    compareTo,
    setFrom,
    setTo,
    setCompareFrom,
    setCompareTo,
  } = useDateFilter();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 年月オブジェクトから "YYYY-MM" 形式を返す
  // 引数が null や undefined の場合は空文字を返す
  const formatYM = (ym) => {
    if (!ym) return "";
    const { year, month } = ym;
    if (year && month) {
      return `${year}-${String(month).padStart(2, "0")}`;
    }
    return "";
  };

  return (
    <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
      {/* 開始年 */}
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>開始年</InputLabel>
        <Select
          value={from?.year ?? ""}
          label="開始年"
          onChange={(e) =>
            setFrom((prev) => ({
              year: Number(e.target.value),
              month: prev?.month ?? null,
            }))
          }
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}年
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 開始月 */}
      <FormControl size="small" sx={{ minWidth: 80 }}>
        <InputLabel>開始月</InputLabel>
        <Select
          value={from?.month ?? ""}
          label="開始月"
          onChange={(e) =>
            setFrom((prev) => ({
              year: prev?.year ?? null,
              month: Number(e.target.value),
            }))
          }
        >
          {months.map((m) => (
            <MenuItem key={m} value={m}>
              {m}月
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 終了年 */}
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>終了年</InputLabel>
        <Select
          value={to?.year ?? ""}
          label="終了年"
          onChange={(e) =>
            setTo((prev) => ({
              year: Number(e.target.value),
              month: prev?.month ?? null,
            }))
          }
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}年
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 終了月 */}
      <FormControl size="small" sx={{ minWidth: 80 }}>
        <InputLabel>終了月</InputLabel>
        <Select
          value={to?.month ?? ""}
          label="終了月"
          onChange={(e) =>
            setTo((prev) => ({
              year: prev?.year ?? null,
              month: Number(e.target.value),
            }))
          }
        >
          {months.map((m) => (
            <MenuItem key={m} value={m}>
              {m}月
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 比較期間追加ボタン */}
      {enableCompare && (
        <Button
          variant="outlined"
          onClick={() => {
            setCompareFrom(from);
            setCompareTo(to);
          }}
          disabled={!from?.year || !from?.month || !to?.year || !to?.month}
        >
          比較期間に追加
        </Button>
      )}

      {/* 選択中の期間表示 */}
      <Box ml="auto">
        <Typography variant="body2">
          期間: {formatYM(from)} ～ {formatYM(to)}
        </Typography>
        {enableCompare && compareFrom && compareTo && (
          <Typography variant="body2" color="text.secondary">
            比較: {formatYM(compareFrom)} ～ {formatYM(compareTo)}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
