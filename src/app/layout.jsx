// src/app/layout.jsx
"use client";

import React, { ReactNode } from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import createEmotionServer from "@emotion/server/create-instance";
import { useServerInsertedHTML } from "next/navigation";

import Providers from "./providers";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("@/components/Header"), { ssr: false });
import Footer from "@/components/Footer";
import { DateFilterProvider } from "@/lib/DateFilterContext";

// Emotion キャッシュと SSR 設定
const cache = createCache({ key: "css", prepend: true });
const { extractCriticalToChunks } = createEmotionServer(cache);

export default function RootLayout({ children }) {
  useServerInsertedHTML(() => {
    const chunks = extractCriticalToChunks("");
    return chunks.styles.map((style) => (
      <style
        key={style.key}
        data-emotion={`${style.key} ${style.ids.join(" ")}`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: style.css }}
      />
    ));
  });

  return (
    <CacheProvider value={cache}>
      <html lang="ja">
        <body>
          <Providers>
            {/* ここだけに DateFilterProvider をラップ */}
            <DateFilterProvider>
              <Header />
              <main
                style={{
                  flex: 1,
                  width: "100%",
                  maxWidth: 1200,
                  margin: "0 auto",
                  padding: "1rem",
                }}
              >
                {children}
              </main>
              <Footer />
            </DateFilterProvider>
          </Providers>
        </body>
      </html>
    </CacheProvider>
  );
}
