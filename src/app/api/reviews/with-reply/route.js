// src/app/api/reviews/with-reply/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const { review_id, comment } = await req.json();
    if (!review_id || !comment) {
      return NextResponse.json(
        { error: "review_idとcommentが必須です" },
        { status: 400 }
      );
    }
    // 返信をinsert
    const { error } = await supabase.from("review_replies").insert([
      {
        review_id,
        comment,
        update_time: new Date().toISOString(),
      },
    ]);
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
