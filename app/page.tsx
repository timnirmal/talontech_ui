import {createServerComponentClient} from '@supabase/auth-helpers-nextjs';
import {cookies} from 'next/headers';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import SignOut from "@/components/SignOut";
import Image from 'next/image';

const cards = [
    // Example card data
    // { id: 1, title: 'Create', imageUrl: '/text_to_image.png', link: '/create' },
    { id: 2, title: 'Profile', imageUrl: '/profile_page_image.png', link: '/profile' },
    { id: 3, title: 'Projects', imageUrl: '/profile_page_image.png', link: '/projects' },
    // Add more cards as needed
];

export default async function Home() {
    const supabase = createServerComponentClient({cookies});

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/sign-in');
    }


    const { data, error } = await supabase
        .from('projects')
        .insert([
            { some_column: 'someValue', other_column: 'otherValue' },
        ])
        .select()


    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 p-8">
            <div className="bg-gray-800 shadow-lg rounded-lg p-6 pt-16 text-gray-300">
                <h2 className="text-3xl font-semibold text-center">Projects</h2>
                <div className="bg-gray-900 text-gray-300 min-h-screen p-8 mt-10">
                    <div className="flex flex-wrap -mx-4">
                        {cards.map((card) => (
                            <div key={card.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4 mb-8">
                                <Link href={card.link} className="block bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                                        <div className="relative h-48 w-full">
                                            <Image src={card.imageUrl} alt={card.title} layout="fill"/>
                                            <p>sdsdsdsdsds</p>
                                        </div>
                                        <div className="p-4">
                                            <h5 className="text-lg font-semibold">{card.title}</h5>
                                        </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
