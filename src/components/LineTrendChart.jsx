"use client";
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  CartesianGrid,
  ReferenceLine, // ←追加
} from "recharts";

// 描画可能な項目とラベル・色の定義
export const LABELS = {
  taste_avg: { label: "味", color: "#2962FF" },
  service_avg: { label: "接客", color: "#03A9F4" },
  price_avg: { label: "価格", color: "#4CAF50" },
  location_avg: { label: "店内環境", color: "#FFC107" },
  hygiene_avg: { label: "立地", color: "#F44336" },
};

// 四半期コード → 表示文字列マップ
const QUARTER_LABELS = ["1〜3月", "4〜6月", "7〜9月", "10〜12月"];

/**
 * @param {Array} data - 四半期集計データ
 * @param {Array} selectedMetrics - 表示する項目名配列
 * @param {Object} allAverages - { taste_avg: 4.2, ... } の形で全期間平均を渡す
 */
export default function LineTrendChart({
  data,
  selectedMetrics,
  allAverages = {},
}) {
  // "YYYY-QN" → "1〜3月" などに変換
  const formatLabel = (label) => {
    const parts = label.split("-Q");
    if (parts.length !== 2) return label;
    const q = Number(parts[1]);
    return QUARTER_LABELS[q - 1] || label;
  };

  // 1つだけ選択時
  const onlyOneSelected = selectedMetrics.length === 1;
  const metric = onlyOneSelected ? selectedMetrics[0] : null;
  const avg =
    onlyOneSelected && metric && allAverages[metric]
      ? Number(allAverages[metric])
      : null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        {/* 補助のグリッド線（点線） */}
        <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
        <XAxis dataKey="quarter_label" tickFormatter={formatLabel} />
        <YAxis domain={[0, 5]} allowDecimals={false} />
        <Tooltip
          formatter={(value) => (value != null ? value.toFixed(1) : "")}
          labelFormatter={(label) => `期間：${formatLabel(label)}`}
        />
        <Legend verticalAlign="bottom" height={36} />
        {Object.entries(LABELS)
          .filter(([key]) => selectedMetrics.includes(key))
          .map(([key, { label, color }]) => (
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
        {/* 1項目だけ選択時に全期間平均値の参考線を表示 */}
        {onlyOneSelected && avg && (
          <ReferenceLine
            y={avg}
            stroke={LABELS[metric]?.color || "gray"}
            strokeDasharray="4 2"
            label={{
              value: `全期間平均: ${avg.toFixed(1)}`,
              position: "right",
              fill: LABELS[metric]?.color || "gray",
              fontSize: 12,
            }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
