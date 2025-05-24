#!/usr/bin/env node
// scripts/restructureProject.js
// 📂 推奨構成への一括リファクタリング（ESM版）
// 実行前に必ずバックアップを！

import fs from "fs-extra";
import path from "path";
import { globby } from "globby"; // ← ここをデフォルトではなく名前付きインポートに

// 指定ディレクトリ配下の空フォルダを再帰的に削除
async function removeEmptyDirs(dir) {
  if (!(await fs.pathExists(dir))) return;
  const entries = await fs.readdir(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      await removeEmptyDirs(fullPath);
      const sub = await fs.readdir(fullPath);
      if (sub.length === 0) {
        await fs.rmdir(fullPath);
        console.log(`🗑️  空ディレクトリ削除: ${fullPath}`);
      }
    }
  }
}

async function main() {
  const root = process.cwd();
  console.log("🚀 リファクタリング開始");

  // 1. src/app/components → src/components
  const compFiles = await globby("src/app/components/**/*.{js,jsx,ts,tsx}", {
    cwd: root,
  });
  for (const rel of compFiles) {
    const sub = rel.replace(/^src\/app\/components\//, "");
    const srcPath = path.join(root, rel);
    const destPath = path.join(root, "src/components", sub);
    await fs.ensureDir(path.dirname(destPath));
    await fs.move(srcPath, destPath, { overwrite: true });
    console.log(`🔀 ${rel} → src/components/${sub}`);
  }

  // 2. ReviewsDashboard.jsx → src/app/reviews/page.jsx
  const oldDash = path.join(root, "src/app/ReviewsDashboard.jsx");
  const reviewsDir = path.join(root, "src/app/reviews");
  if (await fs.pathExists(oldDash)) {
    await fs.ensureDir(reviewsDir);
    await fs.move(oldDash, path.join(reviewsDir, "page.jsx"), {
      overwrite: true,
    });
    console.log("🔀 ReviewsDashboard.jsx → src/app/reviews/page.jsx");
  }

  // 3. 不要フォルダ／ファイルを削除
  const obsolete = [
    "src/app/components",
    // 他に削除したいパスがあればここに追記
  ];
  for (const rel of obsolete) {
    const full = path.join(root, rel);
    if (await fs.pathExists(full)) {
      await fs.remove(full);
      console.log(`🗑️  削除: ${rel}`);
    }
  }

  // 4. 空フォルダクリーンアップ
  await removeEmptyDirs(path.join(root, "src/app"));

  // 5. インポートパス書き換え
  const codeFiles = await globby("src/**/*.{js,jsx,ts,tsx}", { cwd: root });
  for (const rel of codeFiles) {
    const file = path.join(root, rel);
    let content = await fs.readFile(file, "utf8");
    const updated = content
      // app/components → @/components
      .replace(
        /from ['"]\.\.\/components\/(.*?)['"]/g,
        `from "@/components/$1"`
      )
      // 古い ReviewsDashboard インポートをコメント化
      .replace(
        /import .*ReviewsDashboard.*;?/g,
        `// 削除: 古い ReviewsDashboard インポート`
      );
    if (updated !== content) {
      await fs.writeFile(file, updated, "utf8");
      console.log(`✏️ 更新: ${rel}`);
    }
  }

  console.log("✅ リファクタリング完了");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
