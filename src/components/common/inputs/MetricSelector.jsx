// src/components/MetricSelector.jsx
"use client";
import React from "react";
import {
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import { LABELS } from "./LineTrendChart"; // LABELSをここから再利用します

export default function MetricSelector({ selected, onToggle }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1">表示項目</Typography>
      <FormGroup row>
        {Object.entries(LABELS).map(([key, { label }]) => (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={selected.includes(key)}
                onChange={() => onToggle(key)}
              />
            }
            label={label}
          />
        ))}
      </FormGroup>
    </Box>
  );
}
