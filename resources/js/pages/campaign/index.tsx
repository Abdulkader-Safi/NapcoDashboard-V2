"use client";

import { useMemo, useState } from "react";
import AppLayout from "@/layouts/app-layout";
import campaign from "@/routes/campaign";
import { type BreadcrumbItem } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { flexRender } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
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
import { FilterProvider, useFilter, type FilterType } from "./FilterContext";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Campaign", href: campaign.index.url() },
];

interface CampaignProps {
  campaignData: {
    id: string;
    file_name?: string;
    data: Record<string, any>;
    products?: { id: string; product_name: string }[];
  }[];
  updatedCampaigns?: Record<string, string>;
}

export default function CampaignPageWrapper(props: CampaignProps) {
  return (
    <FilterProvider>
      <Campaign {...props} />
    </FilterProvider>
  );
}

function Campaign({ campaignData, updatedCampaigns }: CampaignProps) {
  const { filterType, selectedDate, selectedMonth, selectedRange } = useFilter();
  const [sorting, setSorting] = useState<SortingState>([]);

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

  const columnHelper = createColumnHelper<{ id: string; data: Record<string, any>; products?: any }>();
  const columns = Object.keys(columnNames).map((key) =>
    columnHelper.accessor((row) => row.data[key], {
      id: key,
      header: columnNames[key],
      cell: (info) => {
        const value = info.getValue();
        const row = info.row.original;

        if (key === "campaign_name") return value ?? "-";

        if (key === "product_count") {
          return (
            <Link
              href={campaign.products.url(row.id)}
              className="text-blue-600 hover:underline"
            >
              <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">
                {value ?? 0}
              </Badge>
            </Link>
          );
        }
        if (key === "sales_revenue") {
          return (
            <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">
              {value ?? 0} KWD
            </Badge>
          );
        }

        if (key === "roas") {
          const numValue = value ? Number(value).toFixed(2) : "0";
          return <div className="px-2 py-1 rounded text-center bg-blue-700 text-white">{numValue} %</div>;
        }

        return (
          <Badge variant="outline" className="border border-gray-400 text-gray-700 px-2 py-1 rounded">
            {value ?? "-"}
          </Badge>
        );
      },
    })
  );

  const filteredData = useMemo(() => {
    if (!campaignData) return [];
    if (filterType === "all") return campaignData;

    return campaignData.filter((row) => {
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
        const from = new Date(selectedRange.from); from.setHours(0, 0, 0, 0);
        const to = new Date(selectedRange.to); to.setHours(23, 59, 59, 999);
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

  if (!campaignData || campaignData.length === 0) {
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Campaign" />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Campaign Records</h1>
          <Link
            href={campaign.upload.url()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Upload Campaign File
          </Link>
        </div>

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
