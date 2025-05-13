// app/admin/oauth/success/page.jsx
"use client";
import React, { useEffect, useState } from "react";

export default function OAuthSuccess() {
  const [tokens, setTokens] = useState({ access_token: "", refresh_token: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTokens({
      access_token: params.get("access_token") || "",
      refresh_token: params.get("refresh_token") || "",
    });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>認可成功！トークンを環境変数へ反映してください</h1>
      <div style={{ margin: "16px 0" }}>
        <label>ACCESS_TOKEN:</label>
        <br />
        <textarea
          readOnly
          rows={3}
          style={{ width: "100%" }}
          value={tokens.access_token}
        />
      </div>
      <div style={{ margin: "16px 0" }}>
        <label>REFRESH_TOKEN:</label>
        <br />
        <textarea
          readOnly
          rows={3}
          style={{ width: "100%" }}
          value={tokens.refresh_token}
        />
      </div>
      <p>
        上記の値を `.env` の
        <code>
          ACCESS_TOKEN=&lt;ここにコピー&gt;
          <br />
          REFRESH_TOKEN=&lt;ここにコピー&gt;
        </code>
        <br />
        に貼り付けて再デプロイしてください。
      </p>
    </div>
  );
}
