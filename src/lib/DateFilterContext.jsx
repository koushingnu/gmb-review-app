// src/lib/DateFilterContext.jsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// フィルタ期間を保持・更新するコンテキストを作成
const DateFilterContext = createContext({
  from: null,
  to: null,
  compareFrom: null,
  compareTo: null,
  setFrom: () => {},
  setTo: () => {},
  setCompareFrom: () => {},
  setCompareTo: () => {},
});

export function DateFilterProvider({ children }) {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [compareFrom, setCompareFrom] = useState(null);
  const [compareTo, setCompareTo] = useState(null);

  // 必要に応じて URL や localStorage と同期させる場合はここで処理
  useEffect(() => {
    // 例: const params = new URLSearchParams(window.location.search);
    //     setFrom(...);
  }, []);

  return (
    <DateFilterContext.Provider
      value={{
        from,
        to,
        setFrom,
        setTo,
        compareFrom,
        compareTo,
        setCompareFrom,
        setCompareTo,
      }}
    >
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter() {
  return useContext(DateFilterContext);
}
