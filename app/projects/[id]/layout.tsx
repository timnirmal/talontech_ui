'use client';

import Sidebar from "@/app/projects/[id]/sideBar";
import React, {useState} from "react";

interface ChatWindowsLayoutProps {
    children: React.ReactNode;
    params: { id: string }; // Adding `params` to the component props
}

export default function ChatWindowsLayout({children, params}: ChatWindowsLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to manage sidebar visibility

    // Function to toggle sidebar visibility
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} activeProjectId={params.id}/>
            <div className="w-3/4 bg-gray-100">
                {children}
            </div>
        </div>
    )
}


