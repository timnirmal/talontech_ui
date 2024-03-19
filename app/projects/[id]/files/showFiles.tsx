'use client';

import {useContext, useCallback, useEffect, useState} from "react";
import {AuthContext} from "@/components/AuthProvider";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";

export default function ShowFiles({params}: { params: { id: string } }) {
    const {accessToken} = useContext(AuthContext);
    const supabase = createClientComponentClient<Database>();
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [isEditingFileName, setIsEditingFileName] = useState(false);
    const [editedFileName, setEditedFileName] = useState("");
    const [notFoundFiles, setNotFoundFiles] = useState([]);

    // Function to open the modal with the selected file's details
    const openModal = (file) => {
        setCurrentFile(file);
        setIsModalOpen(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentFile(null); // Reset current file
    };

    const getFileTypeImage = {
        "jpg": "/file_placeholders/jpg_placeholder.png",
        "png": "/file_placeholders/png_placeholder.png",
        "mp3": "/file_placeholders/mp3_placeholder.png",
        "mp4": "/file_placeholders/default_file.png",
        "pdf": "/file_placeholders/pdf_placeholder.png",
        "docx": "/file_placeholders/docx_placeholder.png", // Add placeholders for other types as needed
        "default": "/file_placeholders/default_file.png",
    };

    const getPreviewContent = (file) => {
        if (file.type.startsWith('image')) {
            return <img src={file.previewUrl || getFileTypeImage['default']} alt="File preview" className="mb-2 max-w-full h-auto rounded"/>;
        } else if (file.type === 'application/pdf') {
            // Here you can return a PDF viewer component or a PDF icon
            return <img src={getFileTypeImage['pdf']} alt="PDF preview" className="mb-2 max-w-full h-auto rounded"/>;
        } else if (file.type.startsWith('video')) {
            // Here you can return a video player component or a video icon
            return <img src={getFileTypeImage['mp4']} alt="Video preview" className="mb-2 max-w-full h-auto rounded"/>;
        }
        // Add more conditions for other file types as needed
        else {
            // Default placeholder for unsupported types
            return <img src={getFileTypeImage['default']} alt="File preview" className="mb-2 max-w-full h-auto rounded"/>;
        }
    };

    const deleteFile = async (fileId, fileName, e) => {
        e.stopPropagation(); // Prevent modal from opening

        try {
            setLoading(true);

            const {error: deleteError} = await supabase.storage.from('files').remove([fileName]);
            if (deleteError) throw deleteError;

            const {error: dbError} = await supabase.from('files').delete().match({file_id: fileId});
            if (dbError) throw dbError;

            getFiles(); // Refresh the files list
        } catch (error) {
            console.error('Error deleting file:', error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const renameFileInStorage = async (oldFileName, newFileName) => {
        try {
            // Download the old file
            const {data: oldFile, error: downloadError} = await supabase.storage.from('files').download(oldFileName);
            if (downloadError) throw downloadError;

            // Create a new file with the new name and the content of the old file
            const {error: uploadError} = await supabase.storage.from('files').upload(newFileName, oldFile);
            if (uploadError) throw uploadError;

            // Delete the old file
            const {error: deleteError} = await supabase.storage.from('files').remove([oldFileName]);
            if (deleteError) throw deleteError;

            return true;
        } catch (error) {
            console.error('Error renaming file in storage:', error.message);
            return false;
        }
    };


    const editFileName = async (newFileName) => {
        if (!currentFile || !newFileName || newFileName === currentFile.file_name) return;

        setLoading(true);

        const renameSuccess = await renameFileInStorage(currentFile.file_name, newFileName);
        if (!renameSuccess) {
            setError('Failed to rename file in storage.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const {error} = await supabase
                .from('files')
                .update({file_name: newFileName})
                .match({file_id: currentFile.file_id});

            if (error) throw error;

            // Successfully updated
            const updatedFiles = files.map(file =>
                file.file_id === currentFile.file_id ? {...file, file_name: newFileName} : file
            );
            setFiles(updatedFiles);
            setCurrentFile({...currentFile, file_name: newFileName}); // Update modal view

            // closeModal(); // Optionally close modal after editing
        } catch (error) {
            console.error('Error updating file name:', error.message);
            setError(error.message);
        } finally {
            setLoading(false);
            setIsEditingFileName(false); // Ensure to exit editing mode
        }
    };


    const getFiles = useCallback(async () => {
        try {
            setLoading(true);
            const {data: metaData, error: metaError} = await supabase
                .from('files')
                .select()
                .eq('project_id', params.id);

            if (metaError) throw metaError;

            const filePreviews = metaData.map(file => ({
                ...file,
                previewUrl: file.type.startsWith('image') ?
                    supabase.storage.from('files').getPublicUrl(file.file_name).data.publicUrl :
                    getFileTypeImage[file.extension] || getFileTypeImage["default"]
            }));

            setFiles(filePreviews);
        } catch (error) {
            console.error('Error loading files:', error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    // const handleImageError = (fileId) => {
    //     setFiles(currentFiles => currentFiles.filter(file => file.file_id !== fileId));
    // };

    useEffect(() => {
        getFiles();
    }, [getFiles]);

    if (loading) return <p>Loading files...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h1>Files</h1>
            <div className="flex flex-wrap -mx-4">
                {files.map((file) => (
                    <div key={file.file_id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4"
                         onClick={() => {
                             setCurrentFile(file);
                             setIsModalOpen(true);
                         }}>
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="p-5">
                                <img
                                    src={file.previewUrl || getFileTypeImage['default']}
                                    alt="File preview"
                                    className="mb-2 max-w-full h-auto rounded"
                                    // onError={() => handleImageError(file.file_id)}
                                />
                                <h5 className="text-lg font-bold mb-2">{file.file_name}</h5>
                                <p className="text-gray-700 text-base mb-2">{file.description}</p>
                                {/* Prevent event propagation to avoid opening modal when clicking the delete button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteFile(file.file_id, file.file_name, e);
                                    }}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {notFoundFiles.length > 0 && (
                <div className="text-red-500">
                    <p>The following files could not be found:</p>
                    <ul>
                        {notFoundFiles.map((fileName) => (
                            <li key={fileName}>{fileName}</li>
                        ))}
                    </ul>
                </div>
            )}

            {isModalOpen && currentFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg flex max-h-[80%] max-w-[90%] overflow-auto"
                         style={{width: '80%'}}>
                        <div className="flex-1 border-r-2 pr-4">
                            <h2 className="text-2xl font-bold mb-4">File Details</h2>
                            <div className="mb-3 flex items-center justify-between">
                                {isEditingFileName ? (
                                    <>
                                        <div className="flex-grow">
                                            <input
                                                id="fileName"
                                                type="text"
                                                value={editedFileName}
                                                onChange={(e) => setEditedFileName(e.target.value)}
                                                className="border p-1 w-full"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                editFileName(editedFileName);
                                                setIsEditingFileName(false);
                                            }}
                                            className="ml-2 py-2 px-4 rounded flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 strokeWidth={1.5} stroke="currentColor"
                                                 className="w-6 h-6 ml-2 text-green-500 hover:text-green-700 outline-green-600">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      d="m4.5 12.75 6 6 9-13.5"/>
                                            </svg>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-grow">
                                            <p className="mb-2"><strong>Name:</strong> {currentFile.file_name}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsEditingFileName(true);
                                                setEditedFileName(currentFile.file_name); // Initialize input with current name
                                            }}
                                            className="flex items-center"
                                        >

                                        </button>
                                    </>
                                )}
                            </div>
                            <p className="mb-2"><strong>Description:</strong> {currentFile.description}</p>
                            {/* Include other file details here */}
                        </div>
                        <div className="flex-1 pl-4">
                            <h2 className="text-2xl font-bold mb-4">Extracted Information</h2>
                            {/* Render additional component or extracted information here */}
                            <p>Place content here that relates to the file, such as extracted text, metadata, or
                                analysis results.</p>
                        </div>
                    </div>
                    <button onClick={closeModal}
                            className="absolute top-0 right-0 mt-2 mr-2 bg-gray-100 hover:bg-gray-200 text-black font-bold py-2 px-4 rounded-full">
                        X
                    </button>
                </div>
            )}

            {isModalOpen && currentFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg flex max-h-[80%] max-w-[90%] overflow-auto"
                         style={{width: '80%'}}>
                        <div className="flex-1 border-r-2 pr-4">
                            <h2 className="text-2xl font-bold mb-4">File Details</h2>
                            <div className="mb-4">
                                <img
                                    src={currentFile.previewUrl || getFileTypeImage['default']}
                                    alt="File preview"
                                    className="mb-2 max-w-full h-auto rounded"
                                />
                            </div>
                            <div className="mb-3 flex items-center justify-between">
                                {isEditingFileName ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editedFileName}
                                            onChange={(e) => setEditedFileName(e.target.value)}
                                            className="border p-1 w-full"
                                        />
                                        <button
                                            onClick={() => editFileName(editedFileName)}
                                            className="ml-2 py-2 px-4 rounded flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 strokeWidth={1.5} stroke="currentColor"
                                                 className="w-6 h-6 ml-2 text-green-500 hover:text-green-700 outline-green-600">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      d="m4.5 12.75 6 6 9-13.5"/>
                                            </svg>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Name:</strong> {currentFile.file_name}</p>
                                        <button
                                            onClick={() => {
                                                setIsEditingFileName(true);
                                                setEditedFileName(currentFile.file_name);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 strokeWidth={1.5} stroke="currentColor"
                                                 className="w-6 h-6 ml-2 text-blue-300 hover:text-blue-500 mr-2">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                            <p><strong>Description:</strong> {currentFile.description}</p>
                            {/* Other file details you want to include */}
                        </div>
                        <div className="flex-1 pl-4">
                            {/* Any other information you want to display on the right side of the modal */}
                        </div>
                    </div>
                    <button onClick={closeModal}
                            className="absolute top-0 right-0 mt-2 mr-2 bg-gray-100 hover:bg-gray-200 text-black font-bold py-2 px-4 rounded-full">
                        X
                    </button>
                </div>
            )}

        </div>
    );
}
