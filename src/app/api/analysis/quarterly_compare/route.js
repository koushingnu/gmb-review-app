import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import OpenAI from "openai";

// 各四半期のデータを取得するヘルパー
async function fetchQuarterScores(from, to) {
  const { data, error } = await supabaseAdmin.rpc("get_quarterly_scores", {
    from_date: from,
    to_date: to,
  });
  if (error) throw new Error("四半期データ取得失敗: " + error.message);
  // get_quarterly_scoresは配列で返る想定（1件分のみ）
  return data?.[0] || null;
}

const LABELS = {
  taste_avg: "味",
  service_avg: "接客",
  price_avg: "価格",
  location_avg: "店内環境",
  hygiene_avg: "立地",
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    // 2. diff計算（数値増減）
    const diffs = {};
    for (const key of Object.keys(LABELS)) {
      diffs[key] =
        quarter2[key] !== null && quarter1[key] !== null
          ? Number((quarter2[key] - quarter1[key]).toFixed(1))
          : null;
    }

    // 年月表記：2025年1〜3月形式
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

    const q1Label = toLabel(from1);
    const q2Label = toLabel(from2);

    // 小数点1桁で揃えた表示データ
    const q1Scores = {};
    const q2Scores = {};
    Object.keys(LABELS).forEach((k) => {
      q1Scores[k] = quarter1[k] != null ? Number(quarter1[k]).toFixed(1) : null;
      q2Scores[k] = quarter2[k] != null ? Number(quarter2[k]).toFixed(1) : null;
    });

    // プロンプトをより詳細・実用的に
    let prompt = `あなたはレストランレビューのプロの経営コンサルタントAIです。\n`;
    prompt += `下記は2つの四半期（${q1Label}と${q2Label}）の5項目（味・接客・価格・店内環境・立地）の平均スコア比較データです。\n`;
    prompt += `\n`;
    prompt += `${q1Label}:\n`;
    Object.entries(LABELS).forEach(([k, label]) => {
      prompt += `${label}: ${q1Scores[k] ?? "-"}\n`;
    });
    prompt += `\n${q2Label}:\n`;
    Object.entries(LABELS).forEach(([k, label]) => {
      prompt += `${label}: ${q2Scores[k] ?? "-"}\n`;
    });
    prompt += `\n`;
    prompt += `【指示】\n`;
    prompt += `- スコアが低下した項目については、「課題」として数値変化も明示し、何が原因と考えられるか根拠をデータや一般的傾向をもとに推測し、さらに店舗が実際に取れる具体的な改善案を複数提示してください。\n`;
    prompt += `- スコアが大きく改善した項目があれば、改善内容・理由・店舗が行ったと推察される施策も含めて詳細に記述してください。\n`;
    prompt += `- 良好な点や変化が小さい項目は省略してください。\n`;
    prompt += `- 出力例：\n【味】課題：味が0.3ポイント低下（4.2→3.9）。おそらく新メニューや味付けの変更、調理工程のミスなどが影響した可能性があります。改善案：調理手順の見直し、顧客アンケートを実施し味の感想を直接集める、人気メニューの再評価・復活、などを検討してください。\n【店内環境】改善：店内環境が0.4ポイント改善（3.7→4.1）。清掃や照明、レイアウトの見直し、快適なBGM導入などがプラスに作用した可能性があります。\n`;

    // AI生成
    const aiResult = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 2000, // 上限大きめ
      temperature: 0.5,
    });
    const ai_summary = aiResult.choices?.[0]?.message?.content?.trim() || "";

    // レスポンス
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
