// src/app/api/analysis/rating-distribution/route.js
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  // star_rating ごとの件数を集計
  const { data, error } = await supabaseAdmin.rpc("get_rating_distribution");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
