// src/app/api/reviews/compare-summary/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "gpt-4o";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // 前期
    const from1 = searchParams.get("from1");
    const to1 = searchParams.get("to1");
    // 今期
    const from2 = searchParams.get("from2");
    const to2 = searchParams.get("to2");

    // 1. 前期・今期のレビュー取得
    const { data: prevReviews } = await supabaseAdmin
      .from("reviews")
      .select("star_rating, comment")
      .not("comment", "is", null)
      .gte("create_time", from1)
      .lte("create_time", to1);

    const { data: currReviews } = await supabaseAdmin
      .from("reviews")
      .select("star_rating, comment")
      .not("comment", "is", null)
      .gte("create_time", from2)
      .lte("create_time", to2);

    // 2. 文字列整形
    const prevComments = (prevReviews || [])
      .map((r) =>
        r.comment && r.comment.trim()
          ? `【${r.star_rating ? `${r.star_rating}★` : "?"}】${r.comment.trim()}`
          : null
      )
      .filter(Boolean)
      .join("\n");
    const currComments = (currReviews || [])
      .map((r) =>
        r.comment && r.comment.trim()
          ? `【${r.star_rating ? `${r.star_rating}★` : "?"}】${r.comment.trim()}`
          : null
      )
      .filter(Boolean)
      .join("\n");

    // 3. スコア増減（delta）もクエリで受け取る
    const delta = {
      味: searchParams.get("delta_taste") || "不明",
      接客: searchParams.get("delta_service") || "不明",
      価格: searchParams.get("delta_price") || "不明",
      店内環境: searchParams.get("delta_location") || "不明",
      立地: searchParams.get("delta_hygiene") || "不明",
    };

    // 4. AIプロンプト
    const prompt = `
あなたはレストランレビューの分析専門家です。
下記の「前期」と「今期」のレビューコメント、および各観点ごとのスコア増減値を参考に、
「味」「接客」「価格」「店内環境」「立地」ごとに、どのようなレビュー内容の変化が増減に寄与したかを推測し、要因や違いを日本語で要約してください。
各観点について、下記の情報を考慮して出力してください。
- その観点のスコア変化（例:+0.2, -0.1 など）
- 前期と今期で現れる意見やキーワードの違い
- 代表的なレビュー内容（あれば実際の表現を引用）

# 各観点のスコア増減
【味】${delta.味}
【接客】${delta.接客}
【価格】${delta.価格}
【店内環境】${delta.店内環境}
【立地】${delta.立地}

# 前期レビュー
${prevComments}

# 今期レビュー
${currComments}

出力例：
【味】増減:+0.2。今期は「おいしい」「風味がアップ」などポジティブな表現が増加。前期は...など、違いの要約と要因。
【接客】増減:-0.1。今期は「店員の態度がやや気になった」という声が増えた。
...
`.trim();

    // 5. AIへリクエスト
    const chatResponse = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: prompt }],
      temperature: 0.6,
      max_tokens: 1200,
    });

    const summary = chatResponse.choices?.[0]?.message?.content?.trim();
    if (!summary) throw new Error("AIから比較サマリーが取得できませんでした");

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("COMPARE SUMMARY ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "内部サーバーエラー" },
      { status: 500 }
    );
  }
}
