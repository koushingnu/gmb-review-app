"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 初回ロード時のセッション確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
        // ログインページ以外なら、ログインページへリダイレクト
        if (pathname !== "/login") {
          router.push("/login");
        }
      }
    });

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AUTH] イベント:", event);
      
      if (session) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        // ログアウト時はログインページへ
        if (pathname !== "/login") {
          router.push("/login");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const fetchUserProfile = async (userId) => {
    try {
      console.log("[AUTH] ユーザープロフィール取得:", userId);
      
      const { data, error } = await supabase
        .from("users")
        .select("company_id, role, display_name, email")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("[AUTH] プロフィール取得エラー:", error);
        throw error;
      }

      console.log("[AUTH] プロフィール取得成功:", data);
      setUserProfile(data);
    } catch (error) {
      console.error("[AUTH] ユーザープロフィール取得エラー:", error);
      // プロフィールが存在しない場合は、ログアウトさせる
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      router.push("/login");
    } catch (error) {
      console.error("[AUTH] ログアウトエラー:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        companyId: userProfile?.company_id,
        role: userProfile?.role,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

