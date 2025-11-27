"use client";
import React from "react";
import {
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import FilterListIcon from "@mui/icons-material/FilterList";
import SyncIcon from "@mui/icons-material/Sync";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useDateFilter } from "@/lib/DateFilterContext";

const MotionPaper = motion(Paper);

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const quarters = [1, 2, 3, 4];

const sortOptions = [
  { value: "newest", label: "新しい順" },
  { value: "oldest", label: "古い順" },
  { value: "rating_high", label: "評価が高い順" },
  { value: "rating_low", label: "評価が低い順" },
  { value: "replied_first", label: "返信済み優先" },
  { value: "unreplied_first", label: "未返信優先" },
  { value: "longest", label: "レビュー文字数が多い順" },
  { value: "shortest", label: "レビュー文字数が少ない順" },
];

export default function DateFilterControls({
  onShowAll,
  showAll,
  onSync,
  onAiRescore,
  loading,
  sortBy,
  onSortChange,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { year, quarter, setYear, setQuarter } = useDateFilter();

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        {/* フィルター見出し */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minWidth: { xs: "100%", sm: "auto" },
          }}
        >
          <FilterListIcon
            sx={{
              mr: 1,
              color: "primary.main",
              fontSize: "1.2rem",
            }}
          />
          <Typography
            variant="subtitle2"
            component="h2"
            color="primary.main"
            sx={{ fontWeight: 600 }}
          >
            フィルター設定
          </Typography>
        </Box>

        {/* フィルターコントロール */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            flex: 1,
            justifyContent: { xs: "flex-start", sm: "space-between" },
            width: { xs: "100%", sm: "auto" },
            flexWrap: { xs: "wrap", sm: "nowrap" },
            gap: { xs: 1, sm: 2 },
          }}
        >
          {/* 左側のコントロール */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              flex: 1,
            }}
          >
            {/* 年・四半期選択 */}
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl
                size="small"
                sx={{ width: { xs: "calc(50% - 4px)", sm: 120 } }}
                disabled={showAll}
              >
                <InputLabel>年度</InputLabel>
                <Select
                  value={year}
                  label="年度"
                  onChange={(e) => setYear(e.target.value)}
                >
                  {years.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}年度
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                size="small"
                sx={{ width: { xs: "calc(50% - 4px)", sm: 120 } }}
                disabled={showAll}
              >
                <InputLabel>四半期</InputLabel>
                <Select
                  value={quarter}
                  label="四半期"
                  onChange={(e) => setQuarter(e.target.value)}
                >
                  {quarters.map((q) => (
                    <MenuItem key={q} value={q}>
                      第{q}四半期
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* 並び替え */}
            <FormControl size="small" sx={{ width: { xs: "100%", sm: 180 } }}>
              <InputLabel>並び替え</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                label="並び替え"
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 全期間表示ボタン */}
            <Button
              variant={showAll ? "contained" : "outlined"}
              onClick={() => onShowAll(!showAll)}
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: 110 },
                transition: "all 0.3s ease",
              }}
            >
              {showAll ? "期間を指定" : "全期間表示"}
            </Button>
          </Stack>

          {/* 右側のボタン群 */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="AI再評価">
              <IconButton
                onClick={onAiRescore}
                disabled={loading}
                sx={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "secondary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "secondary.dark",
                  },
                  "&:disabled": {
                    backgroundColor: "action.disabledBackground",
                  },
                }}
              >
                <AutoAwesomeIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="レビューを同期">
              <IconButton
                onClick={onSync}
                disabled={loading}
                sx={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  "& .MuiSvgIcon-root": {
                    animation: loading ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  },
                }}
              >
                <SyncIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
