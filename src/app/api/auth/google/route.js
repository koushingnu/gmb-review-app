import { google } from "googleapis";

export async function GET() {
  try {
    // OAuth2クライアントの初期化
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // 必要なスコープを設定
    const scopes = ["https://www.googleapis.com/auth/business.manage"];

    // 認証URLの生成
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent", // 毎回同意画面を表示し、refresh_tokenを確実に取得
    });

    // 認証URLにリダイレクト
    return new Response(null, {
      status: 302,
      headers: {
        Location: authUrl,
      },
    });
  } catch (error) {
    console.error("認証URL生成エラー:", error);
    return new Response(
      JSON.stringify({
        error: "認証URLの生成に失敗しました",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
