"use client";

import { useMemo, useState } from "react";
import AppLayout from "@/layouts/app-layout"; // your wrapper around AppLayoutTemplate
import { type BreadcrumbItem } from "@/types";
import { Link, Head } from "@inertiajs/react";
import { flexRender } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import products from "@/routes/product";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createColumnHelper, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from "@tanstack/react-table";

import { FilterProvider, useFilter } from "./campaign/FilterContext";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Products", href: "/products" },
];

interface ProductProps {
  productData: {
    id: string;
    data: Record<string, any>;
    campaign_start_date?: string;
    campaign_end_date?: string;
    campaign?: { id: string; campaign_name: string }[];
  }[];
}

// Category color helper
const categoryColors: Record<string, string> = {};
const getCategoryColor = (category: string) => {
  if (!category) return "bg-gray-100";
  if (!categoryColors[category]) {
    const colors = [
      "bg-red-200", "bg-green-200", "bg-blue-200",
      "bg-yellow-200", "bg-purple-200", "bg-pink-200",
      "bg-orange-200",
    ];
    categoryColors[category] = colors[Object.keys(categoryColors).length % colors.length];
  }
  return categoryColors[category];
};

// Wrapper to provide global filter context
export default function ProductPageWrapper(props: ProductProps) {
  return (
    <FilterProvider>
      <ProductPage {...props} />
    </FilterProvider>
  );
}

function ProductPage({ productData }: ProductProps) {
  const { filterType, selectedDate, selectedMonth, selectedRange, selectedCategory } = useFilter();
  const [sorting, setSorting] = useState<SortingState>([]);

  // Compute all categories from product data
  const categories = useMemo(() => {
    const set = new Set<string>();
    productData.forEach((row) => {
      if (row.data.category) set.add(row.data.category);
    });
    return Array.from(set).sort();
  }, [productData]);

  // Table columns
  const columnNames: Record<string, string> = {
    product_name: "Product Name",
    category: "Category",
    campaigns: "Campaigns",
    average_roas: "Average ROAS",
    total_revenue: "Total Revenue",
    total_clicks: "Total Clicks",
    orders: "Orders",
    campaign_start_date: "Start Date",
    campaign_end_date: "End Date",
  };

  const columnHelper = createColumnHelper<{ id: string; data: Record<string, any>; campaign?: any }>();
  const columns = Object.keys(columnNames).map((key) =>
    columnHelper.accessor((row) => row.data[key], {
      id: key,
      header: columnNames[key],
      cell: (info) => {
        const value = info.getValue();
        const row = info.row.original;

        if (key === "product_name") return value ?? "-";

        if (key === "average_roas") {
          const bgColor = value && value > 0 ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-700";
          return <div className={`px-2 py-1 rounded text-center ${bgColor}`}>{value && value > 0 ? Number(value).toFixed(2) + "%" : "0%"}</div>;
        }

        if (key === "category") {
          const bgColor = getCategoryColor(value);
          return <div className={`px-2 py-1 rounded text-center ${bgColor}`}>{value ?? "-"}</div>;
        }

        if (key === "campaigns") {
          const href = row.id ? `/products/${row.id}/campaign` : "#";

          return (
            <Link href={row.id != null ? href : "#"} className="text-blue-600 hover:underline">
              <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">
                {value ?? 0}
              </Badge>
            </Link>
          );
        }

        if (key === "total_revenue") {
          return <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">{value ? Number(value).toFixed(2) + " KWD" : "0 KWD"}</Badge>;
        }

        if (["total_clicks", "orders", "campaigns"].includes(key)) {
          return <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">{value ?? 0}</Badge>;
        }

        if (key === "campaign_start_date" || key === "campaign_end_date") {
          return <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">{value ? new Date(value).toLocaleDateString() : "-"}</Badge>;
        }

        return <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">{value ?? "-"}</Badge>;
      },
    })
  );

  // Filtered data
  const filteredData = useMemo(() => {
    return productData.filter((row) => {
      if (selectedCategory && selectedCategory !== "all" && row.data.category !== selectedCategory) return false;

      const start = row.data.campaign_start_date ? new Date(row.data.campaign_start_date) : null;
      const end = row.data.campaign_end_date ? new Date(row.data.campaign_end_date) : null;
      if (!start || !end) return true;

      if (filterType === "day" && selectedDate) {
        const sel = new Date(selectedDate); sel.setHours(0, 0, 0, 0);
        return start <= sel && end >= sel;
      }

      if (filterType === "month" && selectedMonth) {
        return start.getMonth() === selectedMonth.getMonth() && start.getFullYear() === selectedMonth.getFullYear();
      }

      if (filterType === "range" && selectedRange?.from && selectedRange?.to) {
        const from = new Date(selectedRange.from); from.setHours(0, 0, 0, 0);
        const to = new Date(selectedRange.to); to.setHours(23, 59, 59, 999);
        return start >= from && end <= to;
      }

      return true;
    });
  }, [productData, filterType, selectedDate, selectedMonth, selectedRange, selectedCategory]);

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
        categories,
        hideGlobalFilter: false,
        showCategoryFilter: true,
      }}
    >
      <Head title="Products" />

      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Product Records</h1>

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
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
