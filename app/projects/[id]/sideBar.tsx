import Link from "next/link";
import SidebarChats from "@/app/projects/[id]/sideBarChats";

const Sidebar = ({isOpen, toggleSidebar, activeProjectId}) => {
    console.log(activeProjectId);
    return (
        <div className="w-1/4 bg-gray-800 text-white flex flex-col">
            {/* Top section with icons */}
            <div className="flex flex-col items-start justify-start p-5 space-y-4">
                <Link href={`/projects/${activeProjectId}/chat`} passHref>
                <div className="flex items-center space-x-2 cursor-pointer">
                    {/* Replace "div" with your actual icon component */}
                    {/*<div className="w-6 h-6 bg-gray-500"></div>*/}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                         className="icon-md">
                        <path fillRule="evenodd" clipRule="evenodd"
                              d="M16.7929 2.79289C18.0118 1.57394 19.9882 1.57394 21.2071 2.79289C22.4261 4.01184 22.4261 5.98815 21.2071 7.20711L12.7071 15.7071C12.5196 15.8946 12.2652 16 12 16H9C8.44772 16 8 15.5523 8 15V12C8 11.7348 8.10536 11.4804 8.29289 11.2929L16.7929 2.79289ZM19.7929 4.20711C19.355 3.7692 18.645 3.7692 18.2071 4.2071L10 12.4142V14H11.5858L19.7929 5.79289C20.2308 5.35499 20.2308 4.64501 19.7929 4.20711ZM6 5C5.44772 5 5 5.44771 5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V14C19 13.4477 19.4477 13 20 13C20.5523 13 21 13.4477 21 14V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6C3 4.34314 4.34315 3 6 3H10C10.5523 3 11 3.44771 11 4C11 4.55228 10.5523 5 10 5H6Z"
                              fill="currentColor" data-darkreader-inline-fill=""
                              // style="--darkreader-inline-fill: currentColor;"
                        >
                        </path>
                    </svg>
                    <span>New Chat</span>
                </div>
                </Link>

                <Link href={`/projects/${activeProjectId}/files`} passHref>
                <div className="flex items-center space-x-2 cursor-pointer">
                    {/*<div className="w-6 h-6 bg-gray-500"></div>*/}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path
                            d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z"/>
                        <path
                            d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z"/>
                    </svg>
                    <span>Manage Files</span>
                </div>
                </Link>

                <div className="flex items-center space-x-2 cursor-pointer">
                    {/*<div className="w-6 h-6 bg-gray-500"></div>*/}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd"
                              d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                              clipRule="evenodd"/>
                    </svg>

                    <span>Search</span>
                </div>
            </div>

            {/* Middle section for chat list */}
            <div className="flex-1 overflow-auto">
                {/*<ul className="p-2">*/}
                {/*    /!* Placeholder for chat list items *!/*/}
                {/*    <li className="p-2 hover:bg-gray-700 cursor-pointer">Chat 1</li>*/}
                {/*    <li className="p-2 hover:bg-gray-700 cursor-pointer">Chat 2</li>*/}
                {/*</ul>*/}
                <SidebarChats activeProjectId={activeProjectId}/>
            </div>

            {/* Bottom section with settings */}
            <div className="p-5 mt-auto">
                <div className="flex items-center space-x-2 cursor-pointer">
                    {/*<div className="w-6 h-6 bg-gray-500"></div>*/}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd"
                              d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                              clipRule="evenodd"/>
                    </svg>
                    <span>Settings</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;