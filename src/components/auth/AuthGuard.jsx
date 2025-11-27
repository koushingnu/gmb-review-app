"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      console.log("[AUTH_GUARD] 未認証 → ログインページへリダイレクト");
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  // ローディング中
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          読み込み中...
        </Typography>
      </Box>
    );
  }

  // ログインページの場合は、認証チェックをスキップ
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // 未認証の場合は何も表示しない（リダイレクト中）
  if (!user) {
    return null;
  }

  // 認証済みの場合は、コンテンツを表示
  return <>{children}</>;
}

