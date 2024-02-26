import {createServerActionClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Database} from "@/types/supabase";

export default function NewFiles({pageId}: { pageId: string }) {
    const addFiles = async (formData: FormData) => {
        "use server";
        const title = String(formData.get("title")) as string | null;
        const description = String(formData.get("description")) as string | null;
        const file = formData.get("projectFile") as File | null;
        const supabase = createServerActionClient<Database>({cookies});

        const {
            data: {user},
        } = await supabase.auth.getUser();

        if (user) {
            if (file?.name === undefined) {
                throw new Error("File not uploaded");
            } else {
                // console.log("user", user);
                // console.log("title", title);

                // get project id from url
                const random = Math.random().toString(36).substring(7);
                const filename = pageId + "/" + random + "_" + file?.name;
                // console.log("file", file);
                //
                console.log("filename", filename);
                const a = await supabase.storage.from('files').upload(filename, file, {
                    cacheControl: '3600',
                    upsert: false,
                });
                console.log("a", a);

                if (a.error) {
                    throw new Error("File not uploaded");
                } else {

                    // project_id, user_id, file_name, description, link, created_at, updated_at
                    const b = await supabase.from("files").insert({
                        project_id: Number(pageId),
                        user_id: user.id,
                        file_name: filename,
                        title: title,
                        description: description,
                        link: null,
                    }).select();
                    console.log("b", b);
                }
            }
        }

    };

    const demoTweet = async (formData: FormData) => {
        "use server";
        const title = String(formData.get("title"));
        console.log("title", title);
    };

    return (
        <form action={addFiles}
              className="flex flex-col items-center justify-center p-5 rounded-lg bg-gray-100 shadow-md">
            <input type="file" name="projectFile" className="w-full p-2 rounded-md border border-gray-300 mb-2"/>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
                Add Project
            </button>
        </form>
    );
}