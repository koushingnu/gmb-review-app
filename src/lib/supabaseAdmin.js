// src/lib/supabaseAdmin.js
import { createClient } from "@supabase/supabase-js";

// サーバー実行時のみ呼び出す（Service Role Key が漏れないように注意）
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
