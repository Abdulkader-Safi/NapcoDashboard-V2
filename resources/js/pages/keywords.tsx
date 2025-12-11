"use client";

import { useMemo, useState } from "react";
import { Link, Head } from "@inertiajs/react";
import { flexRender } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import keywords from "@/routes/keywords";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { FilterProvider, useFilter } from "@/pages/campaign/FilterContext";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Keywords", href: "/keywords" },
];

interface KeywordProps {
  keywordData: {
    id: string;
    data: Record<string, any>;
    campaign_start_date?: string;
    campaign_end_date?: string;
    products?: { id: string; product_name: string }[];
  }[];
}

// Helper for category colors
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

// ✅ Wrapper page with FilterProvider
export default function KeywordPageWrapper(props: KeywordProps) {
  return (
    <FilterProvider>
      <KeywordPage {...props} />
    </FilterProvider>
  );
}

function KeywordPage({ keywordData }: KeywordProps) {
  const { filterType, selectedDate, selectedMonth, selectedRange } = useFilter();
  const [sorting, setSorting] = useState<SortingState>([]);

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

  const columnHelper = createColumnHelper<{ id: string; data: Record<string, any>; products?: any }>();

  const columns = Object.keys(columnNames).map((key) =>
    columnHelper.accessor((row) => row.data[key], {
      id: key,
      header: columnNames[key],
      cell: (info) => {
        const value = info.getValue();
        const row = info.row.original;

        if (key === "keyword_name") return value ?? "-";

        if (key === "average_roas") {
          const bgColor = value && value > 0 ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-700";
          return <div className={`px-2 py-1 rounded text-center ${bgColor}`}>{value && value > 0 ? Number(value).toFixed(2) + "%" : "0%"}</div>;
        }

        if (key === "category") {
          const bgColor = getCategoryColor(value);
          return <div className={`px-2 py-1 rounded text-center ${bgColor}`}>{value ?? "-"}</div>;
        }

        if (key === "product_count") {
          return (

            <Link
              href={row.id != null ? keywords.products.url(row.id) : "#"}
              className="text-blue-600 hover:underline"
            >

              <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">
                {value ?? 0}
              </Badge>
            </Link>
          );
        }

        // All other fields wrapped in Badge
        let displayValue: string | number = value ?? "-";
        if (key === "total_revenue" || key === "avg_cpc") displayValue = value ? Number(value).toFixed(2) + " KWD" : "0 KWD";
        if (key === "ctr") displayValue = value ?? "0%";
        if (["total_clicks", "orders", "impressions", "product_count"].includes(key)) displayValue = value ?? 0;
        if (key === "campaign_start_date" || key === "campaign_end_date") displayValue = value ? new Date(value).toLocaleDateString() : "-";

        return (
          <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">
            {displayValue}
          </Badge>
        );
      },
    })
  );

  // Filtered data based on global day/month/range
  const filteredData = useMemo(() => {
    if (filterType === "all") return keywordData;

    return keywordData.filter((row) => {
      const start = row.data.campaign_start_date ? new Date(row.data.campaign_start_date) : null;
      const end = row.data.campaign_end_date ? new Date(row.data.campaign_end_date) : null;
      if (!start || !end) return true;

      if (filterType === "day" && selectedDate) {
        const sel = new Date(selectedDate); sel.setHours(0, 0, 0, 0);
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

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      headerProps={{
        hideGlobalFilter: false, // show global day/month/range filter
        showCategoryFilter: false, // no category filter here
      }}
    >
      <Head title="Keywords" />

      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Keyword Records</h1>

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
