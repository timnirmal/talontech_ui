const Sidebar = () => {
    return (
        <div className="w-1/4 bg-gray-800 text-white flex flex-col">
            {/* Top section with icons */}
            <div className="flex flex-col items-start justify-start p-5 space-y-4">
                <div className="flex items-center space-x-2 cursor-pointer">
                    {/* Replace "div" with your actual icon component */}
                    <div className="w-6 h-6 bg-gray-500"></div>
                    <span>New Chat</span>
                </div>
                <div className="flex items-center space-x-2 cursor-pointer">
                    <div className="w-6 h-6 bg-gray-500"></div>
                    <span>Manage Files</span>
                </div>
                <div className="flex items-center space-x-2 cursor-pointer">
                    <div className="w-6 h-6 bg-gray-500"></div>
                    <span>Search</span>
                </div>
            </div>

            {/* Middle section for chat list */}
            <div className="flex-1 overflow-auto">
                <ul className="p-2">
                    {/* Placeholder for chat list items */}
                    <li className="p-2 hover:bg-gray-700 cursor-pointer">Chat 1</li>
                    <li className="p-2 hover:bg-gray-700 cursor-pointer">Chat 2</li>
                    {/* More chat items */}
                </ul>
            </div>

            {/* Bottom section with settings */}
            <div className="p-5 mt-auto">
                <div className="flex items-center space-x-2 cursor-pointer">
                    <div className="w-6 h-6 bg-gray-500"></div>
                    <span>Settings</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;