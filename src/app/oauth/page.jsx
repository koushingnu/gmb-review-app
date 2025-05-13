"use client";
import React from "react";

const { NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_GOOGLE_REDIRECT_URI } =
  process.env;

export default function OAuthPage() {
  const authorizeUrl = [
    "https://accounts.google.com/o/oauth2/v2/auth",
    `?client_id=${encodeURIComponent(NEXT_PUBLIC_GOOGLE_CLIENT_ID)}`,
    "&response_type=code",
    `&redirect_uri=${encodeURIComponent(NEXT_PUBLIC_GOOGLE_REDIRECT_URI)}`,
    "&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fbusiness.manage",
    "&access_type=offline", // refresh_token を得る
    "&prompt=consent", // 必ず consent を表示
  ].join("");

  return (
    <div style={{ padding: 24 }}>
      <h1>Google My Business 認可設定</h1>
      <p>以下のボタンを押して Google の認可画面に進んでください。</p>
      <a href={authorizeUrl}>
        <button style={{ padding: "8px 16px", fontSize: 16 }}>
          認可を開始する
        </button>
      </a>
    </div>
  );
}
