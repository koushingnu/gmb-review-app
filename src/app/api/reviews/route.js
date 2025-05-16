// src/app/api/reviews/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all"); // 追加

    // --- all=1の時だけ全件・全カラムで返す ---
    if (all === "1") {
      const { data, error } = await supabase.from("reviews").select("*");
      if (error) throw error;
      return NextResponse.json(data); // ←従来型、reviewsプロパティ不要
    }

    // --- ここから下は既存ロジックそのまま ---
    const from = searchParams.get("from"); // YYYY-MM-DD
    const to = searchParams.get("to"); // YYYY-MM-DD
    const sortBy = searchParams.get("sortBy") ?? "newest";
    const filterRating = searchParams.get("filterRating"); // e.g. "4"

    let query = supabase.from("reviews").select(`
      review_id,
      reviewer_display_name,
      star_rating,
      comment,
      create_time
    `);

    // 日付フィルタ
    if (from) query = query.gte("create_time", from);
    if (to) query = query.lte("create_time", to);

    // 評価フィルタ
    if (filterRating) {
      query = query.gte("star_rating", Number(filterRating));
    }

    // ソート
    if (sortBy === "highest") {
      query = query.order("star_rating", { ascending: false });
    } else {
      query = query.order("create_time", { ascending: false });
    }

    const { data: reviews, error } = await query;
    if (error) throw error;

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
