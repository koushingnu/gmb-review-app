// src/app/api/reviews/summary/route.js
import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  // Supabase からすべてのコメントだけ抽出
  const { data: reviews, error } = await supabaseAdmin
    .from("reviews")
    .select("comment")
    .not("comment", "is", null);

  if (error) {
    return new Response(
      JSON.stringify({ error: "コメント取得に失敗しました" }),
      { status: 500 }
    );
  }

  const comments = reviews.map((r) => r.comment);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `
以下のレビューコメントを読んで、５項目（味, 接客, 価格, 立地, 衛生面）について総評を1段落ずつ日本語でお願いします。

${comments.join("\n")}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return new Response(
    JSON.stringify({ summary: res.choices[0].message.content }),
    { status: 200 }
  );
}
