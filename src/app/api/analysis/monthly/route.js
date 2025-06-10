import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    // 環境変数のチェック
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase環境変数が設定されていません");
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 今月のデータを取得
    const { data: thisMonthData, error: thisMonthError } = await supabaseAdmin
      .from("reviews")
      .select(
        `
        taste_score,
        service_score,
        price_score,
        location_score,
        hygiene_score,
        create_time
      `
      )
      .gte("create_time", thisMonth.toISOString())
      .lt("create_time", now.toISOString());

    if (thisMonthError) {
      console.error("今月のデータ取得エラー:", thisMonthError);
      throw new Error(
        `今月のデータ取得に失敗しました: ${thisMonthError.message}`
      );
    }

    console.log("=== 月間比較データ取得結果 ===");
    console.log("期間:", {
      今月: {
        開始: thisMonth.toISOString(),
        終了: now.toISOString(),
        データ件数: thisMonthData.length,
      },
    });
    console.log("今月の生データサンプル:", thisMonthData.slice(0, 2));

    // 先月のデータを取得
    const { data: lastMonthData, error: lastMonthError } = await supabaseAdmin
      .from("reviews")
      .select(
        `
        taste_score,
        service_score,
        price_score,
        location_score,
        hygiene_score,
        create_time
      `
      )
      .gte("create_time", lastMonth.toISOString())
      .lt("create_time", thisMonth.toISOString());

    if (lastMonthError) {
      console.error("先月のデータ取得エラー:", lastMonthError);
      throw new Error(
        `先月のデータ取得に失敗しました: ${lastMonthError.message}`
      );
    }

    console.log("期間:", {
      先月: {
        開始: lastMonth.toISOString(),
        終了: thisMonth.toISOString(),
        データ件数: lastMonthData.length,
      },
    });
    console.log("先月の生データサンプル:", lastMonthData.slice(0, 2));

    // データが存在するか確認
    if (!thisMonthData || !lastMonthData) {
      throw new Error("データが見つかりませんでした");
    }

    // 平均値を計算する関数
    const calculateAverage = (data, field) => {
      try {
        // より厳密なフィルタリング
        const validValues = data.filter((review) => {
          const value = Number(review[field]);
          return (
            review[field] !== null &&
            review[field] !== undefined &&
            !isNaN(value) &&
            value > 0 // 明示的に0より大きい値のみを対象とする
          );
        });

        // 有効なデータがない場合
        if (validValues.length === 0) {
          console.log(`${field}の有効なデータがありません`);
          return null;
        }

        // 平均値の計算
        const sum = validValues.reduce((acc, review) => {
          const value = Number(review[field]);
          return acc + value;
        }, 0);

        const average = Number((sum / validValues.length).toFixed(1));

        // デバッグ情報
        console.log(`${field}の集計:`, {
          総データ数: data.length,
          有効データ数: validValues.length,
          平均値: average,
          有効なデータの値: validValues.map((v) => v[field]),
        });

        return average;
      } catch (error) {
        console.error(`平均値計算エラー (${field}):`, error);
        return null;
      }
    };

    // 各月の平均値を計算
    const thisMonthAverages = {
      taste: calculateAverage(thisMonthData, "taste_score"),
      service: calculateAverage(thisMonthData, "service_score"),
      price: calculateAverage(thisMonthData, "price_score"),
      environment: calculateAverage(thisMonthData, "location_score"),
      location: calculateAverage(thisMonthData, "hygiene_score"),
    };

    const lastMonthAverages = {
      taste: calculateAverage(lastMonthData, "taste_score"),
      service: calculateAverage(lastMonthData, "service_score"),
      price: calculateAverage(lastMonthData, "price_score"),
      environment: calculateAverage(lastMonthData, "location_score"),
      location: calculateAverage(lastMonthData, "hygiene_score"),
    };

    // 増減を計算
    const calculateChange = (current, previous) => {
      try {
        // nullチェックを追加
        if (current === null || previous === null) {
          return null;
        }
        // 0チェックを追加
        if (previous === 0 || current === 0) {
          return null;
        }
        return Number((((current - previous) / previous) * 100).toFixed(1));
      } catch (error) {
        console.error("増減計算エラー:", error);
        return null;
      }
    };

    // 各項目の増減を計算
    const comparison = {
      taste: calculateChange(thisMonthAverages.taste, lastMonthAverages.taste),
      service: calculateChange(
        thisMonthAverages.service,
        lastMonthAverages.service
      ),
      price: calculateChange(thisMonthAverages.price, lastMonthAverages.price),
      environment: calculateChange(
        thisMonthAverages.environment,
        lastMonthAverages.environment
      ),
      location: calculateChange(
        thisMonthAverages.location,
        lastMonthAverages.location
      ),
    };

    // レスポンスデータの検証
    const responseData = {
      comparison,
      thisMonth: thisMonthAverages,
      lastMonth: lastMonthAverages,
      metadata: {
        thisMonthCount: thisMonthData.length,
        lastMonthCount: lastMonthData.length,
        periodStart: lastMonth.toISOString(),
        periodEnd: now.toISOString(),
      },
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[MONTHLY_COMPARISON_GET]", error);
    return new Response(
      JSON.stringify({
        error: "月間比較データの取得に失敗しました",
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
