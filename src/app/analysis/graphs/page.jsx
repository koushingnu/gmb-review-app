"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import DateFilterControls from "@/components/DateFilterControls";
import { useDateFilter } from "@/lib/DateFilterContext";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

export default function GraphPage() {
  const { year, quarter } = useDateFilter();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`/api/analysis/quarterly?year=${year}&quarter=${quarter}`)
      .then((res) => res.json())
      .then((json) => setData(json || []));
  }, [year, quarter]);

  const selectedLabel = `${year}-Q${quarter}`;
  const prevLabel = `${year - 1}-Q${quarter}`;

  const selectedData =
    data.find((d) => d.quarter_label === selectedLabel) || {};
  const prevData = data.find((d) => d.quarter_label === prevLabel) || {};

  const radarData = [
    {
      subject: "味",
      [prevLabel]: prevData.taste_avg,
      [selectedLabel]: selectedData.taste_avg,
    },
    {
      subject: "接客",
      [prevLabel]: prevData.service_avg,
      [selectedLabel]: selectedData.service_avg,
    },
    {
      subject: "価格",
      [prevLabel]: prevData.price_avg,
      [selectedLabel]: selectedData.price_avg,
    },
    {
      subject: "立地",
      [prevLabel]: prevData.location_avg,
      [selectedLabel]: selectedData.location_avg,
    },
    {
      subject: "衛生",
      [prevLabel]: prevData.hygiene_avg,
      [selectedLabel]: selectedData.hygiene_avg,
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        四半期ごとのレビュー分析
      </Typography>
      <DateFilterControls />

      {/* 折れ線グラフ */}
      <Box sx={{ width: "100%", height: 300, mb: 6 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="quarter_label" />
            <YAxis domain={["dataMin", "dataMax"]} />
            <Legend />
            <Line type="monotone" dataKey="taste_avg" name="味" connectNulls />
            <Line
              type="monotone"
              dataKey="service_avg"
              name="接客"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="price_avg"
              name="価格"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="location_avg"
              name="立地"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="hygiene_avg"
              name="衛生"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* レーダーチャート */}
      <Box sx={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <RadarChart
            data={radarData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[1, 5]} />
            <Radar dataKey={prevLabel} name={prevLabel} fillOpacity={0.3} />
            <Radar
              dataKey={selectedLabel}
              name={selectedLabel}
              fillOpacity={0.3}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
