"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function saveTokens() {
      try {
        const access_token = searchParams.get("access_token");
        const refresh_token = searchParams.get("refresh_token");

        if (!access_token || !refresh_token) {
          throw new Error("トークンが見つかりません");
        }

        // トークンをSupabaseに保存（有効期限を1週間に設定）
        const { error } = await supabase.from("google_tokens").upsert({
          id: 1, // 単一レコードとして管理
          access_token,
          refresh_token,
          expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(), // 1週間後
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;

        // 保存成功後、ダッシュボードにリダイレクト
        router.push("/reviews");
      } catch (error) {
        console.error("トークン保存エラー:", error);
        alert("認証情報の保存に失敗しました。");
      }
    }

    saveTokens();
  }, [searchParams, router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <h1>認証処理中...</h1>
      <p>このページは自動的に移動します。</p>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <h1>読み込み中...</h1>
          <p>しばらくお待ちください。</p>
        </div>
      }
    >
      <OAuthCallback />
    </Suspense>
  );
}
