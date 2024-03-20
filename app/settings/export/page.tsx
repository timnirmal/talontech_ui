import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Database} from "@/types/supabase";
import ExportComponent from "@/app/settings/export/Export";

export default async function Export() {
    // const supabase = createServerComponentClient({cookies});
    const supabase = createServerComponentClient<Database>({cookies})

    const {
        data: {user},
    } = await supabase.auth.getUser()

    return (
        <div>
            <ExportComponent/>
        </div>
    )
}
