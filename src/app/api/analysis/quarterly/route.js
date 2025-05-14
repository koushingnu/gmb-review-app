// src/app/api/analysis/quarterly/route.js
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year"));
  const quarter = Number(searchParams.get("quarter"));
  if (!year || !quarter) {
    return new Response(
      JSON.stringify({ error: "year and quarter are required" }),
      { status: 400 }
    );
  }

  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  const fromDate = new Date(
    Date.UTC(year - 1, startMonth - 1, 1)
  ).toISOString();
  const toDate = new Date(Date.UTC(year, endMonth, 0)).toISOString();

  const { data, error } = await supabaseAdmin.rpc("get_quarterly_scores", {
    from_date: fromDate,
    to_date: toDate,
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
