// src/app/api/debug/google-reviews/route.js
import { google } from "googleapis";
import { supabase } from "@/lib/supabase";

// Googleトークン取得（sync/route.jsと同じロジック）
async function getGoogleTokensFromDB() {
  const { data, error } = await supabase
    .from("google_tokens")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  if (error || !data) throw new Error("GoogleトークンがDBにありません");

  const now = Date.now();
  const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : 0;
  let { access_token, refresh_token } = data;

  if (!access_token || expiresAt - now < 60 * 1000) {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refresh_token,
        grant_type: "refresh_token",
      }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      throw new Error(tokenJson.error_description || "Googleリフレッシュ失敗");
    }
    access_token = tokenJson.access_token;
    await supabase
      .from("google_tokens")
      .update({
        access_token,
        expires_at: new Date(now + tokenJson.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
  }

  return { access_token, refresh_token };
}

export async function GET() {
  // トークン取得
  const { access_token, refresh_token } = await getGoogleTokensFromDB();

  // OAuth2/Google My Business初期化
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({ access_token, refresh_token });

  const businessInfo = google.mybusinessbusinessinformation({
    version: "v1",
    auth: oauth2Client,
  });
  const accountMgmt = google.mybusinessaccountmanagement({
    version: "v1",
    auth: oauth2Client,
  });

  // アカウント・ロケーション取得
  const accountsRes = await accountMgmt.accounts.list();
  const accountIdFull = accountsRes.data.accounts?.[0]?.name;
  if (!accountIdFull) throw new Error("アカウントが見つかりません");
  const accountId = accountIdFull.split("/")[1];

  const locRes = await businessInfo.accounts.locations.list({
    parent: accountIdFull,
    readMask: "name",
  });
  const locations = locRes.data.locations || [];
  if (locations.length === 0) throw new Error("ロケーションがありません");
  const locationName = locations[0].name;
  const locationId = locationName.split("/")[1];

  // Googleレビュー全取得
  let allReviews = [];
  let nextPageToken = null;
  let page = 1;
  do {
    const url = new URL(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`
    );
    url.searchParams.set("pageSize", "50");
    if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const body = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(body));
    allReviews.push(...(body.reviews || []));
    nextPageToken = body.nextPageToken;
    page++;
  } while (nextPageToken);

  // 最新の5件のみを返す（reviewIdが新しい順で5件）
  // GoogleのAPIは配列の順序が保証されない場合があるので、updateTimeかcreateTimeで降順ソート推奨
  const reviewsSorted = allReviews
    .slice() // コピー
    .sort(
      (a, b) =>
        new Date(b.updateTime || b.createTime) -
        new Date(a.updateTime || a.createTime)
    );
  const latest5 = reviewsSorted.slice(0, 5);

  return new Response(JSON.stringify({ reviews: latest5 }, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
