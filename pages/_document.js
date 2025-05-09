// pages/_document.js
import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
// Emotion サーバーサイド用 API
import createEmotionServer from "@emotion/server/create-instance";
// 前に作った Emotion キャッシュ生成関数
import createEmotionCache from "../src/lib/createEmotionCache";

export default class MyDocument extends Document {
  // getInitialProps はサーバー側で一度だけ実行され、
  // ページのレンダリング結果をもとに Props を組み立てます。
  static async getInitialProps(ctx) {
    // 1) Emotion のキャッシュをサーバー側でも生成
    const cache = createEmotionCache();
    // Emotion のサーバーサイド用ユーティリティ生成
    const { extractCriticalToChunks } = createEmotionServer(cache);

    // 2) 元の renderPage をラップして、Emotion キャッシュを App に渡す
    const originalRenderPage = ctx.renderPage;
    ctx.renderPage = () =>
      originalRenderPage({
        // enhanceApp を使うと、App コンポーネントのラップができます
        enhanceApp: (App) => (props) => (
          // emotionCache を App に渡すことで、
          // MUI の styled-components 系がこのキャッシュを使うようになる
          <App emotionCache={cache} {...props} />
        ),
      });

    // 3) Next.js のデフォルト処理で HTML や初期Props を取得
    const initialProps = await Document.getInitialProps(ctx);
    // 4) render された HTML 文字列から Emotion のスタイルを抽出
    const emotionChunks = extractCriticalToChunks(initialProps.html);

    // 5) 抽出したスタイルを <style> タグに変換
    const emotionStyleTags = emotionChunks.styles.map((style) => (
      <style
        key={style.key}
        data-emotion={`${style.key} ${style.ids.join(" ")}`}
        // React が生の CSS を挿入できるように危険度を理解した上でセット
        dangerouslySetInnerHTML={{ __html: style.css }}
      />
    ));

    // 6) 最終的に props.styles にマージして返す
    return {
      ...initialProps,
      styles: [
        ...React.Children.toArray(initialProps.styles),
        ...emotionStyleTags,
      ],
    };
  }

  render() {
    return (
      <Html lang="ja">
        <Head>
          {/* getInitialProps で追加した emotionStyleTags がここに出力される */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
