'use client';

import React, {useState} from "react";
import Design from "@/components/Create/Design";


const Edit = () => <div>Edit Component</div>;
const History = () => <div>History Component</div>;

const TabComponent = () => {
    // State to keep track of the selected tab
    const [activeTab, setActiveTab] = useState('Design');

    // Function to render the correct component based on the active tab
    const renderComponent = () => {
        switch (activeTab) {
            case 'Design':
                return <Design />;
            case 'Edit':
                return <Edit />;
            case 'History':
                return <History />;
            default:
                return null; // Or return a default component
        }
    };

    return (
        <div className="border-b-2">
            <div className="flex space-x-4 mb-4">
                {/* Update the active tab state onClick */}
                <button className={`px-4 py-2 rounded text-white ${activeTab === 'Design' ? 'bg-blue-600' : 'bg-gray-700'}`} onClick={() => setActiveTab('Design')}>Design</button>
                <button className={`px-4 py-2 rounded text-white ${activeTab === 'Edit' ? 'bg-blue-600' : 'bg-gray-700'}`} onClick={() => setActiveTab('Edit')}>Edit</button>
                <button className={`px-4 py-2 rounded text-white ${activeTab === 'History' ? 'bg-blue-600' : 'bg-gray-700'}`} onClick={() => setActiveTab('History')}>History</button>
            </div>
            {/* Render the component based on the active tab */}
            {renderComponent()}
            {/* Add more component tabs as needed */}
        </div>
    );
};

export default TabComponent;