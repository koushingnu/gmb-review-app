// src/components/BalanceRadarChart.jsx
"use client";
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";

const SUBJECTS = {
  taste_avg: { label: "味", color: "#2962FF" },
  service_avg: { label: "接客", color: "#03A9F4" },
  price_avg: { label: "価格", color: "#4CAF50" },
  location_avg: { label: "店内環境", color: "#FFC107" },
  hygiene_avg: { label: "立地", color: "#F44336" },
};

const QUARTER_LABELS = {
  1: "1〜3月",
  2: "4〜6月",
  3: "7〜9月",
  4: "10〜12月",
};

export default function BalanceRadarChart({
  data,
  mainYear,
  mainQuarter,
  compareMode,
  compareYear,
  compareQuarter,
}) {
  const mainLabel = `${mainYear}-Q${mainQuarter}`;
  const compLabel = `${compareYear}-Q${compareQuarter}`;

  const mainDisplay = `${mainYear}年${QUARTER_LABELS[mainQuarter]}`;
  const compDisplay = `${compareYear}年${QUARTER_LABELS[compareQuarter]}`;

  const radarData = useMemo(() => {
    const mainData = data.find((d) => d.quarter_label === mainLabel) || {};
    const compData = data.find((d) => d.quarter_label === compLabel) || {};
    return Object.entries(SUBJECTS).map(([key, { label }]) => {
      const entry = {
        subject: label,
        [mainLabel]: mainData[key] ?? 0,
      };
      if (compareMode) {
        entry[compLabel] = compData[key] ?? 0;
      }
      return entry;
    });
  }, [data, mainLabel, compLabel, compareMode]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={radarData}>
        {/* 補助線は縦棒のみ */}
        <PolarGrid stroke="#e0e0e0" horizontal={false} />
        <PolarAngleAxis dataKey="subject" />
        {/* 目盛り線・ラベルを非表示 */}
        <PolarRadiusAxis
          angle={30}
          domain={[0, 5]}
          tick={false}
          axisLine={false}
        />
        {/* ホバー時のツールチップ */}
        <Tooltip
          formatter={(value) => (value != null ? value.toFixed(1) : "")}
          labelFormatter={(subject) => `項目：${subject}`}
        />
        {/* メイン期間 */}
        <Radar
          dataKey={mainLabel}
          name={mainDisplay}
          stroke={SUBJECTS.taste_avg.color}
          fill={SUBJECTS.taste_avg.color}
          fillOpacity={0.2}
        />
        {/* 比較期間 */}
        {compareMode && (
          <Radar
            dataKey={compLabel}
            name={compDisplay}
            stroke={SUBJECTS.hygiene_avg.color}
            fill={SUBJECTS.hygiene_avg.color}
            fillOpacity={0.2}
          />
        )}
        <Legend verticalAlign="bottom" height={36} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
