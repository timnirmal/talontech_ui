import {createServerActionClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Database} from "@/types/supabase";

export default function NewProject() {
    const addTweet = async (formData: FormData) => {
        "use server";
        const title = String(formData.get("title"));
        const description = String(formData.get("description"));
        const supabase = createServerActionClient<Database>({cookies});
        const {
            data: {user},
        } = await supabase.auth.getUser();

        if (user) {
            // console.log("user", user);
            // console.log("title", title);
            const a = await supabase.from("projects").insert({name: title, description: description}).select();
            if (a.data?.[0].id === undefined) {
                throw new Error("Project not created");
            } else {
                console.log("a", a.data?.[0].id);
                const b = await supabase.from("user_projects").insert({
                    user_id: user.id,
                    project_id: a.data?.[0].id,
                    role: "owner"
                }).select();
                console.log("b", b);
                // const project_id = a.data?.[0].id;
                // convert project_id to string
                // const project_id_string = project_id.toString();
                // const {data, error} = await supabase.storage.createBucket(project_id_string,
                //     {
                //         public: true,
                //     }
                // )
                // if (error) {
                //     console.log("error", error);
                // } else {
                //     console.log("data", data);
                // }
            }
        }
    };

    const demoTweet = async (formData: FormData) => {
        "use server";
        const title = String(formData.get("title"));
        console.log("title", title);
    };

    return (
        <form action={addTweet} className="flex flex-col items-center justify-center p-5 rounded-lg bg-gray-800 shadow-md">
            <div className="flex flex-col mb-4 w-full">
                <label for="title" className="text-sm text-white font-semibold text-gray-800 mb-1">Title:</label>
                <input type="text" id="title" name="title" className="w-full p-2 rounded-md border border-gray-300 mb-2 text-lg focus:outline-none focus:border-blue-500"/>
            </div>
        
            <div className="flex flex-col mb-4 w-full">
                <label for="description" className="text-sm  text-white font-semibold text-gray-800 mb-1">Description:</label>
                <textarea id="description" name="description" className="w-full p-2 rounded-md border border-gray-300 mb-2 text-lg h-32 resize-none focus:outline-none focus:border-blue-500"></textarea>
            </div>
        
            <button type="submit" class="bg-gray-500 hover:bg-green-500 text-white p-2 rounded-md">
                Add Project
            </button>

        </form>
        

    );
}