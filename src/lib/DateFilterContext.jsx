"use client";

import React, { createContext, useContext, useState } from "react";

// コンテキスト定義
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
