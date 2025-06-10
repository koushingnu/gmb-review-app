import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // 総レビュー数を取得
    const { count: total } = await supabase
      .from("reviews")
      .select("*", { count: "exact" });

    // 返信済みレビュー数を取得
    const { count: responded } = await supabase
      .from("reviews")
      .select("*", { count: "exact" })
      .not("review_replies", "is", null);

    // 平均返信時間を計算（時間単位）
    const { data: responseTimes } = await supabase
      .from("reviews")
      .select(
        `
        create_time,
        review_replies (
          update_time
        )
      `
      )
      .not("review_replies", "is", null);

    let totalResponseTime = 0;
    let responseCount = 0;

    responseTimes?.forEach((review) => {
      if (review.review_replies?.[0]) {
        const createTime = new Date(review.create_time);
        const replyTime = new Date(review.review_replies[0].update_time);
        const diffHours = (replyTime - createTime) / (1000 * 60 * 60);
        totalResponseTime += diffHours;
        responseCount++;
      }
    });

    const average_response_time = responseCount
      ? Math.round(totalResponseTime / responseCount)
      : 0;

    return NextResponse.json({
      total,
      responded,
      average_response_time,
    });
  } catch (err) {
    console.error("❌ Fetch response stats error:", err);
    return NextResponse.json(
      {
        message: "返信統計の取得に失敗しました",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
