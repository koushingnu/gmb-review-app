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

    // 1. 対象レビュー数取得
    let reviewQuery = supabaseAdmin
      .from("reviews")
      .select("review_id") // 必要ならreview_id等に修正
      .not("comment", "is", null);
    if (from) reviewQuery = reviewQuery.gte("create_time", from);
    if (to) reviewQuery = reviewQuery.lte("create_time", to);
    const { data: reviewIds, error: reviewError } = await reviewQuery;
    if (reviewError)
      throw new Error("レビュー数取得失敗: " + JSON.stringify(reviewError));
    const reviewCount = reviewIds.length;
    if (reviewCount === 0) {
      // レビュー0件ならAI・キャッシュをスキップ
      return NextResponse.json({ summary: "レビューがありません。" });
    }

    // 2. キャッシュを検索
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
      // キャッシュヒット
      return NextResponse.json({ summary: cachedRows[0].summary });
    }

    // 3. コメント本文を取得（キャッシュミス時のみ）
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
      // 念のためAI投げ前にも0件ガード
      return NextResponse.json({ summary: "レビューがありません。" });
    }

    // 4. チャンクごとにAIに要約投げ
    const chunks = [];
    for (let i = 0; i < comments.length; i += CHUNK_SIZE) {
      chunks.push(comments.slice(i, i + CHUNK_SIZE));
    }

    const partialSummaries = [];
    for (const chunk of chunks) {
      const prompt = `
あなたはレストランレビューのエキスパートです。
以下のコメント群を「味」「接客」「価格」「店内環境」「立地」5観点ごとに要点を抽出し、1観点につき2文程度の短い日本語要約にしてください。
出力例：
【味】
...
【接客】
...
【価格】
...
【店内環境】
...
【立地】
...
      `.trim();

      const userContent = chunk.join("\n\n");

      const chatResponse = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.6,
        max_tokens: 700,
      });

      const summary = chatResponse.choices?.[0]?.message?.content?.trim();
      if (summary) partialSummaries.push(summary);
    }

    // 5. パーシャルサマリーを再要約
    const finalPrompt = `
下記は、あるレストランのレビュー要約です。各観点ごとの内容を総合し、重複をまとめつつ「味」「接客」「価格」「店内環境」「立地」5観点で
本当に重要な要点だけを日本語で整理し、1観点につき3文程度で最終総評としてください。
出力形式は【観点名】をつけて下さい。
`.trim();

    const finalResponse = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: finalPrompt },
        { role: "user", content: partialSummaries.join("\n\n") },
      ],
      temperature: 0.4,
      max_tokens: 900,
    });

    const summary = finalResponse.choices?.[0]?.message?.content?.trim();
    if (!summary) throw new Error("AIから総評が取得できませんでした");

    // 6. キャッシュへ保存
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
