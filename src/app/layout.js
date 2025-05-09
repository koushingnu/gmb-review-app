// src/app/layout.js
import "./globals.css";
import ClientApp from "./ClientApp";

export const metadata = {
  title: "GMB レビュー管理",
  description: "Google My Business のレビューをまとめて管理",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <ClientApp>{children}</ClientApp>
      </body>
    </html>
  );
}
