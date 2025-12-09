import AppLayout from '@/layouts/app-layout';
import upload from '@/routes/upload';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import DataTable from 'react-data-table-component';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'upload', href: upload.index.url() },
];

interface uploadProps {
    uploadData: {
        id: number;
        file_name: string;
        data: Record<string, any>;
    }[];
}

export default function upload({ uploadData }: uploadProps) {
    if (uploadData.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="upload" />
                <div className="p-6 mt-10 rounded-lg border border-dashed text-center">
                    <p className="mb-4 text-gray-500">No upload data found.</p>
                    <Link
                        href={upload.upload.url()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Upload Your First File
                    </Link>
                </div>
            </AppLayout>
        );
    }

    const firstRow = uploadData[0].data;

    // Custom headers mapping
    const columnNames: Record<string, string> = {
        upload_name: 'upload Name',
        roas: 'Average ROAS',
        product_name: 'Products',
        upload_start_date: 'Start Date',
        upload_end_date: 'End Date',
        sales_revenue: 'Total Revenue',
        click: 'Total Clicks',
        orders: 'Orders',
    };

    const columns = [
        ...Object.keys(columnNames).map((key) => ({
            name: columnNames[key],
            selector: (row: any) => {
                if (key === 'product_name') {
                    const products = row.data[key];
                    if (!products) return 0;

                    if (Array.isArray(products)) return products.length;

                    return products.toString().split(',').length;
                }
                return row.data[key] ?? '-';
            },
            sortable: true,
            wrap: true,
        })),
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="upload" />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">upload Records</h1>
                    <Link
                        href={upload.upload.url()}
                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Upload upload File
                    </Link>
                </div>

                <DataTable
                    columns={columns}
                    data={uploadData}
                    pagination
                    highlightOnHover
                    dense
                    defaultSortField="ID"
                    responsive
                />
            </div>
        </AppLayout>
    );
}
