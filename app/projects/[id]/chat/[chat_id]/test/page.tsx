import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import RealTimeM from "@/app/projects/[id]/chat/[chat_id]/test/RealTimeM";

export const revalidate = 0;

export default async function Posts() {
    const supabase = createClientComponentClient<Database>();
    const {data, error} = await supabase
        .from('chat_message')
        .select()
    console.log("data", data);

    return (
        <div className="text-sm">
            <RealTimeM ServerPosts={data ?? []}/>
        </div>
    );
}