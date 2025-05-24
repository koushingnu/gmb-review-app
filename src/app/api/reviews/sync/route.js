// src/app/api/reviews/sync/route.js
import { google } from "googleapis";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

// タイム計測
function timer(label) {
  const start = process.hrtime();
  return () => {
    const diff = process.hrtime(start);
    const sec = diff[0] + diff[1] / 1e9;
    console.log(`[タイミング] ${label}: ${sec.toFixed(3)}s`);
    return sec;
  };
}

// 差分比較関数
function eq(a, b) {
  if (a == null || a === "") a = null;
  if (b == null || b === "") b = null;
  if (a === b) return true;
  // 日付比較
  if (
    (typeof a === "string" && /^\d{4}-\d{2}-\d{2}T/.test(a)) ||
    (typeof b === "string" && /^\d{4}-\d{2}-\d{2}T/.test(b))
  ) {
    try {
      return new Date(a).toISOString() === new Date(b).toISOString();
    } catch {
      return false;
    }
  }
  return false;
}

// AIプロンプト
const AI_PROMPT = `
あなたは日本の飲食店レビュー評価AIです。
以下の日本語レビュー文を厳格に精査し、記載内容がある観点だけに0～5点の整数値をつけてください。
【観点と基準例】
- 味（taste）：料理のおいしさ・味付け・素材の質など。具体的な称賛や不満、味の詳細描写がある場合のみ点数をつけてください。
- サービス（service）：接客の丁寧さ・スピード・対応の親切さ。関連する記述がある場合のみ点数をつけてください。
- 価格（price）：値段に対する満足度やコスパ。価格についての記述がある場合のみ点数をつけてください。
- 立地（location）：アクセスの良さ、駅からの距離、周辺の便利さ。記載がある場合のみ点数をつけてください。
- 衛生（hygiene）：店内の清潔さや衛生管理について記載がある場合のみ点数をつけてください。
【出力形式】
各観点についてレビュー本文に記載がなければ、スコアは必ず0にしてください（スコア0は「その観点について言及なし」を意味します）。
必ず以下のJSON形式で出力してください。余計な説明は一切不要です。
{"taste": 整数, "service": 整数, "price": 整数, "location": 整数, "hygiene": 整数}
【レビュー本文】
`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// トークン取得関数
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
  console.log("=== [SYNC] 開始 ===");
  const tStart = timer("全体");
  let t = timer("トークン取得");
  // 1. トークン取得
  const { access_token, refresh_token } = await getGoogleTokensFromDB();
  t();

  // 2. OAuth2 & API初期化
  t = timer("アカウント/ロケーション取得");
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

  // 3. アカウント・ロケーション取得
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

  t();

  // 4. Googleレビュー全取得（複数ページ対応）
  t = timer("Googleレビュー全取得");
  let allReviews = [];
  let nextPageToken = null;
  let page = 1;
  do {
    const url = new URL(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`
    );
    url.searchParams.set("pageSize", "50");
    if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);
    const pgStart = process.hrtime();
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const body = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(body));
    allReviews.push(...(body.reviews || []));
    nextPageToken = body.nextPageToken;
    const pgDiff = process.hrtime(pgStart);
    console.log(
      `  [Google API] ${page}ページ取得: ${(pgDiff[0] + pgDiff[1] / 1e9).toFixed(3)}s, 件数:${body.reviews?.length || 0}`
    );
    page++;
  } while (nextPageToken);

  const totalCount = allReviews.length;
  t();
  console.log(
    `[タイミング] Googleレビュー全取得: ${t()}s, 合計件数:${totalCount}`
  );

  // 5. 既存レビュー取得
  t = timer("DB既存レビュー取得");
  const { data: existing, error: existErr } = await supabase
    .from("reviews")
    .select(
      "review_id, resource_name, star_rating, comment, create_time, update_time, reviewer_display_name, reviewer_profile_photo_url"
    );
  if (existErr) throw existErr;
  t();
  console.log(
    `[タイミング] DB既存レビュー取得: ${t()}s, 件数:${existing.length}`
  );

  // 既存レビューをmap化
  const existingMap = {};
  for (const row of existing) {
    existingMap[row.review_id] = row;
  }

  // 6. 既存返信（review_replies）をmapで取得
  const { data: existingReplies, error: repErr } = await supabase
    .from("review_replies")
    .select("review_id, comment, update_time, sent_at");
  if (repErr) throw repErr;
  const repliesMap = {};
  for (const row of existingReplies) {
    repliesMap[row.review_id] = row;
  }

  // 7. 差分チェック&DB upsert
  t = timer("差分チェック・AI・DB upsert");
  let aiTime = 0;
  let dbTime = 0;
  let changedCount = 0;
  let replyChangedCount = 0;
  let processed = 0;

  const ratingMap = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

  for (const review of allReviews) {
    const review_id = review.reviewId;
    const star_rating = ratingMap[review.starRating] ?? null;
    const comment = review.comment || null;
    const create_time = review.createTime || null;
    const update_time = review.updateTime || null;
    const reviewer_display_name =
      review.reviewer?.displayName || "匿名ユーザー";
    const reviewer_profile_photo_url = review.reviewer?.profilePhotoUrl || null;
    const resource_name = review.name || null;

    const old = existingMap[review_id] || {};
    let needUpsert = false;
    let needAI = false;

    // 主要フィールドの差分比較（厳密比較）
    if (
      !eq(old.resource_name, resource_name) ||
      !eq(old.star_rating, star_rating) ||
      !eq(old.comment, comment) ||
      !eq(old.create_time, create_time) ||
      !eq(old.update_time, update_time) ||
      !eq(old.reviewer_display_name, reviewer_display_name) ||
      !eq(old.reviewer_profile_photo_url, reviewer_profile_photo_url)
    ) {
      needUpsert = true;
      // コメントが違うときだけAIもやり直し
      if (!eq(old.comment, comment)) needAI = true;
    }

    let aiScore = null;
    // AIスコアリングは新規 or コメント変更時のみ
    if (needUpsert && needAI && comment && comment.length > 0) {
      const aiStart = process.hrtime();
      try {
        const prompt = AI_PROMPT + comment;
        const aiRes = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.0,
        });
        const jsonStr =
          aiRes.choices[0].message.content.match(/\{[\s\S]*\}/)?.[0];
        if (jsonStr) aiScore = JSON.parse(jsonStr);
      } catch (e) {
        console.error(`❌ AIスコアリング失敗 for review_id ${review_id}`, e);
      }
      const aiDiff = process.hrtime(aiStart);
      aiTime += aiDiff[0] + aiDiff[1] / 1e9;
    }

    // 差分があった場合のみupsert
    if (needUpsert) {
      const dbStart = process.hrtime();
      const { error: upsertErr } = await supabase.from("reviews").upsert({
        review_id,
        resource_name,
        location_id: locationId,
        star_rating,
        comment,
        create_time,
        update_time,
        reviewer_display_name,
        reviewer_profile_photo_url,
        taste_score: aiScore?.taste ?? old.taste_score ?? null,
        service_score: aiScore?.service ?? old.service_score ?? null,
        price_score: aiScore?.price ?? old.price_score ?? null,
        location_score: aiScore?.location ?? old.location_score ?? null,
        hygiene_score: aiScore?.hygiene ?? old.hygiene_score ?? null,
      });
      if (upsertErr) {
        console.error(`Review upsert error ${review_id}`, upsertErr);
      } else {
        changedCount++;
      }
      const dbDiff = process.hrtime(dbStart);
      dbTime += dbDiff[0] + dbDiff[1] / 1e9;
    }

    // === 返信同期（review_replies） ===
    const reply = review.reviewReply;
    const dbReply = repliesMap[review_id] || null;
    // 厳密に"Google側に返信がある"か
    const hasGoogleReply =
      reply &&
      typeof reply.comment === "string" &&
      reply.comment.trim() !== "" &&
      !!reply.updateTime;

    // Googleに返信がある場合→DBと内容が違えばupsert
    if (hasGoogleReply) {
      if (
        !dbReply ||
        !eq(dbReply.comment, reply.comment) ||
        !eq(dbReply.update_time, reply.updateTime)
      ) {
        console.log(
          `[reply upsert] review_id=${review_id}, Google="${reply.comment}", DB="${dbReply?.comment}"`
        );
        const dbStart = process.hrtime();
        const { error: repUpsertErr } = await supabase
          .from("review_replies")
          .upsert({
            review_id,
            comment: reply.comment,
            update_time: reply.updateTime,
            sent_at: reply.updateTime,
          });
        if (repUpsertErr) {
          console.error(`Reply upsert error ${review_id}`, repUpsertErr);
        } else {
          replyChangedCount++;
        }
        const dbDiff = process.hrtime(dbStart);
        dbTime += dbDiff[0] + dbDiff[1] / 1e9;
      }
    } else if (dbReply) {
      // Googleに返信が無い（削除/未入力）→DBから削除
      console.log(
        `[reply delete] review_id=${review_id}, Google側返信無し, DB側="${dbReply.comment}"`
      );
      const dbStart = process.hrtime();
      const { error: delErr } = await supabase
        .from("review_replies")
        .delete()
        .eq("review_id", review_id);
      if (delErr) {
        console.error(`Reply delete error ${review_id}`, delErr);
      } else {
        replyChangedCount++;
      }
      const dbDiff = process.hrtime(dbStart);
      dbTime += dbDiff[0] + dbDiff[1] / 1e9;
    }

    // 進捗ログ
    processed++;
    if (processed % 20 === 0)
      console.log(`  [処理進捗] ${processed}/${totalCount}件...`);
  }

  t();
  console.log(
    `[タイミング] 差分チェック・AI・DB upsert: ${t()}s\n[詳細] AIスコアリング合計: ${aiTime.toFixed(
      2
    )}s, DB upsert合計: ${dbTime.toFixed(
      2
    )}s (レビュー${changedCount}件, 返信${replyChangedCount}件)`
  );

  tStart();
  console.log(`=== [SYNC] 終了 合計: ${tStart()}s ===`);

  return new Response(
    JSON.stringify({
      message: `レビュー同期完了: ${changedCount}件更新、返信${replyChangedCount}件同期`,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
