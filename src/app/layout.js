// src/app/layout.js
import "./globals.css";
import ClientApp from "./ClientApp"; // ← これを追加

export const metadata = {
  title: "GMB レビュー管理",
  description: "Google My Business のレビュー管理アプリ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head />
      <body>
        {/* ClientApp がヘッダー・フッターを包む */}
        <ClientApp>{children}</ClientApp>
      </body>
    </html>
  );
}
