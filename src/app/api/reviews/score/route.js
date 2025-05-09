import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST() {
  // 未スコアのレビューを取得
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .is("taste_score", null);

  if (error) return new Response("DB読み込みエラー", { status: 500 });

  for (const r of reviews) {
    // OpenAI にプロンプト送信
    const prompt = `
次のレビューから５項目（味, 接客, 価格, 立地, 衛生面）を 1-5 の整数で評価してください。
レビュー: "${r.comment}"
フォーマット: JSONで{"taste":x,"service":y,"price":z,"location":u,"hygiene":v}
`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });
    const scores = JSON.parse(completion.choices[0].message.content);

    // DB 更新
    await supabase
      .from("reviews")
      .update({
        taste_score: scores.taste,
        service_score: scores.service,
        price_score: scores.price,
        location_score: scores.location,
        hygiene_score: scores.hygiene,
      })
      .eq("review_id", r.review_id);
  }

  return new Response(JSON.stringify({ updated: reviews.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
