import { supabaseAdmin } from "@/lib/supabaseAdmin";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_PROMPT = `
あなたは日本の飲食店レビュー評価AIです。
以下の日本語レビュー文を厳格に精査し、記載内容がある観点だけに0～5点の整数値をつけてください。
【観点と基準例】
- 味（taste）：料理のおいしさ・味付け・素材の質など。具体的な称賛や不満、味の詳細描写がある場合のみ点数をつけてください。
- サービス（service）：接客の丁寧さ・スピード・対応の親切さ。関連する記述がある場合のみ点数をつけてください。
- 価格（price）：値段に対する満足度やコスパ。価格についての記述がある場合のみ点数をつけてください。
- 立地（location）：アクセスの良さ、駅からの距離、周辺の便利さ。記載がある場合のみ点数をつけてください。
- 衛生（hygiene）：店内の清潔さや衛生管理について記載がある場合のみ点数をつけてください。
【出力形式】
各観点についてレビュー本文に記載がなければ、スコアは必ず0にしてください（スコア0は「その観点について言及なし」を意味します）。
必ず以下のJSON形式で出力してください。余計な説明は一切不要です。
{"taste": 整数, "service": 整数, "price": 整数, "location": 整数, "hygiene": 整数}
【レビュー本文】
`;

export async function POST() {
  try {
    console.log("[AI_RESCORE] AI再評価開始");

    // 全レビューを取得（コメントがあるもののみ）
    const { data: reviews, error: fetchError } = await supabaseAdmin
      .from("reviews")
      .select("review_id, comment")
      .not("comment", "is", null)
      .neq("comment", "");

    if (fetchError) {
      console.error("[AI_RESCORE] レビュー取得エラー:", fetchError);
      throw fetchError;
    }

    console.log(`[AI_RESCORE] 対象レビュー数: ${reviews.length}件`);

    let successCount = 0;
    let errorCount = 0;

    // 各レビューをAIで評価
    for (const review of reviews) {
      try {
        const prompt = AI_PROMPT + review.comment;
        const aiRes = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.0,
        });

        const jsonStr = aiRes.choices[0].message.content.match(
          /\{[\s\S]*\}/
        )?.[0];
        if (!jsonStr) {
          console.error(
            `[AI_RESCORE] JSONパースエラー for ${review.review_id}`
          );
          errorCount++;
          continue;
        }

        const aiScore = JSON.parse(jsonStr);

        // レビューを更新
        const { error: updateError } = await supabaseAdmin
          .from("reviews")
          .update({
            taste_score: aiScore.taste ?? null,
            service_score: aiScore.service ?? null,
            hygiene_score: aiScore.hygiene ?? null,
            location_score: aiScore.location ?? null,
            price_score: aiScore.price ?? null,
          })
          .eq("review_id", review.review_id);

        if (updateError) {
          console.error(
            `[AI_RESCORE] 更新エラー for ${review.review_id}:`,
            updateError
          );
          errorCount++;
        } else {
          successCount++;
          console.log(`[AI_RESCORE] 成功 (${successCount}/${reviews.length})`);
        }

        // レート制限を避けるため、少し待機
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.error(
          `[AI_RESCORE] エラー for ${review.review_id}:`,
          e.message
        );
        errorCount++;
      }
    }

    console.log(
      `[AI_RESCORE] 完了 - 成功: ${successCount}件, エラー: ${errorCount}件`
    );

    return new Response(
      JSON.stringify({
        message: `AI再評価完了`,
        count: successCount,
        errors: errorCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[AI_RESCORE] エラー:", error);
    return new Response(
      JSON.stringify({
        error: "AI再評価に失敗しました",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

