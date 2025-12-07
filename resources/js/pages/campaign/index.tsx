import AppLayout from "@/layouts/app-layout";
import { page as campaignUploadPage } from "@/routes/campaign/upload";
import campaign from "@/routes/campaign";
import { type BreadcrumbItem } from "@/types";
import { Head, Link } from "@inertiajs/react";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Campaign", href: campaign.upload.url() },
];

interface CampaignProps {
    campaignData: { id: number; data: Record<string, any> }[];
}

export default function Campaign({ campaignData }: CampaignProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Campaign" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-semibold">Campaign Records</h1>

                    <Link
                        href={campaignUploadPage().url} // fixed route here
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Upload Campaign File
                    </Link>
                </div>

                {campaignData.length === 0 ? (
                    <div className="text-center mt-10 p-6 border border-dashed rounded-lg">
                        <p className="mb-4 text-gray-500">No campaign data found.</p>
                        {/* <Link
                            href={campaignUploadPage().url}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Upload Your First File
                        </Link> */}
                    </div>
                ) : (
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-100">
                                <tr>
                                    {Object.keys(campaignData[0].data).map((key) => (
                                        <th
                                            key={key}
                                            className="border px-4 py-2 text-left"
                                        >
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {campaignData.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        {Object.values(row.data).map((val, idx) => (
                                            <td key={idx} className="border px-4 py-2">
                                                {val}
                                            </td>
                                        ))}
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
