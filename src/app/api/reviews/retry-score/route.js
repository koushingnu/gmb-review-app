import { supabase } from "@/lib/supabase";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export async function POST(req) {
  const { review_id } = await req.json();

  // 該当レビュー取得
  const { data: review, error } = await supabase
    .from("reviews")
    .select("review_id, comment")
    .eq("review_id", review_id)
    .single();

  if (error || !review) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
    });
  }

  const prompt = AI_PROMPT + review.comment;
  let score = null;

  try {
    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.0,
    });
    const jsonStr = aiRes.choices[0].message.content.match(/\{[\s\S]*\}/)?.[0];
    if (jsonStr) score = JSON.parse(jsonStr);
  } catch (e) {
    return new Response(JSON.stringify({ error: "AI error" }), { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("reviews")
    .update({
      taste_score: typeof score?.taste === "number" ? score.taste : 0,
      service_score: typeof score?.service === "number" ? score.service : 0,
      price_score: typeof score?.price === "number" ? score.price : 0,
      location_score: typeof score?.location === "number" ? score.location : 0,
      hygiene_score: typeof score?.hygiene === "number" ? score.hygiene : 0,
    })
    .eq("review_id", review_id);

  if (updateError) {
    return new Response(JSON.stringify({ error: "DB error" }), { status: 500 });
  }

  return new Response(JSON.stringify({ result: "re-scored", score }), {
    status: 200,
  });
}
