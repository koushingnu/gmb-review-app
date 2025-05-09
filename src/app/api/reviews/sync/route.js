// src/app/api/reviews/sync/route.js
import { google } from "googleapis";
import { supabase } from "@/lib/supabase";

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
        { status: 404 }
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
        { status: 404 }
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

    // 7. DB 側のレコード数を取得
    const { count: dbCount, error: countErr } = await supabase
      .from("reviews")
      .select("review_id", { head: true, count: "exact" });
    if (countErr) throw countErr;

    // 8. フル同期か差分同期か判定
    const isFullSync = (dbCount ?? 0) < allReviews.length;

    // 9. フィルタリング：フル同期なら全件、それ以外は差分同期
    let toUpsert = allReviews;
    if (!isFullSync) {
      // 差分同期モード：DB の最新 create_time より後のレビューだけ
      const { data: latest, error: latestErr } = await supabase
        .from("reviews")
        .select("create_time")
        .eq("location_id", locationId)
        .order("create_time", { ascending: false })
        .limit(1);
      if (latestErr) throw latestErr;
      const lastSyncIso = latest?.[0]?.create_time
        ? new Date(latest[0].create_time).toISOString()
        : null;
      toUpsert = lastSyncIso
        ? allReviews.filter((r) => r.createTime > lastSyncIso)
        : allReviews;
    }

    // 10. starRating 列挙値 → 数値マッピング
    const ratingMap = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

    // 11. Supabase に upsert（レビュー & 返信）
    for (const review of toUpsert) {
      const review_id = review.reviewId;
      const star_rating = ratingMap[review.starRating] ?? null;

      const { error: revErr } = await supabase.from("reviews").upsert({
        review_id,
        resource_name: review.name,
        location_id: locationId,
        star_rating,
        comment: review.comment || null,
        create_time: review.createTime,
        update_time: review.updateTime,
        reviewer_display_name: review.reviewer?.displayName || "匿名ユーザー",
        reviewer_profile_photo_url: review.reviewer?.profilePhotoUrl || null,
      });
      if (revErr) {
        console.error(`❌ Review upsert failed for ${review_id}`, revErr);
      }

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

    return new Response(
      JSON.stringify({
        message: `${toUpsert.length} 件のレビューを同期しました (${
          isFullSync ? "全件同期" : "差分同期"
        })`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
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
