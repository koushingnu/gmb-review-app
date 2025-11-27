import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    console.log("[TOKEN_CHECK] トークンチェック開始");
    
    // 1. トークンの存在チェック（IDが1のレコードを取得）
    const { data, error } = await supabaseAdmin
      .from("google_tokens")
      .select("*")
      .eq("id", 1)
      .single();

    console.log("[TOKEN_CHECK] トークン取得結果:", {
      hasData: !!data,
      hasError: !!error,
      error: error?.message,
      dataId: data?.id,
    });

    if (error || !data) {
      console.log("[TOKEN_CHECK] トークンが存在しません");
      return new Response(
        JSON.stringify({
          error: "トークンが存在しません",
          needsAuth: true,
          errorType: "NO_TOKEN",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const now = new Date();
    // 2. アクセストークンの有効期限チェック（30分以上の余裕があるか）
    if (new Date(data.expires_at) > new Date(now.getTime() + 30 * 60 * 1000)) {
      return new Response(
        JSON.stringify({
          access_token: data.access_token,
          valid: true,
          expiresAt: data.expires_at,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. リフレッシュトークンを使用してアクセストークンを更新
    console.log("[TOKEN] アクセストークンの更新を開始");
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: data.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("[TOKEN ERROR]", tokenData);

      // リフレッシュトークンが無効な場合
      if (tokenData.error === "invalid_grant") {
        // リフレッシュトークンを削除
        await supabaseAdmin
          .from("google_tokens")
          .delete()
          .eq("refresh_token", data.refresh_token);

        return new Response(
          JSON.stringify({
            error: "認証の更新が必要です",
            needsAuth: true,
            errorType: "INVALID_REFRESH_TOKEN",
            details: tokenData,
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: "トークンの更新に失敗しました",
          errorType: "TOKEN_REFRESH_FAILED",
          details: tokenData,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 4. 新しいトークンを保存
    const expiresAt = new Date(
      Date.now() + tokenData.expires_in * 1000
    ).toISOString();

    console.log("[TOKEN] 新しいトークンの有効期限:", expiresAt);

    const { error: updateError } = await supabaseAdmin.from("google_tokens").upsert({
      id: data.id,
      access_token: tokenData.access_token,
      refresh_token: data.refresh_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });

    if (updateError) {
      console.error("[TOKEN ERROR] DB更新エラー:", updateError);
      return new Response(
        JSON.stringify({
          error: "トークンの保存に失敗しました",
          errorType: "DB_UPDATE_FAILED",
          details: updateError,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        expires_at: expiresAt,
        valid: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[TOKEN ERROR]", error);
    return new Response(
      JSON.stringify({
        error: "予期せぬエラーが発生しました",
        errorType: "UNEXPECTED_ERROR",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
