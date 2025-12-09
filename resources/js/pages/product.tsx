import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import DataTable from 'react-data-table-component';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: '/products' },
];

interface ProductProps {
    productData: {
        id: string;
        data: Record<string, any>;
    }[];
}

// Helper to assign color per category
const categoryColors: Record<string, string> = {};
const getCategoryColor = (category: string) => {
    if (!category) return 'bg-gray-100';
    if (!categoryColors[category]) {
        // Pick a random pastel color for new categories
        const colors = ['bg-red-200', 'bg-green-200', 'bg-blue-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200', 'bg-orange-200'];
        categoryColors[category] = colors[Object.keys(categoryColors).length % colors.length];
    }
    return categoryColors[category];
};

export default function Product({ productData }: ProductProps) {

    const columnNames: Record<string, string> = {
        product_name: 'Product Name',
        average_roas: 'Average ROAS',
        category: 'Category',
        campaigns: 'Campaigns',
        total_revenue: 'Total Revenue',
        total_clicks: 'Total Clicks',
        orders: 'Orders',
    };

    const columns = Object.keys(columnNames).map((key) => ({
        name: columnNames[key],
        selector: (row: any) => row.data[key] ?? '-',
        sortable: true,
        wrap: true,
        cell: (row: any) => {
            const value = row.data[key];

            // Highlight Average ROAS
            if (key === 'average_roas') {
                const bgColor = value && value > 0 ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700';
                return (
                    <div className={`px-2 py-1 rounded text-center ${bgColor}`}>
                        {value && value > 0 ? Number(value).toFixed(2) + '%' : '0%'}
                    </div>
                );
            }


            // Highlight Category
            if (key === 'category') {
                const bgColor = getCategoryColor(value);
                return (
                    <div className={`px-2 py-1 rounded text-center ${bgColor}`}>
                        {value ?? '-'}
                    </div>
                );
            }

            if (key === 'total_revenue') {
                return value ? Number(value).toFixed(2) + ' KWD' : '0 KWD';
            }

            // Format numeric values
            if (['total_revenue', 'total_clicks', 'orders', 'ctr', 'cvr'].includes(key)) {
                return value ?? 0;
            }

            return value ?? '-';
        },
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Product Records</h1>
                </div>

                <DataTable
                    columns={columns}
                    data={productData}
                    pagination
                    highlightOnHover
                    dense
                    responsive
                />
            </div>
        </AppLayout>
    );
}
