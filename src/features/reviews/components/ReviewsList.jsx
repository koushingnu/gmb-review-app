"use client";

import React from "react";
import {
  List,
  ListItem,
  Paper,
  Typography,
  Box,
  Divider,
  Chip,
  Rating,
  Button,
  TextField,
  IconButton,
  Stack,
} from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { format, isValid, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

// 日付をフォーマットする関数
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = parseISO(dateString);
  if (!isValid(date)) return "";
  return format(date, "yyyy年M月d日", { locale: ja });
};

export default function ReviewsList({ reviews, onReviewUpdated }) {
  const [replyText, setReplyText] = React.useState("");
  const [editingReviewId, setEditingReviewId] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reply: replyText }),
      });
      if (!res.ok) throw new Error("Reply failed");
      setReplyText("");
      setEditingReviewId(null);
      onReviewUpdated();
    } catch (e) {
      console.error("返信エラー:", e);
      alert("返信の送信に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleReplyDelete = async (reviewId) => {
    if (!confirm("この返信を削除してもよろしいですか？")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      onReviewUpdated();
    } catch (e) {
      console.error("削除エラー:", e);
      alert("返信の削除に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  if (!reviews?.length) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          この期間のレビューはありません
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {reviews.map((review, index) => {
        // レビューデータの安全な取り出し
        const { id, time, star_rating, text, review_replies } = review || {};

        // 最新の返信を取得
        const latestReply = review_replies?.[0];

        return (
          <React.Fragment key={id || index}>
            {index > 0 && <Divider />}
            <ListItem
              alignItems="flex-start"
              sx={{
                flexDirection: "column",
                gap: 2,
                py: 3,
              }}
            >
              {/* レビュー本文 */}
              <Box sx={{ width: "100%" }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Box>
                    <Typography
                      component="span"
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mr: 2 }}
                    >
                      {formatDate(time)}
                    </Typography>
                    <Rating
                      value={Number(star_rating) || 0}
                      readOnly
                      size="small"
                      sx={{ verticalAlign: "middle" }}
                    />
                  </Box>
                  {latestReply && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="返信済み"
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                    mb: 1,
                  }}
                >
                  {text || ""}
                </Typography>
              </Box>

              {/* 返信エリア */}
              <Box sx={{ width: "100%" }}>
                {latestReply ? (
                  // 返信済みの場合
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      position: "relative",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <ReplyIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2" color="primary">
                        あなたの返信
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: "auto" }}
                      >
                        {formatDate(latestReply.update_time)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {latestReply.comment}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 2, justifyContent: "flex-end" }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => {
                          setReplyText(latestReply.comment);
                          setEditingReviewId(id);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleReplyDelete(id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>
                ) : editingReviewId === id ? (
                  // 返信編集中の場合
                  <Box sx={{ width: "100%" }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="返信を入力してください"
                      disabled={loading}
                      sx={{ mb: 1 }}
                    />
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button
                        size="small"
                        onClick={() => {
                          setReplyText("");
                          setEditingReviewId(null);
                        }}
                        disabled={loading}
                      >
                        キャンセル
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<SendIcon />}
                        onClick={() => handleReplySubmit(id)}
                        disabled={loading || !replyText.trim()}
                      >
                        送信
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  // 未返信の場合
                  <Button
                    startIcon={<ReplyIcon />}
                    onClick={() => setEditingReviewId(id)}
                    size="small"
                  >
                    返信する
                  </Button>
                )}
              </Box>
            </ListItem>
          </React.Fragment>
        );
      })}
    </List>
  );
}
