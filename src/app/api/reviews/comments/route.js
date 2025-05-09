// src/app/api/reviews/comments/route.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase の環境変数が設定されていません");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  const { data: comments, error } = await supabase
    .from("reviews")
    .select("review_id, reviewer_display_name, comment, create_time")
    .order("create_time", { ascending: false });

  if (error) {
    console.error("❌ Fetch comments error:", error);
    return new Response(
      JSON.stringify({ message: "コメント取得に失敗しました", comments: [] }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ comments }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
