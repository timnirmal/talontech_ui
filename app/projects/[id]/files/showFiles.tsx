'use client';

import {useContext, useCallback, useEffect, useState} from "react";
import {AuthContext} from "@/components/AuthProvider";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import Link from "next/link";

export default function ShowFiles({params}: { params: { id: string } }) {
    const {accessToken} = useContext(AuthContext);
    const supabase = createClientComponentClient<Database>();
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);

    const getFileTypeImage = {
        "jpg": "/placeholders/jpg_placeholder.png",
        "png": "/placeholders/png_placeholder.png",
        "mp3": "/placeholders/mp3_placeholder.png",
        "mp4": "/placeholders/mp4_placeholder.png",
        "pdf": "/placeholders/pdf_placeholder.png",
        // Add more mappings as needed
    };

    const getFiles = useCallback(async () => {
        try {
            setLoading(true);
            const {data: metaData, error: metaError, status} = await supabase
                .from('files')
                .select()
                .eq('project_id', params.id);

            if (metaError && status !== 406) {
                throw metaError;
            }

            if (metaData) {
                const existingFiles = [];
                for (const file of metaData) {
                    try {
                        if (file.type.startsWith('image')) {
                            const {data: downloadData, error: downloadError} = await supabase
                                .storage
                                .from('files')
                                .download(file.file_name);

                            if (downloadError) {
                                console.error(`Error downloading file: ${file.file_name}`, downloadError.message);
                                alert(`File missing: ${file.file_name}`);
                                continue; // Skip this file and continue with the next
                            }

                            // Assuming you only need the file metadata in the state
                            // since the actual file content (blob) handling/displaying might depend on your specific case
                            if (downloadData) {
                                const { data } = supabase.storage.from('files').getPublicUrl(file.file_name)
                                existingFiles.push({...file, previewUrl: data.publicUrl});
                            }
                        } else {
                            existingFiles.push(file);
                        }
                    } catch (error) {
                        console.error(`Error downloading file: ${file.file_name}`, error.message);
                        alert(`File missing: ${file.file_name}`);
                    }
                }
                setFiles(existingFiles);
            }
        } catch (error) {
            console.error('Error loading files:', error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [params.id, supabase]);

    useEffect(() => {
        getFiles();
    }, [getFiles]);

    if (loading) return <p>Loading files...</p>;
    if (error) return <p>Error: {error}</p>;

    console.log(files);

    return (
        <div>
            <h1>Files</h1>
            <div className="flex flex-wrap -mx-4">
                {files.map((file) => {
                        const isImage = file.type.startsWith('image');
                        const placeholderImage = getFileTypeImage[file.extension] || '/placeholders/default_placeholder.png';

                        return (
                            <div key={file.file_id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4">
                                <Link href={`/files/${file.project_id}`} passHref>
                                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                                        <div className="p-5">
                                            {
                                                isImage ? (
                                                    // Use the Object URL for the image preview
                                                    <img src={file.previewUrl || placeholderImage} alt={file.title} className="mb-2" />
                                                ) : (
                                                    // For non-image files, show the placeholder
                                                    <img src={placeholderImage} alt={file.title} className="mb-2" />
                                                )
                                            }
                                            <h5 className="text-lg font-bold mb-2">{file.file_name}</h5>
                                            <p className="text-gray-700 text-base">{file.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )
                    }
                )
                }
            </div>
        </div>
    );
}
