import {createServerComponentClient} from '@supabase/auth-helpers-nextjs';
import {cookies} from 'next/headers';

import {redirect} from 'next/navigation';
import Categorize from "@/app/tools/categorize/Categorize";



export default async function Categorizing() {
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
            <Categorize />
        </div>
    );
}
