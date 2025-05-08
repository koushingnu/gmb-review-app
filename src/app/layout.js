import "./globals.css";
import ClientApp from "./ClientApp";

export const metadata = {
  title: "GMB レビュー管理",
  description: "Google My Business のレビュー管理アプリ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* ClientApp.jsx は "use client" なので中はクライアントで動きます */}
        <ClientApp>{children}</ClientApp>
      </body>
    </html>
  );
}
