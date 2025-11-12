// src/app/api/callback/route.js
import { google } from "googleapis";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    console.log("=== [CALLBACK] 開始 ===");
    console.log("Callback URL:", req.url);
    console.log("Auth Code:", code ? "受信" : "未受信");
    console.log("Error:", error || "なし");
    console.log("Redirect URI:", process.env.GOOGLE_REDIRECT_URI);

    // Googleからのエラー
    if (error) {
      console.error("Google OAuth Error:", error);
      // ユーザーフレンドリーなエラー画面にリダイレクト
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/admin/oauth/success?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent('Google認証でエラーが発生しました')}`,
        },
      });
    }

    // 認証コードがない
    if (!code) {
      console.error("認証コードが見つかりません");
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/admin/oauth/success?error=no_code&error_description=${encodeURIComponent('認証コードが取得できませんでした')}`,
        },
      });
    }

    // OAuth2クライアント初期化
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    console.log("[CALLBACK] トークン取得開始...");
    const { tokens } = await oauth2.getToken(code);
    
    console.log("[CALLBACK] トークン取得結果:", {
      has_access_token: !!tokens.access_token,
      has_refresh_token: !!tokens.refresh_token,
      access_token_length: tokens.access_token?.length || 0,
      refresh_token_length: tokens.refresh_token?.length || 0,
    });

    // リフレッシュトークンが取得できていない場合の警告
    if (!tokens.refresh_token) {
      console.warn("[CALLBACK] ⚠️ リフレッシュトークンが取得できませんでした");
      console.warn("[CALLBACK] prompt=consent が設定されているか確認してください");
    }

    // トークンをクエリパラメータで渡す
    const params = new URLSearchParams({
      access_token: tokens.access_token || "",
      refresh_token: tokens.refresh_token || "",
    });

    console.log("[CALLBACK] /admin/oauth/success にリダイレクト");
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/admin/oauth/success?${params.toString()}`,
      },
    });
  } catch (error) {
    console.error("=== [CALLBACK ERROR] ===");
    console.error("エラー詳細:", error);
    console.error("エラースタック:", error.stack);
    
    // エラー画面にリダイレクト
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/admin/oauth/success?error=callback_error&error_description=${encodeURIComponent(error.message)}`,
      },
    });
  }
}
