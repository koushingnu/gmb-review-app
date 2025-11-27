// ユーザーのcompany_idを取得するヘルパー関数
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * サーバーサイドで現在ログイン中のユーザーのcompany_idを取得
 * @returns {Promise<string|null>} company_id または null
 */
export async function getCompanyIdFromUser() {
  try {
    const cookieStore = await cookies();
    
    // サーバーサイドのSupabaseクライアント
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

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

