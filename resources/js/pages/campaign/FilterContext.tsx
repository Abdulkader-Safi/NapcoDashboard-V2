"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { DateRange } from "react-day-picker";

export type FilterType = "all" | "day" | "month" | "range";

interface FilterContextType {
  filterType: FilterType;
  setFilterType: (val: FilterType, pushToUrl?: boolean) => void;
  selectedDate?: Date;
  setSelectedDate: (val?: Date, pushToUrl?: boolean) => void;
  selectedMonth?: Date;
  setSelectedMonth: (val?: Date, pushToUrl?: boolean) => void;
  selectedRange?: DateRange;
  setSelectedRange: (val?: DateRange, pushToUrl?: boolean) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filterType, setFilterTypeState] = useState<FilterType>("all");
  const [selectedDate, setSelectedDateState] = useState<Date>();
  const [selectedMonth, setSelectedMonthState] = useState<Date>();
  const [selectedRange, setSelectedRangeState] = useState<DateRange>();

  // On mount, read URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const f = searchParams.get("filter") as FilterType;
    setFilterTypeState(f || "all");

    const dateParam = searchParams.get("date");
    if (dateParam) setSelectedDateState(new Date(dateParam));

    const monthParam = searchParams.get("month");
    if (monthParam) {
      const [y, m] = monthParam.split("-");
      setSelectedMonthState(new Date(Number(y), Number(m) - 1, 1)); // month is 0-based
    }

    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    if (fromParam && toParam)
      setSelectedRangeState({ from: new Date(fromParam), to: new Date(toParam) });
  }, []);

  // Format date as YYYY-MM-DD
  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0"); // month correct
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Format month as YYYY-MM
  const formatMonth = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0"); // month correct
    return `${y}-${m}`;
  };

  const updateUrl = (params: Record<string, string | undefined>) => {
    const url = new URL(window.location.href);

    if (params.filter === "day") {
      url.searchParams.delete("month");
      url.searchParams.delete("from");
      url.searchParams.delete("to");
    } else if (params.filter === "month") {
      url.searchParams.delete("date");
      url.searchParams.delete("from");
      url.searchParams.delete("to");
    } else if (params.filter === "range") {
      url.searchParams.delete("date");
      url.searchParams.delete("month");
    } else if (params.filter === "all") {
      url.searchParams.delete("date");
      url.searchParams.delete("month");
      url.searchParams.delete("from");
      url.searchParams.delete("to");
    }

    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined) url.searchParams.set(key, params[key]!);
      else url.searchParams.delete(key);
    });

    window.history.replaceState(null, "", url.toString());
  };

  const setFilterType = (val: FilterType, pushToUrl = true) => {
    setFilterTypeState(val);
    if (pushToUrl) updateUrl({ filter: val });
  };

  const setSelectedDate = (val?: Date, pushToUrl = true) => {
    setSelectedDateState(val);
    if (val) setFilterTypeState("day");
    if (pushToUrl)
      updateUrl({
        date: val ? formatDate(val) : undefined,
        filter: val ? "day" : "all",
      });
  };

  const setSelectedMonth = (val?: Date, pushToUrl = true) => {
    setSelectedMonthState(val);
    if (val) setFilterTypeState("month");
    if (pushToUrl)
      updateUrl({
        month: val ? formatMonth(val) : undefined,
        filter: val ? "month" : "all",
      });
  };

  const setSelectedRange = (val?: DateRange, pushToUrl = true) => {
    setSelectedRangeState(val);
    if (val?.from && val?.to) setFilterTypeState("range");
    if (pushToUrl)
      updateUrl({
        from: val?.from ? formatDate(val.from) : undefined,
        to: val?.to ? formatDate(val.to) : undefined,
        filter: val?.from && val?.to ? "range" : "all",
      });
  };

  return (
    <FilterContext.Provider
      value={{
        filterType,
        setFilterType,
        selectedDate,
        setSelectedDate,
        selectedMonth,
        setSelectedMonth,
        selectedRange,
        setSelectedRange,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilter must be used within a FilterProvider");
  return context;
}
