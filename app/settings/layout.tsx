'use client';

import Sidebar from "@/app/settings/sideBar";
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
        <div className="flex">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} activeProjectId={params.id}/>
            <div className="flex-1 bg-gray-100 overflow-auto" style={{ paddingLeft: '20%' }}>
                {children}
            </div>
        </div>
    )
}


