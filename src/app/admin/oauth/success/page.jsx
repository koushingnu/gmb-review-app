"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState({
    message: "認証情報を保存中...",
    error: null,
    isProcessing: true,
  });

  useEffect(() => {
    async function saveTokens() {
      try {
        const access_token = searchParams.get("access_token");
        const refresh_token = searchParams.get("refresh_token");

        if (!access_token || !refresh_token) {
          throw new Error(
            "認証情報が不完全です。もう一度認証を行ってください。"
          );
        }

        setStatus((prev) => ({ ...prev, message: "認証情報を保存中..." }));

        // 既存のトークンを削除（クリーンアップ）
        await supabase.from("google_tokens").delete().not("id", "eq", 1);

        // 新しいトークンを保存
        const { error } = await supabase.from("google_tokens").upsert({
          id: 1, // 単一レコードとして管理
          access_token,
          refresh_token,
          expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(), // 1週間後
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;

        setStatus((prev) => ({
          ...prev,
          message: "認証が完了しました。リダイレクトします...",
          isProcessing: false,
        }));

        // 保存成功後、少し待ってからリダイレクト
        setTimeout(() => {
          router.push("/reviews");
        }, 1500);
      } catch (error) {
        console.error("トークン保存エラー:", error);
        setStatus({
          message: "エラーが発生しました",
          error: error.message,
          isProcessing: false,
        });
      }
    }

    saveTokens();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {status.isProcessing ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-800">
              {status.message}
            </h2>
          </>
        ) : status.error ? (
          <>
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-center text-red-600 mb-4">
              {status.message}
            </h2>
            <p className="text-gray-600 text-center mb-6">{status.error}</p>
            <button
              onClick={() => router.push("/api/auth/google")}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              再度認証を試みる
            </button>
          </>
        ) : (
          <>
            <div className="text-green-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-800">
              {status.message}
            </h2>
          </>
        )}
      </div>
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
