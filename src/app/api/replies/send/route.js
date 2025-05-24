import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { google } from "googleapis";

// Google API用：アクセストークン管理テーブル名
const TOKEN_TABLE = "google_tokens";

async function getGoogleAccessToken() {
  // 1. Supabaseからトークン取得
  const { data, error } = await supabaseAdmin
    .from(TOKEN_TABLE)
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error("Google認証トークンが見つかりません");
  }

  // 2. 有効期限内ならそのまま返す
  const expiresAt = new Date(data.expires_at);
  const now = new Date();
  if (expiresAt > now && data.access_token) {
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  }

  // 3. 期限切れならリフレッシュ
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
    throw new Error(
      "Googleトークンリフレッシュ失敗: " +
        (tokenData.error_description || tokenData.error)
    );
  }

  // 4. 新トークンをDB保存
  const newExpiresAt = new Date(
    Date.now() + tokenData.expires_in * 1000
  ).toISOString();
  await supabaseAdmin
    .from(TOKEN_TABLE)
    .update({
      access_token: tokenData.access_token,
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  return {
    access_token: tokenData.access_token,
    refresh_token: data.refresh_token,
  };
}

export async function POST(req) {
  try {
    const { review_id } = await req.json();

    // 1. review_replies + reviewsから「comment」と「resource_name」をJOIN取得
    const { data: reply, error } = await supabaseAdmin
      .from("review_replies")
      .select(
        `
        comment,
        reviews(resource_name)
      `
      )
      .eq("review_id", review_id)
      .single();

    if (error || !reply || !reply.reviews?.resource_name) {
      return NextResponse.json(
        { error: "返信またはresource_name取得に失敗" },
        { status: 404 }
      );
    }

    const resource_name = reply.reviews.resource_name;
    const comment = reply.comment;

    // 2. Googleアクセストークン取得（DB＆リフレッシュ自動）
    const { access_token, refresh_token } = await getGoogleAccessToken();

    // 3. Google API認証
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({
      access_token,
      refresh_token,
    });

    // 4. Google My Business APIで返信POST
    // 4. Google My Business API へ返信（直接fetch）
    // resource_name 例: accounts/xxx/locations/yyy/reviews/zzz
    const url = `https://mybusiness.googleapis.com/v4/${resource_name}/reply`;
    const gRes = await fetch(url, {
      method: "PUT", // 返信はPUT
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment }),
    });

    const gJson = await gRes.json();
    if (!gRes.ok) {
      throw new Error(
        "Google API送信失敗: " + (gJson.error?.message || JSON.stringify(gJson))
      );
    }

    // 5. 成功時のみsent_atをUPDATE
    const now = new Date().toISOString();
    await supabaseAdmin
      .from("review_replies")
      .update({ sent_at: now })
      .eq("review_id", review_id);

    return NextResponse.json({ success: true, sent_at: now });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "送信エラー" },
      { status: 500 }
    );
  }
}
