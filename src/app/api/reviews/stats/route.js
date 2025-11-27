import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyIdFromUser } from "@/lib/getCompanyId";

export async function GET() {
  try {
    // 認証チェック & company_id取得
    const companyId = await getCompanyIdFromUser();
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 全レビュー数を取得（自社のみ）
    const { count: totalReviews, error: countError } = await supabase
      .from("reviews")
      .select("*", { count: "exact" })
      .eq("company_id", companyId);

    if (countError) throw countError;

    // 平均評価を取得（自社のみ）
    const { data: avgData, error: avgError } = await supabase
      .from("reviews")
      .select("star_rating")
      .eq("company_id", companyId);

    if (avgError) throw avgError;

    const averageScore =
      avgData.reduce((acc, curr) => acc + curr.star_rating, 0) /
      (avgData.length || 1);

    // 返信情報を取得（返信時間の計算も含む、自社のみ）
    const { data: reviewsWithReplies, error: replyError } = await supabase
      .from("reviews")
      .select(`
        *,
        review_replies (
          id,
          update_time
        )
      `)
      .eq("company_id", companyId);

    if (replyError) throw replyError;

    // 返信関連の統計を計算
    let totalResponseTime = 0;
    let responseCount = 0;
    const repliedReviews = reviewsWithReplies.filter((review) => {
      if (review.review_replies?.length) {
        // 返信時間を計算
        const createTime = new Date(review.create_time);
        const replyTime = new Date(review.review_replies[0].update_time);
        const diffHours = (replyTime - createTime) / (1000 * 60 * 60);
        totalResponseTime += diffHours;
        responseCount++;
        return true;
      }
      return false;
    }).length;

    // 返信率と平均返信時間を計算
    const replyRate =
      totalReviews > 0 ? Math.round((repliedReviews / totalReviews) * 100) : 0;
    const averageResponseTime = responseCount
      ? Math.round(totalResponseTime / responseCount)
      : 0;

    // 月間レビュー数と前月比を計算
    const now = new Date();
    const thisMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();
    const lastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    ).toISOString();
    const twoMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      1
    ).toISOString();

    // 今月のレビュー数（自社のみ）
    const { count: monthlyReviews } = await supabase
      .from("reviews")
      .select("*", { count: "exact" })
      .eq("company_id", companyId)
      .gte("create_time", thisMonth);

    // 先月のレビュー数（自社のみ）
    const { count: lastMonthReviews } = await supabase
      .from("reviews")
      .select("*", { count: "exact" })
      .eq("company_id", companyId)
      .gte("create_time", lastMonth)
      .lt("create_time", thisMonth);

    // 前月比を計算
    const monthlyTrend =
      lastMonthReviews > 0
        ? Math.round(
            ((monthlyReviews - lastMonthReviews) / lastMonthReviews) * 100
          )
        : 0;

    return NextResponse.json({
      totalReviews,
      averageScore: Number(averageScore.toFixed(1)),
      replyRate,
      responded: repliedReviews,
      average_response_time: averageResponseTime,
      monthlyReviews,
      monthlyTrend,
    });
  } catch (error) {
    console.error("[REVIEWS_STATS_GET]", error);
    return NextResponse.json(
      {
        message: "統計情報の取得に失敗しました",
        error: error.message,
        totalReviews: 0,
        averageScore: 0,
        replyRate: 0,
        responded: 0,
        average_response_time: 0,
        monthlyReviews: 0,
        monthlyTrend: 0,
      },
      { status: 500 }
    );
  }
}
