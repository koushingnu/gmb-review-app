import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

/**
 * 日付文字列を「〜前」の形式にフォーマットする
 * @param dateString - ISO 8601形式の日付文字列
 * @returns フォーマットされた日付文字列（例：「3日前」）
 */
export const formatDate = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), {
    locale: ja,
    addSuffix: true,
  });
};
