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

interface AppSidebarHeaderProps {
  breadcrumbs?: BreadcrumbItemType[];
  categories?: string[];
  hideGlobalFilter?: boolean; // Hide day/month/range
  showCategoryFilter?: boolean; // Show category filter row (for products)
}

export function AppSidebarHeader({ breadcrumbs = [], categories, hideGlobalFilter, showCategoryFilter }: AppSidebarHeaderProps) {
  const filter = useFilter(); // may be null if no provider

  // Provide safe defaults if FilterProvider is missing
  const filterType = filter?.filterType ?? "all";
  const setFilterType = filter?.setFilterType ?? (() => { });
  const selectedDate = filter?.selectedDate;
  const setSelectedDate = filter?.setSelectedDate ?? (() => { });
  const selectedMonth = filter?.selectedMonth;
  const setSelectedMonth = filter?.setSelectedMonth ?? (() => { });
  const selectedRange = filter?.selectedRange;
  const setSelectedRange = filter?.setSelectedRange ?? (() => { });
  const selectedCategory = filter?.selectedCategory;
  const setSelectedCategory = filter?.setSelectedCategory ?? (() => { });

  // If filter provider is missing, optionally hide filter row
  const showFilters = Boolean(filter);

  const [dayOpen, setDayOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);

  const [displayDate, setDisplayDate] = useState("Select Date");
  const [displayMonth, setDisplayMonth] = useState("Select Month");
  const [displayRange, setDisplayRange] = useState("Select Range");

  useEffect(() => {
    setDisplayDate(selectedDate ? selectedDate.toDateString() : "Select Date");
    setDisplayMonth(selectedMonth ? selectedMonth.toLocaleString("default", { month: "long", year: "numeric" }) : "Select Month");
    setDisplayRange(selectedRange?.from && selectedRange?.to ? `${selectedRange.from.toLocaleDateString()} - ${selectedRange.to.toLocaleDateString()}` : "Select Range");
  }, [selectedDate, selectedMonth, selectedRange]);

  const resetOtherFilters = (keep: "day" | "month" | "range") => {
    if (keep !== "day") setSelectedDate(undefined, false);
    if (keep !== "month") setSelectedMonth(undefined, false);
    if (keep !== "range") setSelectedRange(undefined, false);
  };

  // MonthPicker only shows months, no headers or extra filters
  const MonthPicker = ({ selectedMonth, onSelect }: { selectedMonth?: Date; onSelect: (date: Date) => void }) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {months.map((monthName, index) => {
          const date = new Date(selectedMonth?.getFullYear() || new Date().getFullYear(), index, 1);
          return (
            <Button
              key={monthName}
              size="sm"
              variant="outline"
              onClick={() => onSelect(date)}
            >
              {monthName}
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <header className="flex flex-col h-auto shrink-0 gap-2 border-b border-sidebar-border/50 px-6 md:px-4">
      <div className="flex items-center gap-6">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumbs breadcrumbs={breadcrumbs} />

        {/* Only render filter row if provider exists */}
        {showFilters && (
          <div className="flex items-center gap-8 mt-2 mb-3">
            {/* Filter Type */}
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

            {/* Category Filter */}
            {categories && categories.length > 0 && showCategoryFilter && (
              <div className="w-36">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

                    {/* Day Filter */}
          {filterType === "day" && !hideGlobalFilter && (
            <Popover open={dayOpen} onOpenChange={setDayOpen}>
              <PopoverTrigger asChild>
                <Button className="w-40">{displayDate}</Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => { resetOtherFilters("day"); setSelectedDate(date, true); setDayOpen(false); }}
                  disabled={(d) => d > new Date()}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Month Filter */}
          {filterType === "month" && !hideGlobalFilter && (
            <Popover open={monthOpen} onOpenChange={setMonthOpen}>
              <PopoverTrigger asChild>
                <Button className="w-48 border rounded">{displayMonth}</Button>
              </PopoverTrigger>
              <PopoverContent>
                <MonthPicker
                  selectedMonth={selectedMonth}
                  onSelect={(date) => { resetOtherFilters("month"); setSelectedMonth(date, true); setMonthOpen(false); }}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Range Filter */}
          {filterType === "range" && !hideGlobalFilter && (
            <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
              <PopoverTrigger asChild>
                <Button className="w-60">{displayRange}</Button>
              </PopoverTrigger>
              <PopoverContent className="w-[700px] max-w-full p-4 overflow-x-auto">
                <Calendar
                  mode="range"
                  selected={selectedRange}
                  onSelect={(range) => { if (range?.from && range?.to) { resetOtherFilters("range"); setSelectedRange(range, true); } }}
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
        )}
      </div>
    </header>
  );
}


