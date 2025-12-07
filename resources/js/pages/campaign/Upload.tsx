import AppLayout from "@/layouts/app-layout";
import { useForm } from "@inertiajs/react";
import { useDropzone } from "react-dropzone";
import { route } from 'ziggy-js';

declare const Ziggy: any; // Global Ziggy object injected from Blade

export default function Upload() {
    const { data, setData, post, progress } = useForm({ file: null });

    const onDrop = (acceptedFiles: File[]) => {
        setData("file", acceptedFiles[0]);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleUpload = () => {
        if (!data.file) return;

        const formData = new FormData();
        formData.append('file', data.file);

        post('/campaign/store', formData, {
            preserveScroll: true,
            onSuccess: () => setData('file', null),
            onError: (errors) => console.log(errors),
        });

    };

    return (
        <AppLayout breadcrumbs={[{ title: "Upload Campaign" }]}>
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Upload Campaign File</h2>

                <div
                    {...getRootProps()}
                    className="border border-dashed p-8 text-center cursor-pointer rounded-lg"
                >
                    <input {...getInputProps()} />
                    <p>Drag & drop Excel/CSV file here</p>
                </div>

                {data.file && <p className="mt-3">{data.file.name}</p>}

                <button
                    onClick={handleUpload}
                    className="mt-5 bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Upload
                </button>

                {progress && <p className="mt-3">{progress.percentage}%</p>}
            </div>
        </AppLayout>
    );
}
