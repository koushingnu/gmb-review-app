// ユーザーのcompany_idを取得するヘルパー関数
import { supabase } from "./supabase";

/**
 * 現在ログイン中のユーザーのcompany_idを取得
 * @returns {Promise<string|null>} company_id または null
 */
export async function getCompanyIdFromUser() {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[getCompanyId] 認証エラー:", authError);
      return null;
    }

    const { data, error } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      console.error("[getCompanyId] ユーザープロフィール取得エラー:", error);
      return null;
    }

    return data.company_id;
  } catch (error) {
    console.error("[getCompanyId] エラー:", error);
    return null;
  }
}

