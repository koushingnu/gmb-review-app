import { google } from "googleapis";

export class GoogleAuthManager {
  constructor() {
    // サービスアカウントの認証情報を使用
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        project_id: process.env.GOOGLE_PROJECT_ID,
      },
      scopes: ["https://www.googleapis.com/auth/business.manage"],
    });
  }

  async getTokens() {
    try {
      // サービスアカウントの認証情報からアクセストークンを取得
      const client = await this.auth.getClient();
      const accessToken = await client.getAccessToken();

      return {
        access_token: accessToken.token,
        // サービスアカウントの場合、refresh_tokenは不要
        refresh_token: null,
      };
    } catch (error) {
      console.error("[GoogleAuth ERROR]", error);
      throw new Error("アクセストークンの取得に失敗しました: " + error.message);
    }
  }

  getOAuth2Client() {
    return this.auth;
  }
}

// シングルトンインスタンスをエクスポート
export const googleAuth = new GoogleAuthManager();
