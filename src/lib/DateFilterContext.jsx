import React, { createContext, useContext, useState } from "react";

const DateFilterContext = createContext();

export function DateFilterProvider({ children }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(1);

  return (
    <DateFilterContext.Provider value={{ year, setYear, quarter, setQuarter }}>
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter() {
  return useContext(DateFilterContext);
}
