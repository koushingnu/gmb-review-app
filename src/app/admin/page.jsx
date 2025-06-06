"use client";
import React, { useState, useEffect } from "react";
import ReviewsList from "@/components/ReviewsList"; // 既存レビューリスト
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
} from "@mui/material";

// パスワード（本番ではenv管理推奨）
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASS || "adminpass";

export default function AdminPendingRepliesPage() {
  const [auth, setAuth] = useState(false);
  const [input, setInput] = useState("");
  const [pendingReplies, setPendingReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendStatus, setSendStatus] = useState({});

  // 管理者認証
  const handleLogin = () => {
    if (input === (process.env.NEXT_PUBLIC_ADMIN_PASS || "adminpass")) {
      setAuth(true);
      fetchPendingReplies();
    } else {
      alert("パスワードが違います");
    }
  };

  // 未送信返信だけ取得
  const fetchPendingReplies = async () => {
    setLoading(true);
    const res = await fetch("/api/replies/pending");
    const data = await res.json();
    setPendingReplies(data.replies || []);
    setLoading(false);
  };

  // Google送信
  const handleSendReply = async (review_id) => {
    setSendStatus((s) => ({ ...s, [review_id]: "sending" }));
    const res = await fetch("/api/replies/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_id }),
    });
    if (res.ok) {
      setSendStatus((s) => ({ ...s, [review_id]: "ok" }));
      setPendingReplies((prev) =>
        prev.filter((r) => r.review_id !== review_id)
      );
    } else {
      setSendStatus((s) => ({ ...s, [review_id]: "error" }));
      alert("送信失敗！");
    }
  };

  // 認証画面
  if (!auth) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          px: { xs: 2, sm: 3 },
          background:
            "linear-gradient(135deg, rgba(56, 189, 248, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%)",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: "20px",
            background: "linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)",
            color: "white",
            maxWidth: "400px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 20px 40px -12px rgba(14, 165, 233, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            管理者ログイン
          </Typography>
          <TextField
            type="password"
            placeholder="パスワード"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            fullWidth
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleLogin}
            fullWidth
            sx={{
              py: 1.5,
              bgcolor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            ログイン
          </Button>
        </Paper>
      </Box>
    );
  }

  // 管理者認証後
  return (
    <Box
      sx={{
        py: 4,
        px: { xs: 2, sm: 3 },
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(56, 189, 248, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%)",
      }}
    >
      <Box
        sx={{
          maxWidth: "800px",
          mx: "auto",
          mb: 4,
          background: "linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)",
          borderRadius: "20px",
          p: { xs: 3, sm: 4 },
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px -12px rgba(14, 165, 233, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#fff",
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            fontFamily: '"Inter", "Noto Sans JP", sans-serif',
          }}
        >
          未送信返信管理
        </Typography>
        <Typography
          sx={{
            mt: 1,
            color: "rgba(255, 255, 255, 0.8)",
            fontWeight: 500,
          }}
        >
          Google未送信の返信のみ表示されます
        </Typography>
      </Box>

      {loading ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
          }}
        >
          <Typography>読込中...</Typography>
        </Box>
      ) : pendingReplies.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
          }}
        >
          <Typography>Google未送信の返信はありません。</Typography>
        </Box>
      ) : (
        <Box sx={{ maxWidth: "800px", mx: "auto" }}>
          {pendingReplies.map((r) => (
            <Paper
              key={r.review_id}
              sx={{
                mb: 3,
                p: { xs: 2.5, sm: 3 },
                borderRadius: "16px",
                background: "white",
                border: "1px solid rgba(99, 102, 241, 0.1)",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.05)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "#1e293b",
                  }}
                >
                  {r.reviews?.reviewer_display_name || "匿名"}
                </Typography>
              </Box>
              <Typography
                sx={{
                  mb: 2,
                  color: "#64748b",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                }}
              >
                {r.reviews?.review_comment}
              </Typography>
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: "12px",
                  bgcolor: "rgba(99, 102, 241, 0.05)",
                  border: "1px solid rgba(99, 102, 241, 0.1)",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "#1e293b",
                    mb: 1,
                  }}
                >
                  返信内容:
                </Typography>
                <Typography
                  sx={{
                    color: "#334155",
                    lineHeight: 1.6,
                  }}
                >
                  {r.comment}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  variant="contained"
                  disabled={sendStatus[r.review_id] === "sending"}
                  onClick={() => handleSendReply(r.review_id)}
                  sx={{
                    minWidth: 140,
                    py: 1,
                    px: 3,
                    background:
                      sendStatus[r.review_id] === "ok"
                        ? "linear-gradient(135deg, #10b981, #059669)"
                        : "linear-gradient(135deg, #0ea5e9, #4f46e5)",
                    borderRadius: "10px",
                    textTransform: "none",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    "&:hover": {
                      background:
                        sendStatus[r.review_id] === "ok"
                          ? "linear-gradient(135deg, #059669, #047857)"
                          : "linear-gradient(135deg, #0284c7, #4338ca)",
                    },
                    "&.Mui-disabled": {
                      background: "#94a3b8",
                      color: "white",
                    },
                  }}
                >
                  {sendStatus[r.review_id] === "sending"
                    ? "送信中..."
                    : sendStatus[r.review_id] === "ok"
                      ? "送信済"
                      : "Googleに送信"}
                </Button>
                {sendStatus[r.review_id] === "error" && (
                  <Typography
                    sx={{
                      color: "#ef4444",
                      fontWeight: 600,
                    }}
                  >
                    送信失敗
                  </Typography>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
