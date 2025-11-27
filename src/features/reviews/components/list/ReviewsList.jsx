import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Collapse,
  Tooltip,
  Rating,
  CircularProgress,
  Grid,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ReplyIcon from "@mui/icons-material/Reply";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { gradients, shadows, backgrounds } from "../../../../lib/tokens/colors";

const MotionPaper = motion.create(Paper);

export default function ReviewsList({ reviews, loading, onRefresh, onReplyClick }) {
  const [replyOpen, setReplyOpen] = useState({});
  const [replyText, setReplyText] = useState({});
  const [sending, setSending] = useState({});

  const handleReplyClick = (review) => {
    if (onReplyClick) {
      onReplyClick(review);
    } else {
      // フォールバック: ローカルでの返信UI表示
      setReplyOpen((prev) => ({ ...prev, [review.review_id]: true }));
    }
  };

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
      if (onRefresh) await onRefresh();
      setReplyOpen((prev) => ({ ...prev, [review_id]: false }));
      setReplyText((prev) => ({ ...prev, [review_id]: "" }));
    } finally {
      setSending((prev) => ({ ...prev, [review_id]: false }));
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "yyyy年M月d日 HH:mm", { locale: ja });
    } catch {
      return dateString;
    }
  };

  // レビューカードのアニメーション設定
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          width: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!reviews.length) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          width: "100%",
          p: 3,
          textAlign: "center",
        }}
      >
        <RateReviewOutlinedIcon
          sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          レビューが見つかりません
        </Typography>
        <Typography variant="body2" color="text.secondary">
          選択した期間にレビューは投稿されていません
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 } }}>
      <AnimatePresence>
        {reviews.map((review) => (
          <motion.div
            key={review.review_id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            <Paper
              elevation={1}
              sx={{
                mb: 3,
                overflow: "hidden",
                borderRadius: 2,
                backgroundColor: "rgba(248, 250, 252, 0.8)",
                backdropFilter: "blur(10px)",
                position: "relative",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(148, 163, 184, 0.08)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: gradients.accent.horizontal,
                },
              }}
            >
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {/* レビューヘッダー */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      background: gradients.primary.default,
                      width: 48,
                      height: 48,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      boxShadow: shadows.md,
                    }}
                  >
                    {review.star_rating}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                        gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                          color: "#9a3412",
                      }}
                    >
                        {review.reviewer?.display_name}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                          color: "#ea580c",
                      }}
                    >
                        <AccessTimeIcon sx={{ fontSize: "0.875rem" }} />
                        <Typography variant="body2">
                          {formatDate(review.create_time)}
                      </Typography>
                      </Box>
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{
                        mt: 1,
                        color: "#1e293b",
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {review.comment}
                    </Typography>

                    {review.reply && (
                    <Box
                      sx={{
                          p: { xs: 2, sm: 3 },
                          bgcolor: backgrounds.light,
                          borderRadius: 2,
                          mt: 2,
                        position: "relative",
                          ml: 4,
                        "&::before": {
                          content: '""',
                          position: "absolute",
                            left: "-16px",
                            top: "24px",
                          width: "2px",
                            height: "calc(100% - 48px)",
                            background: gradients.accent.vertical,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                            gap: 2,
                            mb: 1,
                        }}
                      >
                          <Typography
                            variant="subtitle2"
                          sx={{
                              color: "#9a3412",
                              fontWeight: 700,
                          }}
                          >
                            オーナーからの返信
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#ea580c" }}>
                            {formatDate(review.reply.update_time)}
                        </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#1e293b",
                            lineHeight: 1.7,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {review.reply.comment}
                        </Typography>
                      </Box>
                    )}

                    {!review.reply && (
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          variant="outlined"
                          onClick={() => handleReplyClick(review)}
                          sx={{
                            color: "#f97316",
                            borderColor: "#f97316",
                            "&:hover": {
                              borderColor: "#c2410c",
                              backgroundColor: "rgba(234, 88, 12, 0.04)",
                            },
                          }}
                        >
                          返信する
                        </Button>
                      </Box>
                    )}
                    </Box>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
}
