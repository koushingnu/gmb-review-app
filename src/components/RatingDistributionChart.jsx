// src/components/RatingDistributionChart.jsx
"use client";
import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";

export default function RatingDistributionChart() {
  const [dist, setDist] = useState([]);

  useEffect(() => {
    fetch("/api/analysis/rating-distribution")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // API から返る形式: [{ rating: 1, count: 10 }, …]
          setDist(data);
        }
      })
      .catch((err) => {
        console.error("Distribution fetch error:", err);
      });
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={dist} layout="vertical" margin={{ left: 20, right: 20 }}>
        <XAxis type="number" allowDecimals={false} />
        <YAxis dataKey="rating" type="category" width={30} />
        <Tooltip formatter={(v) => v} />
        <Bar dataKey="count" fill="#8884d8">
          <LabelList dataKey="count" position="right" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
