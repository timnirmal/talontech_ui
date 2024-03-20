import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Database} from "@/types/supabase";
import ApiKeysComponent from "@/app/settings/apikeys/ApiKeys";

export default async function Export() {
    // const supabase = createServerComponentClient({cookies});
    const supabase = createServerComponentClient<Database>({cookies})

    const {
        data: {user},
    } = await supabase.auth.getUser()

    return (
        <div>
            <ApiKeysComponent />
        </div>
    )
}
