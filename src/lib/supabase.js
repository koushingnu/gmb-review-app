// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

/**
 * 30分でセッションが切れる localStorage ラッパー
 * サーバーサイドでは noop になるようガードしています。
 */
class ExpiringLocalStorage {
  constructor(prefix = "supabase.auth.token", ttl = 30 * 60 * 1000) {
    this.prefix = prefix;
    this.ttl = ttl;
  }

  _isBrowser() {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    );
  }

  getItem(key) {
    if (!this._isBrowser()) return null;
    const raw = window.localStorage.getItem(`${this.prefix}.${key}`);
    if (!raw) return null;
    try {
      const { data, expiresAt } = JSON.parse(raw);
      if (Date.now() > expiresAt) {
        window.localStorage.removeItem(`${this.prefix}.${key}`);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  setItem(key, value) {
    if (!this._isBrowser()) return;
    const record = { data: value, expiresAt: Date.now() + this.ttl };
    window.localStorage.setItem(
      `${this.prefix}.${key}`,
      JSON.stringify(record)
    );
  }

  removeItem(key) {
    if (!this._isBrowser()) return;
    window.localStorage.removeItem(`${this.prefix}.${key}`);
  }
}

const storage = new ExpiringLocalStorage();

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      storage,
    },
  }
);
