// レビュー関連の型定義
export interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
  reply?: string;
  replyDate?: string;
}

// フィルター関連の型定義
export interface DateFilter {
  year: number;
  quarter: number;
}

// ソート関連の型定義
export type SortOption =
  | "date-desc"
  | "date-asc"
  | "rating-desc"
  | "rating-asc"
  | "reply-status"
  | "comment-length";

// チャート関連の型定義
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

// APIレスポンスの型定義
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ユーザー関連の型定義
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}
