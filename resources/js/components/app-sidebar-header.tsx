"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useFilter, FilterType } from "@/pages/campaign/FilterContext";
import { useState } from "react";
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

  // Month picker component
  const MonthPicker = ({
    selectedMonth,
    onSelect,
  }: {
    selectedMonth?: Date;
    onSelect: (date: Date) => void;
  }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
    const [year, setYear] = useState(selectedMonth?.getFullYear() || currentYear);

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    return (
      <div className="p-3 w-64">
        <select
          className="w-full mb-3 border rounded p-2"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => {
            const date = new Date(year, index, 1);
            const today = new Date();
            const disabled = date.getFullYear() > today.getFullYear() ||
              (date.getFullYear() === today.getFullYear() && index > today.getMonth());

            return (
              <Button
                key={month}
                disabled={disabled}
                onClick={() => !disabled && onSelect(date)}
                className={`p-2 text-sm rounded border ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-blue-600 hover:text-white"} ${selectedMonth?.getFullYear() === year && selectedMonth.getMonth() === index ? "bg-blue-700 text-white" : ""}`}
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
            <Popover>
              <PopoverTrigger asChild>
                <Button className="w-40">
                  {selectedDate ? selectedDate.toDateString() : "Select Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Month Filter */}
          {filterType === "month" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button className="w-48">
                  {selectedMonth
                    ? selectedMonth.toLocaleString("default", { month: "long", year: "numeric" })
                    : "Select Month"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <MonthPicker
                  selectedMonth={selectedMonth}
                  onSelect={(date) => setSelectedMonth(date)}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Range Filter */}
          {filterType === "range" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button className="w-60">
                  {selectedRange?.from && selectedRange?.to
                    ? `${selectedRange.from.toLocaleDateString()} - ${selectedRange.to.toLocaleDateString()}`
                    : "Select Range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="range"
                  selected={selectedRange}
                  onSelect={(range) => setSelectedRange(range)}
                  numberOfMonths={2}
                  disabled={(date) => date > new Date()}
                  className="rounded-lg border shadow-sm"
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </header>
  );
}
