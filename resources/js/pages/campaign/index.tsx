import AppLayout from '@/layouts/app-layout';
import campaign from '@/routes/campaign';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Campaign', href: campaign.index.url() },
];

interface CampaignProps {
    campaignData: { id: number; data: Record<string, any> }[];
}

export default function Campaign({ campaignData }: CampaignProps) {
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

                {campaignData.length === 0 ? (
                    <div className="mt-10 rounded-lg border border-dashed p-6 text-center">
                        <p className="mb-4 text-gray-500">
                            No campaign data found.
                        </p>
                        {/* <Link
                            href={campaignUploadPage().url}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Upload Your First File
                        </Link> */}
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-100">
                                <tr>
                                    {Object.keys(campaignData[0].data).map(
                                        (key) => (
                                            <th
                                                key={key}
                                                className="border px-4 py-2 text-left"
                                            >
                                                {key}
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {campaignData.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-gray-50"
                                    >
                                        {Object.values(row.data).map(
                                            (val, idx) => (
                                                <td
                                                    key={idx}
                                                    className="border px-4 py-2"
                                                >
                                                    {val}
                                                </td>
                                            ),
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
