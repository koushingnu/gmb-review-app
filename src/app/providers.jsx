// src/app/providers.jsx
"use client";

import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { DateFilterProvider } from "@/lib/DateFilterContext";
import { AnimatePresence } from "framer-motion";
import theme from "@/lib/theme";
import LoadingScreen from "@/components/common/LoadingScreen";

// Emotion キャッシュの設定
const cache = createCache({
  key: "css",
  prepend: true,
});

export default function Providers({ children }) {
  useServerInsertedHTML(() => {
    const { extractCriticalToChunks } = require("@emotion/server").default;
    const chunks = extractCriticalToChunks("");
    return chunks.styles.map((style) => (
      <style
        key={style.key}
        data-emotion={`${style.key} ${style.ids.join(" ")}`}
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
          {children}
      </DateFilterProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
