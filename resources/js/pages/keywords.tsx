"use client";

import { useState, useMemo } from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { flexRender } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
    createColumnHelper,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
} from "@tanstack/react-table";

import { type DateRange } from "react-day-picker";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Keywords", href: "/keywords" },
];

interface KeywordProps {
    keywordData: {
        id: string;
        data: Record<string, any>;
        campaign_start_date?: string;
        campaign_end_date?: string;
    }[];
}

type FilterType = "all" | "day" | "month" | "range";

// Category color helper
const categoryColors: Record<string, string> = {};
const getCategoryColor = (category: string) => {
    if (!category) return "bg-gray-100";
    if (!categoryColors[category]) {
        const colors = [
            "bg-red-200",
            "bg-green-200",
            "bg-blue-200",
            "bg-yellow-200",
            "bg-purple-200",
            "bg-pink-200",
            "bg-orange-200",
        ];
        categoryColors[category] = colors[Object.keys(categoryColors).length % colors.length];
    }
    return categoryColors[category];
};

export default function Keyword({ keywordData }: KeywordProps) {
    const [filterType, setFilterType] = useState<FilterType>("all");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date());
    const [selectedRange, setSelectedRange] = useState<DateRange>();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const columnNames: Record<string, string> = {
        keyword_name: "Keyword",
        category: "Category",
        total_clicks: "Total Clicks",
        impressions: "Impressions",
        ctr: "CTR",
        average_roas: "Average ROAS",
        total_revenue: "Total Revenue",
        product_count: "Products",
        avg_cpc: "Avg CPC",
        campaign_start_date: "Start Date",
        campaign_end_date: "End Date",
    };

    const columnHelper = createColumnHelper<{ id: string; data: Record<string, any> }>();

 const columns = Object.keys(columnNames).map((key) =>
  columnHelper.accessor((row) => row.data[key], {
    id: key,
    header: columnNames[key],
    cell: (info) => {
      const value = info.getValue();

      // Do NOT apply badge on keyword_name
      if (key === "keyword_name") return value ?? "-";

      // Average ROAS with original color logic
      if (key === "average_roas") {
        const bgColor = value && value > 0 ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-700";
        return (
          <div className={`px-2 py-1 rounded text-center ${bgColor}`}>
            {value && value > 0 ? Number(value).toFixed(2) + "%" : "0%"}
          </div>
        );
      }

      // Category with original color logic
      if (key === "category") {
        const bgColor = getCategoryColor(value);
        return (
          <div className={`px-2 py-1 rounded text-center ${bgColor}`}>
            {value ?? "-"}
          </div>
        );
      }

      // All other fields (numeric, date, etc.) wrapped in outline badge
      const displayValue =
        key === "total_revenue" || key === "avg_cpc"
          ? value
            ? Number(value).toFixed(2) + " KWD"
            : "0 KWD"
          : key === "ctr"
          ? value ?? "0%"
          : ["total_clicks", "orders", "impressions", "campaigns", "product_count"].includes(key)
          ? value ?? 0
          : key === "campaign_start_date" || key === "campaign_end_date"
          ? value
            ? new Date(value).toLocaleDateString()
            : "-"
          : value ?? "-";

      return (
        <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">
          {displayValue}
        </Badge>
      );
    },
  })
);

    const [sorting, setSorting] = useState<SortingState>([]);

    // ✅ Filtered data must be declared before the table
    const filteredData = useMemo(() => {
        if (filterType === "all") return keywordData;

        return keywordData.filter((row) => {
            const start = row.data.campaign_start_date ? new Date(row.data.campaign_start_date) : null;
            const end = row.data.campaign_end_date ? new Date(row.data.campaign_end_date) : null;

            if (!start || !end) return true;

            if (filterType === "day" && selectedDate) {
                const sel = new Date(selectedDate);
                sel.setHours(0, 0, 0, 0);
                return start <= sel && end >= sel;
            }

            if (filterType === "month" && selectedMonth) {
                return start.getMonth() === selectedMonth.getMonth() &&
                    start.getFullYear() === selectedMonth.getFullYear();
            }

            if (filterType === "range" && selectedRange?.from && selectedRange?.to) {
                const { from, to } = selectedRange;
                return start >= from && end <= to;
            }

            return true;
        });
    }, [keywordData, filterType, selectedDate, selectedMonth, selectedRange]);

    // Table
    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

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
                <select className="w-full mb-3 border rounded p-2" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                    {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>

                <div className="grid grid-cols-3 gap-2">
                    {months.map((month, index) => {
                        const date = new Date(year, index, 1);
                        const today = new Date();
                        const disabled = date.getFullYear() > today.getFullYear() || (date.getFullYear() === today.getFullYear() && index > today.getMonth());

                        return (
                            <button
                                key={month}
                                disabled={disabled}
                                onClick={() => !disabled && onSelect(date)}
                                className={`p-2 text-sm rounded border ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-blue-600 hover:text-white"} ${selectedMonth && selectedMonth.getFullYear() === year && selectedMonth.getMonth() === index ? "bg-blue-700 text-white" : ""}`}
                            >
                                {month}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Keywords" />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Keyword Records</h1>
                </div>

                {/* Filter bar */}
                <div className="mb-4 flex items-center gap-4">
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

                    {/* DAY FILTER */}
                    {filterType === "day" && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button className="w-40">{selectedDate ? selectedDate.toDateString() : "Select Date"}</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} disabled={(date) => date > new Date()} />
                            </PopoverContent>
                        </Popover>
                    )}

                    {/* MONTH FILTER */}
                    {filterType === "month" && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button className="w-48">{selectedMonth ? selectedMonth.toLocaleString("default", { month: "long", year: "numeric" }) : "Select Month"}</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <MonthPicker selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
                            </PopoverContent>
                        </Popover>
                    )}

                    {/* RANGE FILTER */}
                    {filterType === "range" && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button className="w-60">
                                    {selectedRange?.from && selectedRange?.to
                                        ? `${selectedRange.from.toLocaleDateString()} - ${selectedRange.to.toLocaleDateString()}`
                                        : "Select Range"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto">
                                <Calendar
                                    mode="range"
                                    selected={selectedRange}
                                    onSelect={(range) => setSelectedRange(range)}
                                    month={currentMonth}
                                    onMonthChange={setCurrentMonth}
                                    numberOfMonths={2}
                                    disabled={(date) => date > new Date()}
                                    className="rounded-lg border shadow-sm"
                                />
                            </PopoverContent>
                        </Popover>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto border rounded-md">
                    <Table className="w-full">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        if (header.isPlaceholder) return <TableHead key={header.id} />;
                                        const isSorted = header.column.getIsSorted();
                                        return (
                                            <TableHead key={header.id}>
                                                <button className="flex items-center gap-1 hover:text-blue-600" onClick={header.column.getToggleSortingHandler()}>
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    <span className="text-xs">{isSorted === "asc" ? "▲" : isSorted === "desc" ? "▼" : "⇅"}</span>
                                                </button>
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>

                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
