// src/app/api/replies/generate/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const REPLY_PROMPT = `
あなたは日本の飲食店のオーナーです。お客様からのレビューに対して、温かく丁寧で誠実な返信を作成してください。

【返信作成のガイドライン】
1. お客様の来店に対する感謝の気持ちを伝える
2. レビュー内容（良い点・改善点）に具体的に言及する
3. 改善が必要な点については真摯に受け止め、今後の改善を約束する
4. 再来店を促す温かいメッセージで締めくくる
5. 200文字以内で簡潔に
6. 敬語（です・ます調）を使用
7. 絵文字は使わない

【レビュー情報】
評価: {rating}つ星
レビュアー名: {reviewer_name}
レビュー本文:
{comment}

【返信文（日本語のみ、説明不要）】
`;

export async function POST(req) {
  try {
    const { review_id } = await req.json();

    if (!review_id) {
      return NextResponse.json(
        { error: "review_idが必要です" },
        { status: 400 }
      );
    }

    console.log(`[AI_REPLY] 返信生成開始: ${review_id}`);

    // レビュー情報を取得
    const { data: review, error: fetchError } = await supabaseAdmin
      .from("reviews")
      .select("review_id, star_rating, comment, reviewer_display_name")
      .eq("review_id", review_id)
      .single();

    if (fetchError || !review) {
      console.error("[AI_REPLY] レビュー取得エラー:", fetchError);
      return NextResponse.json(
        { error: "レビューが見つかりません" },
        { status: 404 }
      );
    }

    // コメントがない場合
    if (!review.comment || review.comment.trim() === "") {
      return NextResponse.json(
        {
          reply: `${review.reviewer_display_name}様\n\nこの度はご来店いただき、誠にありがとうございました。またのお越しを心よりお待ちしております。`,
        },
        { status: 200 }
      );
    }

    // AIで返信を生成
    const prompt = REPLY_PROMPT.replace("{rating}", review.star_rating)
      .replace("{reviewer_name}", review.reviewer_display_name || "お客様")
      .replace("{comment}", review.comment);

    console.log("[AI_REPLY] OpenAI API呼び出し中...");

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "あなたは日本の飲食店のオーナーです。お客様のレビューに対して、温かく丁寧で誠実な返信を作成します。",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const generatedReply = aiRes.choices[0].message.content.trim();

    console.log(`[AI_REPLY] 生成成功: ${review_id}`);

    // review_repliesテーブルに保存（未送信として）
    const { error: insertError } = await supabaseAdmin
      .from("review_replies")
      .upsert({
        review_id,
        comment: generatedReply,
        update_time: new Date().toISOString(),
        sent_at: null, // 未送信
      });

    if (insertError) {
      console.error("[AI_REPLY] DB保存エラー:", insertError);
      // エラーでも生成した返信は返す
    }

    return NextResponse.json(
      {
        reply: generatedReply,
        review_id,
        saved: !insertError,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AI_REPLY] エラー:", error);
    return NextResponse.json(
      {
        error: "AI返信の生成に失敗しました",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

