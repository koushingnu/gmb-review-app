// src/app/api/callback/route.js
import { google } from "googleapis";

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    return new Response(
      `
    <h1>✅ 認証成功</h1>
    <p>以下のトークンをコピーして開発者に渡してください。</p>
    <pre>${JSON.stringify(tokens, null, 2)}</pre>
  `,
      {
        headers: {
          "Content-Type": "text/html; charset=utf-8", // ← ここが重要
        },
      }
    );
  } catch (error) {
    console.error("Token Error:", error);
    return new Response("❌ トークン取得失敗", { status: 500 });
  }
}
