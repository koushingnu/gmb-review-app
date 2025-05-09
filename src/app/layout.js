// src/app/layout.js

export const metadata = {
  title: "GMB レビュー管理",
  description: "Google My Business のレビュー一覧",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {children}
      </body>
    </html>
  );
}
