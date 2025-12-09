import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { flexRender } from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    createColumnHelper,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
} from '@tanstack/react-table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'keywords', href: '/keywords' },
];

interface KeywordProps {
    keywordData: {
        id: string;
        data: Record<string, any>;
    }[];
}

// Helper to assign color per category
const categoryColors: Record<string, string> = {};
const getCategoryColor = (category: string) => {
    if (!category) return 'bg-gray-100';
    if (!categoryColors[category]) {
        const colors = [
            'bg-red-200',
            'bg-green-200',
            'bg-blue-200',
            'bg-yellow-200',
            'bg-purple-200',
            'bg-pink-200',
            'bg-orange-200',
        ];
        categoryColors[category] = colors[Object.keys(categoryColors).length % colors.length];
    }
    return categoryColors[category];
};

export default function Keyword({ keywordData }: KeywordProps) {
    const columnNames: Record<string, string> = {
        keyword_name: 'Keyword',
        category: 'Category',
        total_clicks: 'Total Clicks',
        impressions: 'Impressions',
        ctr: 'CTR',
        average_roas: 'Average ROAS',
        total_revenue: 'Total Revenue',
        product_count: 'Products',
        avg_cpc: 'Avg CPC',
    };

    const columnHelper = createColumnHelper<{ id: string; data: Record<string, any> }>();

    const columns = Object.keys(columnNames).map((key) =>
        columnHelper.accessor((row) => row.data[key], {
            id: key,
            header: columnNames[key],
            cell: (info) => {
                const value = info.getValue();

                // Average ROAS highlight
                if (key === 'average_roas') {
                    const bgColor = value && value > 0 ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700';
                    return (
                        <div className={`px-2 py-1 rounded text-center ${bgColor}`}>
                            {value && value > 0 ? Number(value).toFixed(2) + '%' : '0%'}
                        </div>
                    );
                }

                // Category color
                if (key === 'category') {
                    const bgColor = getCategoryColor(value);
                    return (
                        <div className={`px-2 py-1 rounded text-center ${bgColor}`}>
                            {value ?? '-'}
                        </div>
                    );
                }

                // Currency formatting
                if (key === 'total_revenue' || key === 'avg_cpc') {
                    return value ? Number(value).toFixed(2) + ' KWD' : '0 KWD';
                }

                // CTR display
                if (key === 'ctr') return value ?? '0%';

                // Numbers
                if (['total_clicks', 'orders', 'impressions', 'campaigns', 'product_count'].includes(key)) {
                    return value ?? 0;
                }

                return value ?? '-';
            },
        })
    );

    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        data: keywordData,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="keywords" />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Keyword Records</h1>
                </div>

                <div className="overflow-x-auto border rounded-md">
                    <Table className="w-full">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        if (header.isPlaceholder) return <TableHead key={header.id} />;
                                        const isSorted = header.column.getIsSorted(); // 'asc' | 'desc' | false
                                        return (
                                            <TableHead key={header.id}>
                                                <button
                                                    className="flex items-center gap-1 hover:text-blue-600"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    <span className="text-xs">
                                                        {isSorted === 'asc' ? '▲' : isSorted === 'desc' ? '▼' : '⇅'}
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
