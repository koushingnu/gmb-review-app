"use client";
import React, { createContext, useContext, useState } from "react";

const DateFilterContext = createContext(null);

export function DateFilterProvider({ children }) {
  // 現在の年と四半期を初期値に
  const now = new Date();
  const initialYear = now.getFullYear();
  const initialQuarter = Math.floor(now.getMonth() / 3) + 1;

  const [year, setYear] = useState(initialYear);
  const [quarter, setQuarter] = useState(initialQuarter);

  return (
    <DateFilterContext.Provider value={{ year, quarter, setYear, setQuarter }}>
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter() {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error("useDateFilter must be used within a DateFilterProvider");
  }
  return context;
}
