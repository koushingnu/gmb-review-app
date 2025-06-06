import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // 全レビュー数を取得
    const { count: totalReviews, error: countError } = await supabase
      .from("reviews")
      .select("*", { count: "exact" });

    if (countError) throw countError;

    // 平均評価を取得
    const { data: avgData, error: avgError } = await supabase
      .from("reviews")
      .select("star_rating");

    if (avgError) throw avgError;

    const averageScore =
      avgData.reduce((acc, curr) => acc + curr.star_rating, 0) /
      (avgData.length || 1);

    // 返信済みレビュー数を取得（review_repliesテーブルとの結合を使用）
    const { count: repliedReviews, error: replyError } = await supabase
      .from("reviews")
      .select("*, review_replies(*)", { count: "exact" })
      .not("review_replies.id", "is", null);

    if (replyError) throw replyError;

    // 返信率を計算
    const replyRate =
      totalReviews > 0 ? Math.round((repliedReviews / totalReviews) * 100) : 0;

    return NextResponse.json({
      totalReviews,
      averageScore: Number(averageScore.toFixed(1)),
      replyRate,
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
      },
      { status: 500 }
    );
  }
}
