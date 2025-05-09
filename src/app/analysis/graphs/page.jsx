"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { Box, Typography, Button } from "@mui/material";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function GraphsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("reviews")
      .select(
        "taste_score,service_score,price_score,location_score,hygiene_score"
      )
      .not("taste_score", "is", null)
      .then(({ data }) => {
        // 平均値を計算
        const sums = data.reduce(
          (acc, cur) => ({
            taste: acc.taste + cur.taste_score,
            service: acc.service + cur.service_score,
            price: acc.price + cur.price_score,
            location: acc.location + cur.location_score,
            hygiene: acc.hygiene + cur.hygiene_score,
          }),
          { taste: 0, service: 0, price: 0, location: 0, hygiene: 0 }
        );
        const len = data.length;
        setData([
          { subject: "味", value: sums.taste / len },
          { subject: "接客", value: sums.service / len },
          { subject: "価格", value: sums.price / len },
          { subject: "立地", value: sums.location / len },
          { subject: "衛生", value: sums.hygiene / len },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography>読み込み中...</Typography>;

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        レビュー項目別平均スコア
      </Typography>
      <RadarChart
        cx={300}
        cy={250}
        outerRadius={150}
        width={600}
        height={500}
        data={data}
      >
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 5]} />
        <Radar
          name="平均"
          dataKey="value"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
        <Tooltip />
        <Legend />
      </RadarChart>
    </Box>
  );
}
