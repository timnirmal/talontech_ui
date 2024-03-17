import {createServerComponentClient} from '@supabase/auth-helpers-nextjs';
import {cookies} from 'next/headers';

import {redirect} from 'next/navigation';
import Summerize from "@/app/tools/summarize/Summerize";


export default async function Summarize() {
    const supabase = createServerComponentClient({cookies});

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/sign-in');
    }


    // const {data, error} = await supabase
    //     .from('projects')
    //     .insert([
    //         {some_column: 'someValue', other_column: 'otherValue'},
    //     ])
    //     .select()


    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 p-8">
            <Summerize />
        </div>
    );
}
