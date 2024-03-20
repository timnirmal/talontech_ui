'use client';

import Link from "next/link";
import SidebarChats from "@/app/projects/[id]/sideBarChats";
import NewChatButton from "@/app/projects/[id]/NewChatButton";
import {PersonalizationModal} from "@/app/projects/[id]/PersonalizationModal";
import {useState} from "react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import {cookies} from "next/headers";

const fetchFeedbackData = async () => {
    const supabase = createClientComponentClient<Database>()
    const {data, error} = await supabase
        .from('feedback') // Assuming 'feedback' is your table name
        .select('*');

    if (error) {
        console.error('Error fetching feedback data:', error);
        return [];
    }

    return data;
};

const Sidebar = ({isOpen, toggleSidebar, activeProjectId}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Toggle dropdown menu
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };


    console.log(activeProjectId);
    return (
        <div>
            <div
                className="fixed top-0 left-0 w-1/5 h-screen bg-gray-800 overflow-auto justify-between flex flex-col ">

                {/* Top section with icons */}
                <div className="flex flex-col items-start justify-start p-5 space-y-4 text-white">
                    <Link href={`/settings/export`} passHref>
                        <div className="flex items-center space-x-2 cursor-pointer">
                            {/*<div className="w-6 h-6 bg-gray-500"></div>*/}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                 className="w-6 h-6">
                                <path
                                    d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z"/>
                                <path
                                    d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z"/>
                            </svg>
                            <span>Export</span>
                        </div>
                    </Link>

                    <Link href={`/settings/apikeys`} passHref>
                        <div className="flex items-center space-x-2 cursor-pointer">
                            {/*<div className="w-6 h-6 bg-gray-500"></div>*/}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                 className="w-6 h-6">
                                <path
                                    d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z"/>
                                <path
                                    d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z"/>
                            </svg>
                            <span>Api Keys</span>
                        </div>
                    </Link>

                    {/*<div className="flex items-center space-x-2 cursor-pointer">*/}
                    {/*    /!*<div className="w-6 h-6 bg-gray-500"></div>*!/*/}
                    {/*    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"*/}
                    {/*         className="w-6 h-6">*/}
                    {/*        <path fillRule="evenodd"*/}
                    {/*              d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"*/}
                    {/*              clipRule="evenodd"/>*/}
                    {/*    </svg>*/}

                    {/*    <span>Search</span>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;