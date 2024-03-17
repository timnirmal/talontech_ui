import {createServerComponentClient} from '@supabase/auth-helpers-nextjs';
import {cookies} from 'next/headers';

import {redirect} from 'next/navigation';
import DataExtract from "@/app/tools/extractdata/DataExtract";


export default async function DataExtracting() {
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
            <DataExtract/>
        </div>
    );
}
