// src/app/api/reviews/summary/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    // 1. Supabase Admin で全レビューのコメントを取得
    const { data: reviews, error: fetchError } = await supabaseAdmin
      .from("reviews")
      .select("comment")
      .not("comment", "is", null);
    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      throw new Error("コメントの取得に失敗しました");
    }

    // 2. 全コメントを改行区切りで結合し、プロンプトを組み立て
    const commentsText = reviews
      .map((r) => r.comment.trim())
      .filter((c) => c.length > 0)
      .join("\n\n");
    const systemPrompt = `
あなたはレストランレビューのエキスパートです。
以下の全てのユーザーコメントを読み、「味」「接客」「価格」「立地」「衛生面」の
５つの観点で全体的な総評を作成してください。
各観点ごとに要点を2〜3文ずつ、日本語でまとめてください。
`;
    const messages = [
      { role: "system", content: systemPrompt.trim() },
      { role: "user", content: commentsText },
    ];

    // 3. OpenAI Chat API を実行
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });
    const summary = chatResponse.choices?.[0]?.message?.content?.trim();
    if (!summary) {
      throw new Error("AIから総評が取得できませんでした");
    }

    // 4. クライアントに JSON で返却
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("SUMMARY ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "内部サーバーエラー" },
      { status: 500 }
    );
  }
}
