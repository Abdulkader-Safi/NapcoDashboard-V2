"use client";

import { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useFilter, FilterType } from "@/pages/campaign/FilterContext";
import { type BreadcrumbItem as BreadcrumbItemType } from "@/types";

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
  const {
    filterType,
    setFilterType,
    selectedDate,
    setSelectedDate,
    selectedMonth,
    setSelectedMonth,
    selectedRange,
    setSelectedRange,
  } = useFilter();

  const [dayOpen, setDayOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);

  const [displayDate, setDisplayDate] = useState("Select Date");
  const [displayMonth, setDisplayMonth] = useState("Select Month");
  const [displayRange, setDisplayRange] = useState("Select Range");

  // Update display whenever context changes
  useEffect(() => {
    setDisplayDate(selectedDate ? selectedDate.toDateString() : "Select Date");
    setDisplayMonth(
      selectedMonth ? selectedMonth.toLocaleString("default", { month: "long", year: "numeric" }) : "Select Month"
    );
    setDisplayRange(
      selectedRange?.from && selectedRange?.to
        ? `${selectedRange.from.toLocaleDateString()} - ${selectedRange.to.toLocaleDateString()}`
        : "Select Range"
    );
  }, [selectedDate, selectedMonth, selectedRange]);

  // Reset other filters when selecting a new type
  const resetOtherFilters = (keep: "day" | "month" | "range") => {
    if (keep !== "day") setSelectedDate(undefined, false);
    if (keep !== "month") setSelectedMonth(undefined, false);
    if (keep !== "range") setSelectedRange(undefined, false);
  };

  const MonthPicker = ({ selectedMonth, onSelect }: { selectedMonth?: Date; onSelect: (date: Date) => void }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
    const [year, setYear] = useState(selectedMonth?.getFullYear() || currentYear);

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    return (
      <div className="p-3 w-64 bg-white rounded shadow-md">
        <select
          className="w-full mb-3 border rounded p-2"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
  <div className="grid grid-cols-3 gap-2">
  {months.map((month, index) => {
    const date = new Date(year, index, 1);
    const isSelected = selectedMonth?.getFullYear() === year && selectedMonth?.getMonth() === index;

    return (
      <Button
        key={month}
        onClick={() => onSelect(date)}
        className={`w-full rounded border text-sm text-center px-3 py-2 truncate
          ${isSelected 
            ? "bg-blue-100 text-blue-700 border-blue-300" 
            : "bg-white text-gray-800 border-gray-300 hover:bg-blue-50 hover:text-blue-700"
          }`}
      >
        {month}
      </Button>
    );
  })}
</div>

      </div>
    );
  };

  return (
    <header className="flex flex-col h-auto shrink-0 gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear md:px-4">
      <div className="flex items-center gap-6">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumbs breadcrumbs={breadcrumbs} />

        <div className="flex items-center gap-8 mt-2 mb-3">
          {/* Filter Type Select */}
          <div className="w-36">
            <Select value={filterType} onValueChange={(value) => setFilterType(value as FilterType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="range">Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Day Filter */}
          {filterType === "day" && (
            <Popover open={dayOpen} onOpenChange={setDayOpen}>
              <PopoverTrigger asChild>
                <Button className="w-40">{displayDate}</Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    resetOtherFilters("day");
                    setSelectedDate(date, true);
                    setDayOpen(false);
                  }}
                  disabled={(d) => d > new Date()}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Month Filter */}
          {filterType === "month" && (
            <Popover open={monthOpen} onOpenChange={setMonthOpen}>
              <PopoverTrigger asChild>
                <Button className="w-48 border rounded">{displayMonth}</Button>
              </PopoverTrigger>
              <PopoverContent>
                <MonthPicker
                  selectedMonth={selectedMonth}
                  onSelect={(date) => {
                    resetOtherFilters("month");
                    setSelectedMonth(date, true);
                    setMonthOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Range Filter */}
          {filterType === "range" && (
            <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
              <PopoverTrigger asChild>
                <Button className="w-60">{displayRange}</Button>
              </PopoverTrigger>
              <PopoverContent className="w-[700px] max-w-full p-4 overflow-x-auto">
                <Calendar
                  mode="range"
                  selected={selectedRange}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      resetOtherFilters("range");
                      setSelectedRange(range, true);
                    }
                  }}
                  numberOfMonths={2}
                  className="w-full"
                  disabled={(d) => d > new Date()}
                />
                <div className="mt-2 flex justify-between">
                  <Button size="sm" variant="outline" onClick={() => setSelectedRange(undefined, true)}>Reset</Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </header>
  );
}
