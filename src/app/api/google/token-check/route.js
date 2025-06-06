import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("google_tokens")
      .select("*")
      .limit(1)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: "Token not found" }), {
        status: 401,
      });
    }

    const now = new Date();
    // 有効期限まで30分以上ある場合のみ既存のトークンを使用
    if (new Date(data.expires_at) > new Date(now.getTime() + 30 * 60 * 1000)) {
      return new Response(JSON.stringify({ access_token: data.access_token }), {
        status: 200,
      });
    }

    // 有効期限が30分を切っているので更新
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
      return new Response(
        JSON.stringify({
          error: "Token refresh failed",
          details: tokenData,
        }),
        { status: 401 }
      );
    }

    const expiresAt = new Date(
      Date.now() + tokenData.expires_in * 1000
    ).toISOString();

    console.log("[TOKEN] 新しいトークンの有効期限:", expiresAt);

    await supabase
      .from("google_tokens")
      .update({
        access_token: tokenData.access_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        expires_at: expiresAt,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[TOKEN ERROR]", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
      { status: 500 }
    );
  }
}
