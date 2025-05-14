// src/components/LineTrendChart.jsx
"use client";
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const LABELS = {
  taste_avg: { label: "味", color: "#2962FF" },
  service_avg: { label: "接客", color: "#03A9F4" },
  price_avg: { label: "価格", color: "#4CAF50" },
  location_avg: { label: "店内環境", color: "#FFC107" },
  hygiene_avg: { label: "立地", color: "#F44336" },
};

const QUARTER_LABELS = ["1〜3月", "4〜6月", "7〜9月", "10〜12月"];

export default function LineTrendChart({ data }) {
  // "YYYY-QN" → "1〜3月" などに変換
  const formatLabel = (label) => {
    const [, q] = label.split("-Q");
    return QUARTER_LABELS[Number(q) - 1];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        {/* 薄い補助線 */}
        <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
        <XAxis dataKey="quarter_label" tickFormatter={formatLabel} />
        <YAxis
          domain={[0, 5]}
          allowDecimals={false} // 目盛りは整数
          tickFormatter={(v) => v}
        />
        <Tooltip
          formatter={(value) => (value != null ? value.toFixed(1) : "")}
          labelFormatter={(label) => `期間：${formatLabel(label)}`}
        />
        <Legend verticalAlign="bottom" height={36} />
        {Object.entries(LABELS).map(([key, { label, color }]) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={label}
            stroke={color}
            dot={{ r: 3, stroke: color, fill: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 5, stroke: color, fill: "#fff", strokeWidth: 2 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
