import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("google_tokens")
      .select("*")
      .limit(1)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: "Token not found" }), {
        status: 401,
      });
    }

    const now = new Date();
    if (new Date(data.expires_at) > now) {
      return new Response(JSON.stringify({ access_token: data.access_token }), {
        status: 200,
      });
    }

    // 有効期限切れなので更新
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: data.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return new Response(JSON.stringify(tokenData), { status: 401 });
    }

    const expiresAt = new Date(
      Date.now() + tokenData.expires_in * 1000
    ).toISOString();

    await supabase
      .from("google_tokens")
      .update({
        access_token: tokenData.access_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    return new Response(
      JSON.stringify({ access_token: tokenData.access_token }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
