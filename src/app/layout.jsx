import RootLayoutClient from "@/components/layout/client/layout.client";
import "./globals.css";

export const metadata = {
  title: "GMB Review App",
  description: "Google My Business レビュー管理アプリケーション",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
