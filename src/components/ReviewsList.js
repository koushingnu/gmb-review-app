import { useState } from "react";
import { Box, Typography, Button, TextField, Paper } from "@mui/material";

export default function ReviewsList({ reviews, onReload }) {
  const [replyOpen, setReplyOpen] = useState({});
  const [replyText, setReplyText] = useState({});
  const [sending, setSending] = useState({}); // 送信中判定

  // 返信送信
  const handleSendReply = async (review_id) => {
    const comment = replyText[review_id];
    if (!comment) return;
    setSending((prev) => ({ ...prev, [review_id]: true }));
    try {
      await fetch("/api/reviews/with-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id, comment }),
      });
      // 送信後に親から渡されたリロード関数を呼ぶ
      if (onReload) await onReload();
      setReplyOpen((prev) => ({ ...prev, [review_id]: false }));
      setReplyText((prev) => ({ ...prev, [review_id]: "" }));
    } finally {
      setSending((prev) => ({ ...prev, [review_id]: false }));
    }
  };

  return (
    <Box>
      {reviews.map((review) => (
        <Paper
          key={review.review_id}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(25, 118, 210, 0.05)",
            background: "#fff",
            minWidth: 300,
          }}
        >
          {/* ユーザー情報・評価 */}
          <Box display="flex" alignItems="center" mb={0.5}>
            <Typography fontWeight="bold" sx={{ flex: 1 }}>
              {review.reviewer_display_name}
            </Typography>
            <Typography color="warning.main" fontWeight={700} sx={{ ml: 1 }}>
              {"★".repeat(review.star_rating)}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {review.create_time
              ? new Date(review.create_time).toLocaleString()
              : ""}
          </Typography>
          <Typography sx={{ mb: 1, whiteSpace: "pre-line" }}>
            {review.comment}
          </Typography>

          {/* ===== 管理者からの返信エリア ===== */}
          {review.reply ? (
            <Box
              sx={{
                mt: 1.5,
                mb: 0.5,
                pl: 2,
                py: 1.5,
                borderLeft: "4px solid #e0e7ef",
                background: "#fafbfc",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#7b8ca3",
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  管理者からの返信
                </Typography>
                {review.reply.update_time && (
                  <Typography variant="caption" sx={{ color: "#b0b7c3" }}>
                    {new Date(review.reply.update_time).toLocaleString()}
                  </Typography>
                )}
              </Box>
              <Typography
                variant="body2"
                sx={{ color: "#495869", whiteSpace: "pre-line" }}
              >
                {review.reply.comment}
              </Typography>
            </Box>
          ) : replyOpen[review.review_id] ? (
            // 返信入力フォーム
            <Box mt={1} display="flex" alignItems="center" gap={1}>
              <TextField
                label="返信を入力"
                multiline
                size="small"
                value={replyText[review.review_id] || ""}
                onChange={(e) =>
                  setReplyText((prev) => ({
                    ...prev,
                    [review.review_id]: e.target.value,
                  }))
                }
                sx={{ flex: 1, minWidth: 150 }}
                disabled={sending[review.review_id]}
              />
              <Button
                variant="contained"
                onClick={() => handleSendReply(review.review_id)}
                disabled={
                  !replyText[review.review_id] || sending[review.review_id]
                }
                sx={{ px: 2, py: 1, fontWeight: 700 }}
              >
                送信
              </Button>
              <Button
                onClick={() =>
                  setReplyOpen((prev) => ({
                    ...prev,
                    [review.review_id]: false,
                  }))
                }
                disabled={sending[review.review_id]}
                sx={{ ml: 0.5 }}
              >
                キャンセル
              </Button>
            </Box>
          ) : (
            // 返信ボタン（未返信の場合のみ表示）
            <Button
              variant="text"
              size="small"
              sx={{ mt: 1, fontWeight: 700 }}
              onClick={() =>
                setReplyOpen((prev) => ({
                  ...prev,
                  [review.review_id]: true,
                }))
              }
            >
              返信する
            </Button>
          )}
        </Paper>
      ))}
    </Box>
  );
}
