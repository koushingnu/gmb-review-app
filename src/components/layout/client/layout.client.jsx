"use client";

import React from "react";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import createCache from "@emotion/cache";
import createEmotionServer from "@emotion/server/create-instance";
import { useServerInsertedHTML } from "next/navigation";
import { DateFilterProvider } from "@/lib/DateFilterContext";
import { AnimatePresence } from "framer-motion";
import theme from "@/lib/theme";
import ClientLayout from "./ClientLayout";
import LoadingScreen from "@/components/common/LoadingScreen";

// Emotion キャッシュと SSR 設定
const cache = createCache({ key: "css", prepend: true });
const { extractCriticalToChunks } = createEmotionServer(cache);

export default function RootLayoutClient({ children }) {
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
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DateFilterProvider>
          <LoadingScreen />
          <AnimatePresence mode="wait">
            <ClientLayout>{children}</ClientLayout>
          </AnimatePresence>
        </DateFilterProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
