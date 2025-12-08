import AppLayout from '@/layouts/app-layout';
import campaign from '@/routes/campaign';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import DataTable from 'react-data-table-component';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Campaign', href: campaign.index.url() },
];

interface CampaignProps {
    campaignData: {
        id: number;
        file_name: string;
        data: Record<string, any>;
    }[];
}

export default function Campaign({ campaignData }: CampaignProps) {
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

    const firstRow = campaignData[0].data;

    // Custom headers mapping
    const columnNames: Record<string, string> = {
        campaign_name: 'Campaign Name',
        roas: 'Average ROAS',
        product_name: 'Products',
        campaign_start_date: 'Start Date',
        campaign_end_date: 'End Date',
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

                <DataTable
                    columns={columns}
                    data={campaignData}
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
