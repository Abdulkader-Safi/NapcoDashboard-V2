"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { DateRange } from "react-day-picker";
import { router } from "@inertiajs/core";

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
  const searchParams = new URLSearchParams(window.location.search);

  const [filterType, setFilterTypeState] = useState<FilterType>(
    (searchParams.get("filter") as FilterType) || "all"
  );
  const [selectedDate, setSelectedDateState] = useState<Date | undefined>(
    searchParams.get("date") ? new Date(searchParams.get("date")!) : undefined
  );
  const [selectedMonth, setSelectedMonthState] = useState<Date | undefined>(
    searchParams.get("month") ? new Date(searchParams.get("month")!) : undefined
  );
  const [selectedRange, setSelectedRangeState] = useState<DateRange | undefined>(
    searchParams.get("from") && searchParams.get("to")
      ? { from: new Date(searchParams.get("from")!), to: new Date(searchParams.get("to")!) }
      : undefined
  );

  const updateUrl = (params: Record<string, string | undefined>) => {
    const url = new URL(window.location.href);
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined) url.searchParams.set(key, params[key]!);
      else url.searchParams.delete(key);
    });

    router.replace(url.toString(), undefined, { preserveState: true, preserveScroll: true });

  };

  // --- FilterType setter ---
  const setFilterType = (val: FilterType, pushToUrl = true) => {
    setFilterTypeState(val);
    if (pushToUrl) updateUrl({ filter: val });
  };

  // --- Date filter ---
  const setSelectedDate = (val?: Date, pushToUrl = true) => {
    setSelectedDateState(val);
    if (val) setFilterTypeState("day"); // auto-set filterType to 'day'
    if (pushToUrl) updateUrl({ date: val ? val.toISOString().split("T")[0] : undefined, filter: val ? "day" : undefined });
  };

  // --- Month filter ---
  const setSelectedMonth = (val?: Date, pushToUrl = true) => {
    setSelectedMonthState(val);
    if (val) setFilterTypeState("month"); // auto-set filterType to 'month'
    if (pushToUrl) updateUrl({ month: val ? val.toISOString().slice(0, 7) : undefined, filter: val ? "month" : undefined });
  };

  // --- Range filter ---
  const setSelectedRange = (val?: DateRange, pushToUrl = true) => {
    setSelectedRangeState(val);
    if (val?.from && val?.to) setFilterTypeState("range"); // auto-set filterType to 'range'
    if (pushToUrl)
      updateUrl({
        from: val?.from?.toISOString().split("T")[0],
        to: val?.to?.toISOString().split("T")[0],
        filter: val?.from && val?.to ? "range" : undefined,
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
