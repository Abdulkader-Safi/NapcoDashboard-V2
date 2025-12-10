"use client";

import { useState, useMemo } from "react";
import AppLayout from "@/layouts/app-layout";
import campaign from "@/routes/campaign";
import { type BreadcrumbItem } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { flexRender } from "@tanstack/react-table";
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
  { title: "Campaign", href: campaign.index.url() },
];

interface CampaignProps {
  campaignData: {
    id: string;
    file_name?: string;
    data: Record<string, any>;
  }[];
  updatedCampaigns?: Record<string, string>; // new prop
}

type FilterType = "all" | "day" | "month" | "range";

export default function Campaign({ campaignData, updatedCampaigns }: CampaignProps) {
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange>();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const columnNames: Record<string, string> = {
    campaign_name: "Campaign Name",
    roas: "Average ROAS",
    product_count: "Products",
    campaign_start_date: "Start Date",
    campaign_end_date: "End Date",
    sales_revenue: "Total Revenue",
    clicks: "Total Clicks",
    orders: "Orders",
  };

  const columnHelper = createColumnHelper<{ id: string; data: Record<string, any> }>();

  const columns = Object.keys(columnNames).map((key) =>
    columnHelper.accessor((row) => row.data[key], {
      id: key,
      header: columnNames[key],
      cell: (info) => {
        const value = info.getValue();

        if (key === "product_count") return value ?? 0;

        if (["roas", "sales_revenue"].includes(key)) {
          const numericValue = value ? Number(value) : 0; // keep as number
          const numDisplay = numericValue.toFixed(2);     // string for display

          if (key === "roas") {
            const bgColor = numericValue > 0 ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-700";

            return (
              <div className={`px-2 py-1 rounded text-center ${bgColor}`}>
                {numericValue > 0 ? `${numDisplay}%` : "0%"}
              </div>
            );
          }

          if (key === "sales_revenue") {
            return (
              <div className="px-2 py-1 text-right">
                {numDisplay} KWD
              </div>
            );
          }

          return numDisplay;
        }


        return value ?? "-";
      },
    })
  );


  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredData = useMemo(() => {
    if (filterType === "all") return campaignData;

    return campaignData.filter((row) => {
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
  }, [campaignData, filterType, selectedDate, selectedMonth, selectedRange]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (campaignData.length === 0) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Campaign" />
        <div className="p-6 mt-10 rounded-lg border border-dashed text-center">
          <p className="mb-4 text-gray-500">No campaign data found.</p>
          <Link
            href={campaign.upload.url()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload Your First File
          </Link>
        </div>
      </AppLayout>
    );
  }

  const MonthPicker = ({ selectedMonth, onSelect }: { selectedMonth?: Date; onSelect: (date: Date) => void; }) => {
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

            const disabled =
              date.getFullYear() > today.getFullYear() ||
              (date.getFullYear() === today.getFullYear() &&
                index > today.getMonth());

            return (
              <button
                key={month}
                disabled={disabled}
                onClick={() => !disabled && onSelect(date)}
                className={`p-2 text-sm rounded border ${disabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "hover:bg-blue-600 hover:text-white"
                  } ${selectedMonth &&
                    selectedMonth.getFullYear() === year &&
                    selectedMonth.getMonth() === index
                    ? "bg-blue-700 text-white"
                    : ""
                  }`}
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
      <Head title="Campaign" />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Campaign Records</h1>
          {campaignData.length > 0 && (
            <Link
              href={campaign.upload.url()}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Upload Campaign File
            </Link>
          )}
        </div>

        {/* Recently Updated Campaigns */}
        {updatedCampaigns && Object.keys(updatedCampaigns).length > 0 && (
          <div className="mb-4 p-4 border rounded bg-green-50">
            <h4 className="font-semibold mb-2">Recently Updated Campaigns:</h4>
            <ul className="list-disc list-inside">
              {Object.entries(updatedCampaigns).map(([id, name]) => (
                <li key={id}>
                  {name} (ID: {id})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Filter bar */}
        <div className="mb-4 flex items-center gap-4">
          <div className="w-36">
            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as FilterType)}
            >
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
                <MonthPicker selectedMonth={selectedMonth} onSelect={(date) => setSelectedMonth(date)} />
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
                        <button
                          className="flex items-center gap-1 hover:text-blue-600"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="text-xs">
                            {isSorted === "asc" ? "▲" : isSorted === "desc" ? "▼" : "⇅"}
                          </span>
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
