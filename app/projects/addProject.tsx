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
        <form action={addTweet}
              className="flex flex-col items-center justify-center p-5 rounded-lg bg-gray-100 shadow-md">
            <input name="title" className="w-full p-2 rounded-md border border-gray-300 mb-2 text-lg"/>
            <input name="description" className="w-full p-2 rounded-md border border-gray-300 mb-2 text-lg"/>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
                Add Project
            </button>
        </form>
    );
}