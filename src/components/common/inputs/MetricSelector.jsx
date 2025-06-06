// src/components/MetricSelector.jsx
"use client";
import React from "react";
import {
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { LABELS } from "@/components/charts/LineTrendChart";

export function MetricSelector({ value, onChange }) {
  return (
    <FormControl fullWidth>
      <InputLabel id="metric-select-label">指標</InputLabel>
      <Select
        labelId="metric-select-label"
        id="metric-select"
        value={value}
        label="指標"
        onChange={onChange}
      >
        {Object.entries(LABELS).map(([key, label]) => (
          <MenuItem key={key} value={key}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
