"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { DateRange } from "react-day-picker";

export type FilterType = "all" | "day" | "month" | "range";

export interface FilterContextType {
  filterType: FilterType;
  selectedDate?: Date;
  selectedMonth?: Date;
  selectedRange?: DateRange;
  selectedCategory?: string;
  setFilterType: (filter: FilterType) => void;
  setSelectedDate: (date?: Date, updateURL?: boolean) => void;
  setSelectedMonth: (date?: Date, updateURL?: boolean) => void;
  setSelectedRange: (range?: DateRange, updateURL?: boolean) => void;
  setSelectedCategory: (category?: string, updateURL?: boolean) => void;
}


const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [filterType, setFilterTypeState] = useState<FilterType>("all");
  const [selectedDate, setSelectedDateState] = useState<Date>();
  const [selectedMonth, setSelectedMonthState] = useState<Date>();
  const [selectedRange, setSelectedRangeState] = useState<DateRange>();
  const [selectedCategory, setSelectedCategoryState] = useState<string>("all");

  const setFilterType = (filter: FilterType) => setFilterTypeState(filter);
  const setSelectedDate = (date?: Date, updateURL?: boolean) => setSelectedDateState(date);
  const setSelectedMonth = (date?: Date, updateURL?: boolean) => setSelectedMonthState(date);
  const setSelectedRange = (range?: DateRange, updateURL?: boolean) => setSelectedRangeState(range);
  const setSelectedCategory = (category?: string, updateURL?: boolean) => setSelectedCategoryState(category ?? "all");

  return (
    <FilterContext.Provider value={{
      filterType,
      selectedDate,
      selectedMonth,
      selectedRange,
      selectedCategory,
      setFilterType,
      setSelectedDate,
      setSelectedMonth,
      setSelectedRange,
      setSelectedCategory,
    }}>
      {children}
    </FilterContext.Provider>
  );
};


export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilter must be used within a FilterProvider");
  return context;
}
