// src/app/api/reviews/sync/route.js
import { google } from "googleapis";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

// AIプロンプト（精度重視・変更OK）
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

export async function GET() {
  try {
    // 1. OAuth2 クライアント初期化
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({
      access_token: process.env.ACCESS_TOKEN,
      refresh_token: process.env.REFRESH_TOKEN,
    });

    // 2. Google My Business クライアント作成
    const businessInfo = google.mybusinessbusinessinformation({
      version: "v1",
      auth: oauth2Client,
    });
    const accountMgmt = google.mybusinessaccountmanagement({
      version: "v1",
      auth: oauth2Client,
    });

    // 3. アカウントID取得
    const accountsRes = await accountMgmt.accounts.list();
    const accountIdFull = accountsRes.data.accounts?.[0]?.name;
    if (!accountIdFull) {
      return new Response(
        JSON.stringify({ message: "アカウントが見つかりません" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const accountId = accountIdFull.split("/")[1];

    // 4. ロケーションID取得
    const locRes = await businessInfo.accounts.locations.list({
      parent: accountIdFull,
      readMask: "name",
    });
    const locations = locRes.data.locations || [];
    if (locations.length === 0) {
      return new Response(
        JSON.stringify({ message: "ロケーションがありません" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const locationName = locations[0].name; // e.g. "accounts/123/locations/456"
    const locationId = locationName.split("/")[1];

    // 5. Supabase にロケーション upsert
    await supabase
      .from("locations")
      .upsert({ id: locationId, resource_name: locationName });

    // 6. Google API から全ページ分フェッチ（pageSize=50）
    const token = (await oauth2Client.getAccessToken()).token;
    let allReviews = [];
    let nextPageToken = null;
    do {
      const url = new URL(
        `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`
      );
      url.searchParams.set("pageSize", "50");
      if (nextPageToken) {
        url.searchParams.set("pageToken", nextPageToken);
      }
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(body));
      allReviews.push(...(body.reviews || []));
      nextPageToken = body.nextPageToken;
    } while (nextPageToken);

    // 7. DB にある既存の review_id を全取得
    const { data: existing, error: existErr } = await supabase
      .from("reviews")
      .select("review_id");
    if (existErr) throw existErr;
    const existingIds = new Set(existing.map((r) => r.review_id));

    // 8. 新規レビューのみフィルタ
    const newReviews = allReviews.filter((r) => !existingIds.has(r.reviewId));

    // 9. 新規がなければ早期リターン
    if (newReviews.length === 0) {
      return new Response(
        JSON.stringify({ message: "新規レビューはありませんでした" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 10. 新規レビューごとにAIスコアリング＆保存
    const ratingMap = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
    let insertedCount = 0;

    for (const review of newReviews) {
      const review_id = review.reviewId;
      const star_rating = ratingMap[review.starRating] ?? null;
      const comment = review.comment || null;

      // --------- AIスコアリング ---------
      let aiScore = null;
      if (comment && comment.length > 0) {
        const prompt = AI_PROMPT + comment;
        try {
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
      }
      // --------- DB保存（AIスコア付き） ---------
      const { error: revErr } = await supabase.from("reviews").upsert({
        review_id,
        resource_name: review.name,
        location_id: locationId,
        star_rating,
        comment,
        create_time: review.createTime,
        update_time: review.updateTime,
        reviewer_display_name: review.reviewer?.displayName || "匿名ユーザー",
        reviewer_profile_photo_url: review.reviewer?.profilePhotoUrl || null,
        taste_score: aiScore?.taste ?? null,
        service_score: aiScore?.service ?? null,
        price_score: aiScore?.price ?? null,
        location_score: aiScore?.location ?? null,
        hygiene_score: aiScore?.hygiene ?? null,
      });
      if (revErr) {
        console.error(`❌ Review upsert failed for ${review_id}`, revErr);
      } else {
        insertedCount++;
      }

      // review_replies テーブルに upsert（返信があれば）
      if (review.reviewReply) {
        const { error: repErr } = await supabase.from("review_replies").upsert({
          review_id,
          comment: review.reviewReply.comment,
          update_time: review.reviewReply.updateTime,
        });
        if (repErr) {
          console.error(`❌ Reply upsert failed for ${review_id}`, repErr);
        }
      }
    }

    // 11. レスポンス返却
    return new Response(
      JSON.stringify({
        message: `${insertedCount} 件の新規レビューを同期（AIスコア付き）しました`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({
        message: "同期エラーが発生しました",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
