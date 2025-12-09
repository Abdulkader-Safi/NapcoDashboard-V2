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
        id: string;
        file_name?: string;
        data: Record<string, any>;
    }[];
}

export default function Campaign({ campaignData }: CampaignProps) {
    // Show upload button only if no data
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

    // Column mapping for DataTable
    const columnNames: Record<string, string> = {
        campaign_name: 'Campaign Name',
        roas: 'Average ROAS',
        product_count: 'Products',
        campaign_start_date: 'Start Date',
        campaign_end_date: 'End Date',
        sales_revenue: 'Total Revenue',
        clicks: 'Total Clicks',
        orders: 'Orders',
    };

    const columns = Object.keys(columnNames).map((key) => ({
        name: columnNames[key],
        selector: (row: any) => row.data[key] ?? '-',
        sortable: true,
        wrap: true,
        cell: (row: any) => {
            const value = row.data[key];

            // Show product count
            if (key === 'product_count') {
                return value ?? 0;
            }

            // Format numbers
            if (['roas', 'sales_revenue'].includes(key)) {
                const numValue = value ? Number(value).toFixed(2) : '0';

                // Colored background for ROAS
                if (key === 'roas') {
                    let bgColor = 'bg-gray-100';
                    if (value >= 150) bgColor = 'bg-green-300';
                    else if (value >= 100) bgColor = 'bg-yellow-300';
                    else if (value > 0) bgColor = 'bg-red-300';

                    return (
                        <div className={`px-2 py-1 rounded ${bgColor} text-center`}>
                            {numValue}
                        </div>
                    );
                }

                return numValue;
            }

            return value ?? '-';
        },
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Campaign" />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Campaign Records</h1>
                    {/* Hide upload button if data exists */}
                    {campaignData.length === 0 ? null : (
                        <Link
                            href={campaign.upload.url()}
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Upload Campaign File
                        </Link>
                    )}
                </div>

                <DataTable
                    columns={columns}
                    data={campaignData}
                    pagination
                    highlightOnHover
                    dense
                    responsive
                />
            </div>
        </AppLayout>
    );
}
