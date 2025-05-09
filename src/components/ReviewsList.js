import React from "react";
import { Card, CardContent, Typography, Rating, Box } from "@mui/material";

export default function ReviewsList({ reviews }) {
  if (reviews.length === 0) {
    return <Typography>レビューはまだありません。</Typography>;
  }
  return (
    <Box display="flex" flexDirection="column" gap={2}>
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
