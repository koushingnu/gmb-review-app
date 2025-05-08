// src/app/api/auth/route.js
import { google } from "googleapis";

export async function GET(req) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/business.manage"],
    prompt: "consent", // 毎回アカウント選択を表示
    include_granted_scopes: false, // ← これを追加
  });

  return Response.redirect(authUrl);
}
