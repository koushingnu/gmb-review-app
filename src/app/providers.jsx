// src/app/providers.jsx
"use client";

import { CacheProvider } from "@emotion/react";
import createEmotionCache from "@/lib/createEmotionCache";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/lib/theme";

const clientSideEmotionCache = createEmotionCache();

export default function Providers({ children }) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
