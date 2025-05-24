// src/app/api/callback/route.js
import { google } from "googleapis";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  const { tokens } = await oauth2.getToken(code);

  // tokens.refresh_token が入っているはず
  const params = new URLSearchParams({
    access_token: tokens.access_token || "",
    refresh_token: tokens.refresh_token || "",
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `/admin/oauth/success?${params.toString()}`,
    },
  });
}
