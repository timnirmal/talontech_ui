'use client';

import {useEffect, useState} from 'react';
import {createClientComponentClient} from '@supabase/auth-helpers-nextjs';
import Link from "next/link";

const NavBar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userProfileImageUrl, setUserProfileImageUrl] = useState(''); // Assuming you have a way to get this
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchSession = async () => {
            const {
                data: {session},
            } = await supabase.auth.getSession();

            setIsLoggedIn(!!session);

            if (session) {
                const {
                    data: {user},
                } = await supabase.auth.getUser();

                console.log(user);

                setUserEmail(user.email);
            }
        };

        fetchSession();
    }, []);

    return (
        <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
                {/* Company Logo */}
                <div className="flex items-center">
                    <img src="mas_logo.png" alt="Company Logo" className="h-8 w-auto"/>
                </div>


                {/* Profile Viewing Button */}
                {isLoggedIn && (
                    <div>
                        <Link href="/profile">
                            <button
                                className="flex items-center space-x-2 bg-gray-200 text-gray-800 py-2 px-4 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                                <img src={userProfileImageUrl || 'profile_image.png'} alt="Profile"
                                     className="h-6 w-6 rounded-full"/>
                                <span>{userEmail}</span>
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;

