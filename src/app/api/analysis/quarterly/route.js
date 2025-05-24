import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year"));
  const quarter = Number(searchParams.get("quarter"));

  if (!year || !quarter) {
    // === パラメータが無い場合は全期間 ===
    // ここでDBから2年分くらい一括で全四半期ごとにデータ取得
    // 例: 2023Q1, Q2, Q3, Q4, 2024Q1, ...
    // 返り値は [{year: 2023, quarter: 1, ...score}, ...] の配列

    // 例: 直近2年分の全四半期
    const now = new Date();
    const years = [now.getFullYear() - 1, now.getFullYear()];
    const allData = [];
    for (let y of years) {
      for (let q = 1; q <= 4; q++) {
        const startMonth = (q - 1) * 3 + 1;
        const endMonth = startMonth + 2;
        const fromDate = new Date(Date.UTC(y, startMonth - 1, 1)).toISOString();
        const toDate = new Date(Date.UTC(y, endMonth, 0)).toISOString();
        const { data, error } = await supabaseAdmin.rpc(
          "get_quarterly_scores",
          {
            from_date: fromDate,
            to_date: toDate,
          }
        );
        if (error) continue; // エラーはスキップ
        if (data?.[0]) {
          allData.push({
            year: y,
            quarter: q,
            ...data[0], // スコア各種
          });
        }
      }
    }

    // 何もなければ空配列
    return new Response(JSON.stringify(allData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ここ以降は「年・四半期指定あり」の場合（今まで通り）
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  const fromDate = new Date(
    Date.UTC(year - 2, startMonth - 1, 1)
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
