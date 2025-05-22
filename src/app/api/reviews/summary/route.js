// src/app/api/reviews/summary/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "gpt-4o";
const CHUNK_SIZE = 25;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let reviewQuery = supabaseAdmin
      .from("reviews")
      .select("review_id")
      .not("comment", "is", null);
    if (from) reviewQuery = reviewQuery.gte("create_time", from);
    if (to) reviewQuery = reviewQuery.lte("create_time", to);
    const { data: reviewIds, error: reviewError } = await reviewQuery;
    if (reviewError)
      throw new Error("レビュー数取得失敗: " + JSON.stringify(reviewError));
    const reviewCount = reviewIds.length;
    if (reviewCount === 0) {
      return NextResponse.json({ summary: "レビューがありません。" });
    }

    let cacheQuery = supabaseAdmin
      .from("reviews_summary_cache")
      .select("*")
      .eq("review_count", reviewCount);
    if (from) cacheQuery = cacheQuery.eq("period_from", from);
    if (to) cacheQuery = cacheQuery.eq("period_to", to);
    const { data: cachedRows, error: cacheError } = await cacheQuery;
    if (cacheError)
      throw new Error("キャッシュ参照エラー: " + JSON.stringify(cacheError));

    if (cachedRows?.length && cachedRows[0]?.summary) {
      return NextResponse.json({ summary: cachedRows[0].summary });
    }

    let commentQuery = supabaseAdmin
      .from("reviews")
      .select("comment")
      .not("comment", "is", null);
    if (from) commentQuery = commentQuery.gte("create_time", from);
    if (to) commentQuery = commentQuery.lte("create_time", to);
    const { data: reviews, error: fetchError } = await commentQuery;
    if (fetchError)
      throw new Error("コメント取得失敗: " + JSON.stringify(fetchError));

    const comments = reviews
      .map((r) => r.comment?.trim())
      .filter((c) => c && c.length > 0);

    if (comments.length === 0) {
      return NextResponse.json({ summary: "レビューがありません。" });
    }

    const chunks = [];
    for (let i = 0; i < comments.length; i += CHUNK_SIZE) {
      chunks.push(comments.slice(i, i + CHUNK_SIZE));
    }

    const partialSummaries = [];
    for (const chunk of chunks) {
      const prompt = `
あなたは一流の日本語レストランレビュー要約AIです。
次の複数の口コミコメントを読み、「味」「接客」「価格」「店内環境」「立地」それぞれの観点ごとに、実際に記載がある内容をできる限り深く・多角的に分析し、重要なキーワードや傾向、ポジティブ／ネガティブ両面の意見も含めて抜き出してください。
各観点ごとに最大5文まで、日本語で詳細に、かつ端的に特徴や共通意見をまとめてください。
出力は必ず以下の形式で。

【味】
（5文以内で詳細に要点）
【接客】
（5文以内で詳細に要点）
【価格】
（5文以内で詳細に要点）
【店内環境】
（5文以内で詳細に要点）
【立地】
（5文以内で詳細に要点）

※各観点で口コミに言及が全くなければ「特になし」と記載
      `.trim();

      const userContent = chunk.join("\n\n");

      const chatResponse = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 2000, // チャンクごとは十分長く
      });

      const summary = chatResponse.choices?.[0]?.message?.content?.trim();
      if (summary) partialSummaries.push(summary);
    }

    // パーシャルサマリーを再要約
    const finalPrompt = `
あなたは日本のレストランレビュー要約AIです。
下記は観点ごとに分割した要約です。内容が重複している場合は集約し、実際の口コミ傾向・特徴がより深く伝わるよう「味」「接客」「価格」「店内環境」「立地」各観点ごとに、最大7文で詳細かつ多面的にまとめ直してください。
全体のトレンド、ユーザーが繰り返し言及している内容、特徴的な意見、ポジティブ・ネガティブ両方、具体的なエピソードなども積極的に拾ってください。
出力は必ず以下の形式で、日本語で詳細にまとめてください。

【味】
（最大7文、深い分析・要点）
【接客】
（最大7文、深い分析・要点）
【価格】
（最大7文、深い分析・要点）
【店内環境】
（最大7文、深い分析・要点）
【立地】
（最大7文、深い分析・要点）

※各観点で特に傾向が見られない場合は「特になし」と記載
    `.trim();

    const finalResponse = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: finalPrompt },
        { role: "user", content: partialSummaries.join("\n\n") },
      ],
      temperature: 0.25,
      max_tokens: 3500, // 総評は最大限長く
    });

    const summary = finalResponse.choices?.[0]?.message?.content?.trim();
    if (!summary) throw new Error("AIから総評が取得できませんでした");

    await supabaseAdmin.from("reviews_summary_cache").insert([
      {
        period_from: from || null,
        period_to: to || null,
        review_count: reviewCount,
        summary,
        updated_at: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("SUMMARY ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "内部サーバーエラー" },
      { status: 500 }
    );
  }
}
