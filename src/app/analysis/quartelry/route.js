import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year"));
  const quarter = Number(searchParams.get("quarter"));

  // 四半期の開始・終了月を計算
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = startMonth + 2;

  // 1年前の同じ四半期開始日～選択四半期末日まで
  const fromDate = new Date(Date.UTC(year - 1, startMonth - 1, 1));
  const toDate = new Date(Date.UTC(year, endMonth, 0));

  const { data, error } = await supabaseAdmin.rpc("get_quarterly_scores", {
    from_date: fromDate.toISOString(),
    to_date: toDate.toISOString(),
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
