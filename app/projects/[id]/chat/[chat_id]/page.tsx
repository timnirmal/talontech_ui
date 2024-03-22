import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Database} from "@/types/supabase";
import ChatWindow from "@/app/projects/[id]/chat/[chat_id]/chatWindow";
import {ChatProvider} from "@/app/projects/[id]/chat/[chat_id]/ChatContext";

export default async function ChatWindowView({params}: { params: { id: string } }) {
    // const supabase = createServerComponentClient({cookies});
    const supabase = createServerComponentClient<Database>({cookies})

    const {
        data: {user},
    } = await supabase.auth.getUser()

    return (
        <div >
            <ChatProvider>
                <ChatWindow params={params}/>
            </ChatProvider>
        </div>
    )
}
