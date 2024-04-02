'use client';

import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Database} from "@/types/supabase";
import AddFilesIcon from "@/app/projects/[id]/chat/addFilesIcon";
import {useState} from "react";

// import {useRef} from "react";

interface NewFilesProps {
    pageId: string;
    mode?: "icon" | "full";
}


export default function NewFiles({pageId, mode = "full"}: NewFilesProps) {
    const [state, setState] = useState("idle");

    const addFiles = async (formData: FormData) => {
        setState("loading")
        const title = String(formData.get("title")) as string | null;
        const description = String(formData.get("description")) as string | null;
        const file = formData.get("projectFile") as File | null;
        const supabase = createClientComponentClient<Database>();

        const {
            data: {user},
        } = await supabase.auth.getUser();

        if (user) {
            if (file?.name === undefined) {
                setState("upload failed")
                throw new Error("File not uploaded");
            } else {
                // console.log("user", user);
                // console.log("title", title);
                console.log("addFiles pageId", pageId);

                // get project id from url
                const random = Math.random().toString(36).substring(7);
                const filename = pageId + "/" + random + "_" + file?.name;
                // console.log("file", file);
                //
                setState("uploading")
                console.log("filename", filename);
                const a = await supabase.storage.from('files').upload(filename, file, {
                    cacheControl: '3600',
                    upsert: false,
                });
                console.log("a", a);

                if (a.error) {
                    setState("upload failed")
                    throw new Error("File not uploaded");
                } else {
                    setState("upload success")
                    // project_id, user_id, file_name, description, link, created_at, updated_at
                    const b = await supabase.from("files").insert({
                        project_id: Number(pageId),
                        user_id: user.id,
                        file_name: filename,
                        title: title,
                        description: description,
                        link: null,
                        type: file.type,
                        extension: file.name.split('.').pop(),
                    }).select();
                    console.log("b", b);

                    const fileId = b.data[0].file_id;
                    console.log("fileId", fileId);

                }
            }
        }
        setState("idle")

    };


    if (mode === "full") {
        return (
            <div>
                <form action={addFiles}
                      className="flex flex-col items-center justify-center p-5 rounded-lg bg-gray-100 shadow-md">
                    <input type="file" name="projectFile"
                           className="w-full p-2 rounded-md border border-gray-300 mb-2"/>
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
                        Add File
                    </button>
                </form>
            </div>
        );
    } else {
        return (
            <div>
                <AddFilesIcon pageId={pageId} onUploadSuccess={addFiles}/>
            </div>
        )
    }
}