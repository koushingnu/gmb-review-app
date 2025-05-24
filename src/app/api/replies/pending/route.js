// /src/app/api/replies/pending/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("review_replies")
    .select("review_id, comment, update_time")
    .is("sent_at", null)
    .order("update_time", { ascending: false });

  // オプション: reviewsテーブルの情報もJOINで取得可
  // .select("*, reviews(reviewer_display_name, comment, star_rating, create_time)")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ replies: data });
}
