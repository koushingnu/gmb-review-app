"use client";
import React, { useState } from "react";
import ReviewsList from "@/components/ReviewsList"; // レビューリストを再利用
import { Box, TextField, Button, Typography } from "@mui/material";

// パスワードは環境変数やenvファイルでもOK、ここでは例としてハードコード
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASS || "adminpass";

export default function AdminPage() {
  const [input, setInput] = useState("");
  const [auth, setAuth] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // 簡易認証
  const handleLogin = () => {
    if (input === ADMIN_PASSWORD) {
      setAuth(true);
      fetchReviews();
    } else {
      alert("パスワードが違います");
    }
  };

  // レビュー取得（再利用）
  const fetchReviews = async () => {
    setLoading(true);
    const res = await fetch("/api/reviews?all=true"); // 適宜API調整
    const data = await res.json();
    setReviews(data.reviews || []);
    setLoading(false);
  };

  // 管理者画面
  if (!auth) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
        <Typography variant="h6" mb={2}>
          管理者ログイン
        </Typography>
        <TextField
          type="password"
          label="パスワード"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleLogin}>
          ログイン
        </Button>
      </Box>
    );
  }

  // 管理者認証済みの場合
  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>
        管理者ページ
      </Typography>
      <ReviewsList reviews={reviews} onRescore={fetchReviews} showBulkRescore />
      {/* showBulkRescore をtrueで渡すことで一括再採点ボタンが表示される */}
    </Box>
  );
}
