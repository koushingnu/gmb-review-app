import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Rating,
  Box,
  Button,
} from "@mui/material";

export default function ReviewsList({ reviews, onRescore, showBulkRescore }) {
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleBulkRescore = async () => {
    setBulkLoading(true);
    for (const r of reviews) {
      await fetch("/api/reviews/retry-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: r.review_id }),
      });
    }
    setBulkLoading(false);
    if (typeof onRescore === "function") {
      onRescore();
    }
  };

  if (reviews.length === 0) {
    return <Typography>レビューはまだありません。</Typography>;
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {showBulkRescore && (
        <Box mb={1}>
          <Button
            variant="contained"
            onClick={handleBulkRescore}
            disabled={bulkLoading}
          >
            {bulkLoading ? "一括再採点中..." : "一括再採点"}
          </Button>
        </Box>
      )}

      {reviews.map((r) => (
        <Card key={r.review_id} sx={{ width: "100%" }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                {r.reviewer_display_name}
              </Typography>
              <Rating value={r.star_rating} readOnly size="small" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {r.comment}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              mt={1}
              display="block"
            >
              {new Date(r.create_time).toLocaleString("ja-JP")}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
