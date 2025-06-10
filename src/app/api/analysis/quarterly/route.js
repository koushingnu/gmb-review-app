import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  try {
    // 直近2年分の全四半期
    const now = new Date();
    const years = [now.getFullYear() - 1, now.getFullYear()];
    const allData = [];

    console.log("=== 四半期データ取得開始 ===");
    console.log("対象期間:", years);

    for (let y of years) {
      for (let q = 1; q <= 4; q++) {
        const startMonth = (q - 1) * 3 + 1;
        const endMonth = startMonth + 2;
        const fromDate = new Date(Date.UTC(y, startMonth - 1, 1)).toISOString();
        const toDate = new Date(Date.UTC(y, endMonth, 0)).toISOString();

        console.log(`\n${y}年Q${q}の処理:`, {
          開始: fromDate,
          終了: toDate,
        });

        // 四半期ごとの平均評価を取得
        const { data, error } = await supabaseAdmin
          .from("reviews")
          .select("star_rating")
          .gte("create_time", fromDate)
          .lt("create_time", toDate);

        if (error) {
          console.error(`${y}年Q${q}のデータ取得エラー:`, error);
          continue;
        }

        // 有効なデータがある場合のみ追加
        if (data && data.length > 0) {
          const validRatings = data
            .map((r) => Number(r.star_rating))
            .filter((r) => !isNaN(r) && r > 0);

          console.log(`${y}年Q${q}の集計:`, {
            総データ数: data.length,
            有効データ数: validRatings.length,
            データサンプル: validRatings.slice(0, 3),
          });

          if (validRatings.length > 0) {
            const avgRating =
              validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
            allData.push({
              year: y,
              quarter: q,
              rating: Number(avgRating.toFixed(1)),
              count: validRatings.length,
            });
          }
        }
      }
    }

    // データを時系列順にソート
    const sortedData = allData.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    });

    console.log("\n=== 四半期データ集計結果 ===");
    console.log("データ件数:", sortedData.length);
    console.log("集計結果:", sortedData);

    return NextResponse.json(sortedData);
  } catch (error) {
    console.error("Error in quarterly analysis:", error);
    return NextResponse.json(
      { error: "四半期データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
