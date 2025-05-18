import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import OpenAI from "openai";

// 立地は除外
const LABELS = {
  taste_avg: "味",
  service_avg: "接客",
  price_avg: "価格",
  location_avg: "店内環境",
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 小数点1桁四捨五入
function round1(x) {
  if (x == null) return null;
  return Math.round(x * 10) / 10;
}

// 年月ラベル
function toLabel(dateStr) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  let label = "";
  if ([1, 2, 3].includes(m)) label = "1〜3月";
  else if ([4, 5, 6].includes(m)) label = "4〜6月";
  else if ([7, 8, 9].includes(m)) label = "7〜9月";
  else label = "10〜12月";
  return `${y}年${label}`;
}

// 1四半期分のスコア
async function fetchQuarterScores(from, to) {
  const { data, error } = await supabaseAdmin.rpc("get_quarterly_scores", {
    from_date: from,
    to_date: to,
  });
  if (error) throw new Error("四半期データ取得失敗: " + error.message);
  return data?.[0] || null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const from1 = searchParams.get("from1");
    const to1 = searchParams.get("to1");
    const from2 = searchParams.get("from2");
    const to2 = searchParams.get("to2");

    if (!from1 || !to1 || !from2 || !to2)
      throw new Error("比較する2つの期間を指定してください");

    // 1. 2期間のデータ取得
    const quarter1 = await fetchQuarterScores(from1, to1);
    const quarter2 = await fetchQuarterScores(from2, to2);
    if (!quarter1 || !quarter2)
      throw new Error("2つの四半期データが見つかりません");

    // 2. 四捨五入した表示値同士でdiff計算（ズレ対策）
    const diffs = {};
    const q1Scores = {};
    const q2Scores = {};
    for (const key of Object.keys(LABELS)) {
      const q1Rounded = round1(quarter1[key]);
      const q2Rounded = round1(quarter2[key]);
      q1Scores[key] = q1Rounded;
      q2Scores[key] = q2Rounded;
      diffs[key] =
        q1Rounded != null && q2Rounded != null
          ? round1(q2Rounded - q1Rounded)
          : null;
    }

    // 3. AIプロンプト生成（diff付き、出力指示を厳格に）
    const q1Label = toLabel(from1);
    const q2Label = toLabel(from2);
    let prompt = `あなたはレストランレビューの経営コンサルAIです。\n`;
    prompt += `比較する四半期A: ${q1Label}\n比較する四半期B: ${q2Label}\n`;
    prompt += `各項目のスコア変化は下記の通りです。\n`;

    Object.entries(LABELS).forEach(([k, label]) => {
      prompt += `【${label}】 ${q1Scores[k]} → ${q2Scores[k]} (diff: ${diffs[k]})\n`;
    });

    prompt += `
【指示】
- diffがマイナス（たとえ-0.1でも）の全項目はサマリーに必ず出力。「課題」「原因」「改善案」の3点セット。
- diffがプラス（+0.2以上）の場合は「改善内容」「施策や要因」のみ（課題や改善案は絶対に書かないでください）。
- diffが±0.1以内の微小変化は省略して良い。
- 必ず各項目diff順に（マイナス→プラス）で。
- 立地は出力不要。
- 出力例
【味】課題：味が-0.3ポイント低下（4.8→4.5）。原因：～～。改善案：～～。
【接客】改善：接客が+0.3ポイント向上（4.1→4.4）。要因：～～。
`;

    const aiResult = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 2000,
      temperature: 0.4,
    });
    const ai_summary = aiResult.choices?.[0]?.message?.content?.trim() || "";

    // 4. レスポンス
    return NextResponse.json({
      quarter1: { label: q1Label, ...q1Scores },
      quarter2: { label: q2Label, ...q2Scores },
      diffs,
      ai_summary,
    });
  } catch (err) {
    console.error("QUARTERLY_COMPARE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "内部サーバーエラー" },
      { status: 500 }
    );
  }
}
