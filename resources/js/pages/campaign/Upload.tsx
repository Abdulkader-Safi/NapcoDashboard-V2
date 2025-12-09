import AppLayout from '@/layouts/app-layout';
import campaign from '@/routes/campaign';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useDropzone } from 'react-dropzone';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Campaign', href: campaign.index.url() },
];

export default function CampaignUpload() {
    const { data, setData, post, progress } = useForm<{ file: File | null }>({
        file: null,
    });

    const onDrop = (acceptedFiles: File[]) => {
        setData('file', acceptedFiles[0]);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleUpload = () => {
        if (!data.file) return;

        post(campaign.store.url(), {
            preserveScroll: true,
            onSuccess: () => setData('file', null),
            onError: (errors) => console.log(errors),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload Campaign" />

            <div className="p-6">
                <h2 className="mb-4 text-xl font-semibold">
                    Upload Campaign File
                </h2>

                <div
                    {...getRootProps()}
                    className="cursor-pointer rounded-lg border border-dashed p-8 text-center"
                >
                    <input {...getInputProps()} />
                    <p>Drag & drop Excel/CSV file here</p>
                </div>

                {data.file && <p className="mt-3">{data.file.name}</p>}

                <button
                    onClick={handleUpload}
                    className="mt-5 rounded bg-blue-600 px-4 py-2 text-white"
                >
                    Upload
                </button>

                {progress && <p className="mt-3">{progress.percentage}%</p>}
            </div>
        </AppLayout>
    );
}
