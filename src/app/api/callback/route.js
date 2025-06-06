// src/app/api/callback/route.js
import { google } from "googleapis";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    console.log("Callback URL:", req.url);
    console.log("Auth Code:", code ? "受信" : "未受信");
    console.log("Error:", error || "なし");
    console.log("Redirect URI:", process.env.GOOGLE_REDIRECT_URI);

    if (error) {
      console.error("Google OAuth Error:", error);
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
      });
    }

    if (!code) {
      return new Response("No code provided", {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
      });
    }

    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2.getToken(code);
    console.log("Tokens received:", {
      has_access_token: !!tokens.access_token,
      has_refresh_token: !!tokens.refresh_token,
    });

    // tokens.refresh_token が入っているはず
    const params = new URLSearchParams({
      access_token: tokens.access_token || "",
      refresh_token: tokens.refresh_token || "",
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/admin/oauth/success?${params.toString()}`,
        "Access-Control-Allow-Origin": "http://localhost:3000",
      },
    });
  } catch (error) {
    console.error("Callback error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
      },
    });
  }
}
