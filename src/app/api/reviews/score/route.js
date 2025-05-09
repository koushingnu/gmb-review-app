// src/app/api/reviews/score/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  try {
    // 1. 未スコアのレビュー（review_id と comment）を取得
    const { data: reviews, error: fetchError } = await supabaseAdmin
      .from("reviews")
      .select("review_id, comment")
      .is("taste_score", null);
    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      throw new Error("未スコアレビューの取得に失敗しました");
    }
    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ updated: 0 });
    }

    let updatedCount = 0;

    // 2. 各レビューをループし、AI に 0–5 点の JSON スコアをリクエスト
    for (const { review_id, comment } of reviews) {
      const prompt = `
以下はレストランのユーザーレビューです。日本語の文章を読み、次の５つの観点で0〜5の整数点をJSON形式で返してください。
{"taste":整数,"service":整数,"price":整数,"location":整数,"hygiene":整数}
---
レビュー本文:
${comment}
`;
      const chatRes = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt.trim() }],
        temperature: 0,
        max_tokens: 60,
      });

      const text = chatRes.choices?.[0]?.message?.content?.trim();
      let scores;
      try {
        scores = JSON.parse(text);
      } catch (parseErr) {
        console.warn(`レビュー ${review_id} のスコア解析失敗:`, text);
        continue;
      }

      // 3. Supabase にスコアを更新
      const updates = {
        taste_score: scores.taste,
        service_score: scores.service,
        price_score: scores.price,
        location_score: scores.location,
        hygiene_score: scores.hygiene,
      };
      const { error: updateError } = await supabaseAdmin
        .from("reviews")
        .update(updates)
        .eq("review_id", review_id);
      if (updateError) {
        console.error(`レビュー ${review_id} の更新失敗:`, updateError);
        continue;
      }
      updatedCount++;
    }

    // 4. 更新件数を返却
    return NextResponse.json({ updated: updatedCount });
  } catch (err) {
    console.error("SCORE ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "スコア付与に失敗しました" },
      { status: 500 }
    );
  }
}
