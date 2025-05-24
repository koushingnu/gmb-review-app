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
      <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
        <Typography variant="h6" mb={2}>
          管理者ログイン
        </Typography>
        <input
          type="password"
          placeholder="パスワード"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ marginBottom: 12, padding: 8, fontSize: 16 }}
        />
        <Button variant="contained" onClick={handleLogin}>
          ログイン
        </Button>
      </Box>
    );
  }

  // 管理者認証後
  return (
    <Box p={2} maxWidth={750} mx="auto">
      <Typography variant="h5" mb={3}>
        未送信返信管理（Google未送信のみ）
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <Typography>読込中...</Typography>
      ) : pendingReplies.length === 0 ? (
        <Typography color="text.secondary">
          Google未送信の返信はありません。
        </Typography>
      ) : (
        pendingReplies.map((r) => (
          <Paper
            key={r.review_id}
            sx={{
              mb: 3,
              p: 2.5,
              borderRadius: 3,
              background: "#fff",
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography fontWeight={700} mb={1}>
              レビュー:{" "}
              <span style={{ color: "#1976d2" }}>
                {r.reviews?.reviewer_display_name || "匿名"}
              </span>
            </Typography>
            <Typography color="text.secondary" mb={1}>
              {r.reviews?.review_comment}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <b>返信内容:</b> {r.comment}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              disabled={sendStatus[r.review_id] === "sending"}
              onClick={() => handleSendReply(r.review_id)}
              sx={{ minWidth: 120, mr: 2 }}
            >
              {sendStatus[r.review_id] === "sending"
                ? "送信中..."
                : sendStatus[r.review_id] === "ok"
                  ? "送信済"
                  : "Googleに送信"}
            </Button>
            {sendStatus[r.review_id] === "error" && (
              <Typography color="error" display="inline">
                送信失敗
              </Typography>
            )}
          </Paper>
        ))
      )}
    </Box>
  );
}
