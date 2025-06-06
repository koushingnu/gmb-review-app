import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const sortBy = searchParams.get("sortBy") ?? "newest";
    const filterRating = searchParams.get("filterRating");

    // review_repliesを「update_time降順」でJOIN
    let query = supabase
      .from("reviews")
      .select("*, review_replies(comment, update_time)")
      .order("update_time", {
        foreignTable: "review_replies",
        ascending: false,
      }); // ← 追加

    if (from) query = query.gte("create_time", from);
    if (to) query = query.lte("create_time", to);
    if (filterRating) query = query.eq("star_rating", Number(filterRating));

    // ソート条件の適用
    switch (sortBy) {
      case "rating_high":
      query = query.order("star_rating", { ascending: false });
        break;
      case "rating_low":
        query = query.order("star_rating", { ascending: true });
        break;
      case "oldest":
        query = query.order("create_time", { ascending: true });
        break;
      case "newest":
      default:
      query = query.order("create_time", { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (error) throw error;

    // 最新の返信が先頭になる
    const reviews = data.map((r) => ({
      ...r,
      reply: r.review_replies?.length ? r.review_replies[0] : null,
    }));

    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("❌ Fetch reviews error:", err);
    return NextResponse.json(
      {
        message: "レビュー取得に失敗しました",
        error: err.message,
        reviews: [],
      },
      { status: 500 }
    );
  }
}
