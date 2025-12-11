"use client";

import { useMemo, useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, usePage, Link } from "@inertiajs/react";
import { flexRender } from "@tanstack/react-table";
import { createColumnHelper, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type BreadcrumbItem } from "@/types";

interface Campaign {
  campaign_id: number;
  campaign_name: string;
  category: string;
  total_revenue: number;
  total_clicks: number;
  orders: number;
  average_roas: number;
  ctr: string;
  cvr: string;
  campaign_start_date: string | null;
  campaign_end_date: string | null;
}

interface Props {
  productName: string;
  campaigns: Campaign[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Products", href: "/products" },
  { title: "Campaign Detail", href: "#" },
];

// Category color helper
const categoryColors: Record<string, string> = {};
const getCategoryColor = (category: string) => {
  if (!category) return "bg-gray-100";
  if (!categoryColors[category]) {
    const colors = ["bg-red-200","bg-green-200","bg-blue-200","bg-yellow-200","bg-purple-200","bg-pink-200","bg-orange-200"];
    categoryColors[category] = colors[Object.keys(categoryColors).length % colors.length];
  }
  return categoryColors[category];
};

export default function CampaignDetailPage() {
  const { props } = usePage<Props>();
  const { productName, campaigns } = props;

  const [sorting, setSorting] = useState<SortingState>([]);

  const columnHelper = createColumnHelper<Campaign>();

  const columns = [
    columnHelper.accessor("campaign_name", {
      header: "Campaign Name",
      cell: (info) => info.getValue() ?? "-",
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => (
        <div className={`px-2 py-1 rounded text-center ${getCategoryColor(info.getValue())}`}>
          {info.getValue() ?? "-"}
        </div>
      ),
    }),
    columnHelper.accessor("total_revenue", {
      header: "Total Revenue",
      cell: (info) => (
        <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">
          {info.getValue() ? Number(info.getValue()).toFixed(2) + " KWD" : "0 KWD"}
        </Badge>
      ),
    }),
    columnHelper.accessor("total_clicks", {
      header: "Total Clicks",
      cell: (info) => <Badge variant="outline" variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">{info.getValue() ?? 0}</Badge>,
    }),
    columnHelper.accessor("orders", {
      header: "Orders",
      cell: (info) => <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">{info.getValue() ?? 0}</Badge>,
    }),
    columnHelper.accessor("average_roas", {
      header: "Average ROAS",
      cell: (info) => {
        const value = info.getValue();
        return <Badge variant="outline" className={`px-2 py-1 rounded text-center ${value > 0 ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-700"}`}>{value ? Number(value).toFixed(2) + "%" : "0%"}</Badge>;
      },
    }),
    columnHelper.accessor("ctr", { header: "CTR", cell: (info) => <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">{info.getValue() ?? "0%"}</Badge> }),
    columnHelper.accessor("cvr", { header: "CVR", cell: (info) => <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">{info.getValue() ?? "0%"}</Badge> }),
    columnHelper.accessor("campaign_start_date", {
      header: "Start Date",
      cell: (info) => <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">{info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "-"}</Badge>,
    }),
    columnHelper.accessor("campaign_end_date", {
      header: "End Date",
      cell: (info) => <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">{info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "-"}</Badge>,
    }),
  ];

  const table = useReactTable({
    data: campaigns,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Campaign Detail: ${productName}`} />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Campaigns for "{productName}"</h1>

        {campaigns.length === 0 ? (
          <p className="text-gray-500">No campaigns found for this product.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <Table className="min-w-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          <button className="flex items-center gap-1 hover:text-blue-600" onClick={header.column.getToggleSortingHandler()}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <span className="text-xs">{header.column.getIsSorted() === "asc" ? "▲" : header.column.getIsSorted() === "desc" ? "▼" : "⇅"}</span>
                          </button>
                        )}
                      </TableHead>
                    ))}
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
        )}

        <Link href="/products" className="inline-block mt-4 text-blue-600 hover:underline">
          ← Back to Products
        </Link>
      </div>
    </AppLayout>
  );
}
