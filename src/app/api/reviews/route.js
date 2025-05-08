// src/app/api/reviews/route.js
import { supabase } from "@/lib/supabase"; // エイリアスを使う場合

export async function GET() {
  // DB からレビューを取得
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      `
      review_id,
      reviewer_display_name,
      star_rating,
      comment,
      create_time
    `
    )
    .order("create_time", { ascending: false });

  if (error) {
    console.error("❌ Fetch reviews error:", error);
    return new Response(
      JSON.stringify({ message: "レビュー取得に失敗しました", reviews: [] }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // フロント用に配列を返却
  return new Response(JSON.stringify({ reviews }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
