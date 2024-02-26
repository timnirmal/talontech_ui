import type {Metadata} from "next";
import {Inter} from "next/font/google";
// import "./globals.css";
// import UserProvider from "@/app/context/username";
import {createServerComponentClient} from '@supabase/auth-helpers-nextjs';
import {cookies} from 'next/headers';


import '@/app/globals.css';
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({subsets: ["latin"]});

// do not cache this layout
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
};

export default async function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    const supabase = createServerComponentClient({cookies});

    const {
        data: {session},
    } = await supabase.auth.getSession();

    const {
        data: {user},
    } = await supabase.auth.getUser();

    return (
        <html lang="en">
        <body>
        {/*<NavBar />*/}
        {/*<div className="flex min-h-screen flex-col items-center justify-center py-2">*/}
        <div className="">
            <main
                // className="flex w-full flex-1 shrink-0 flex-col items-center justify-center px-8 text-center sm:px-20">
                className="">
                {/*{console.log("session", session)}*/}
                {/*<h1 className="mb-12 text-5xl font-bold sm:text-6xl">*/}
                {/*    Next.js with <span className="font-black text-green-400">Supabase</span>*/}
                {/*</h1>*/}
                <AuthProvider
                    accessToken={session?.access_token}
                    user={user}
                >
                    {children}
                </AuthProvider>
            </main>
        </div>
        </body>
        </html>
    );
}
