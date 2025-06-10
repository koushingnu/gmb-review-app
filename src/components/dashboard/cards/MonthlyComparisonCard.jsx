import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Skeleton,
  Card,
  CardContent,
  CircularProgress,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { colors } from "@/lib/tokens/colors";
import { motion, AnimatePresence } from "framer-motion";

const ComparisonItem = ({ label, value, thisMonth, lastMonth }) => {
  const getIcon = (value) => {
    if (value > 0) return <TrendingUpIcon sx={{ color: "success.main" }} />;
    if (value < 0) return <TrendingDownIcon sx={{ color: "error.main" }} />;
    return <RemoveIcon sx={{ color: "text.secondary" }} />;
  };

  const getColor = (value) => {
    if (value > 0) return "success.main";
    if (value < 0) return "error.main";
    return "text.secondary";
  };

  const getBackgroundColor = (value) => {
    if (value > 0) return "success.lighter";
    if (value < 0) return "error.lighter";
    return "grey.100";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1,
          p: 1,
          borderRadius: 2,
          backgroundColor: (theme) => theme.palette.background.paper,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              fontSize: "0.8rem",
            }}
          >
            {label}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title="先月 → 今月" arrow>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontFamily: "monospace",
                backgroundColor: (theme) => theme.palette.grey[50],
                py: 0.5,
                px: 1,
                borderRadius: 1,
                fontSize: "0.7rem",
              }}
            >
              {lastMonth === null ? "-" : lastMonth.toFixed(1)} →{" "}
              {thisMonth === null ? "-" : thisMonth.toFixed(1)}
            </Typography>
          </Tooltip>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: (theme) => getBackgroundColor(value),
              py: 0.5,
              px: 1,
              borderRadius: 2,
              minWidth: 70,
              justifyContent: "center",
            }}
          >
            {getIcon(value)}
            <Typography
              variant="caption"
              sx={{
                ml: 0.5,
                color: getColor(value),
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            >
              {value === null ? "-" : `${value > 0 ? "+" : ""}${value}%`}
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default function MonthlyComparisonCard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/analysis/monthly");
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching monthly comparison:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card
        sx={{
          height: "100%",
          maxHeight: 420,
          background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        sx={{
          height: "100%",
          maxHeight: 420,
          background: "linear-gradient(145deg, #fee 0%, #fff 100%)",
        }}
      >
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  const items = [
    { key: "taste", label: "味" },
    { key: "service", label: "サービス" },
    { key: "price", label: "価格" },
    { key: "environment", label: "環境" },
    { key: "location", label: "立地" },
  ];

  return (
    <Card
      sx={{
        height: "100%",
        maxHeight: 420,
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(8px)",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 24px 0 rgba(34, 41, 47, 0.1)",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 6px 30px 0 rgba(34, 41, 47, 0.15)",
        },
      }}
    >
      <CardContent sx={{ p: 1.5 }}>
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            評価項目の月間比較
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mt: 0.25,
              fontSize: "0.7rem",
            }}
          >
            先月と今月の評価を比較
          </Typography>
        </Box>

        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ComparisonItem
                label={item.label}
                value={data.comparison[item.key]}
                thisMonth={data.thisMonth[item.key]}
                lastMonth={data.lastMonth[item.key]}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {data.metadata && (
          <Box
            sx={{
              mt: 1,
              pt: 0.5,
              borderTop: 1,
              borderColor: "divider",
              fontSize: "0.65rem",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                fontSize: "inherit",
              }}
            >
              データ件数: 今月 {data.metadata.thisMonthCount}件 / 先月{" "}
              {data.metadata.lastMonthCount}件
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
 