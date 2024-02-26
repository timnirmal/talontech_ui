import Image from "next/image";

export default function Design() {
    return (
        <div className="bg-gray-800 text-white p-4" style={{width: '100%'}}>
            {/* Tabs */}


            {/* Modal Selector */}
            <div className="mb-4">
                <div className="bg-blue-500 p-2 rounded">
                    <p>Stable Diffusion</p>
                    {/* Modal image here */}
                </div>
            </div>

            {/* Image Upload Section */}
            <div className="mb-4">
                <h3 className="text-lg mb-2">Images</h3>
                <div className="p-4 bg-gray-700 rounded flex items-center justify-center">
                    <button className="bg-blue-600 px-4 py-2 rounded">
                        Reference Images
                    </button>
                </div>
                <div className="bg-gray-700 rounded mt-2 flex items-center justify-center">
                    <button className="">
                        {/*Upload your image*/}
                        {/*<Image*/}
                        {/*    src="/upload_placeholder.png"*/}
                        {/*    alt="Upload your image"*/}
                        {/*    width={300}*/}
                        {/*    height={200}*/}
                        {/*/>*/}
                    </button>
                </div>
            </div>

            {/* Effects Section */}
            <div className="mb-4">
                <h3 className="text-lg mb-2">Effect</h3>
                {/* Filter Tabs */}
                <div className="flex space-x-2 mb-4">
                    <button className="bg-blue-600 px-4 py-2 rounded">All</button>
                    <button className="bg-gray-700 px-4 py-2 rounded">Popular</button>
                    {/* ... other filter tabs */}
                </div>
                {/* Effects Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Each grid item */}
                    <div className="bg-gray-700 p-2 rounded flex flex-col items-center">
                        {/*<img src="/effect-bokeh.png" alt="Bokeh effect" className="mb-2"/>*/}
                        {/*<Image*/}
                        {/*    src="/bokeh.png"*/}
                        {/*    alt="Upload your image"*/}
                        {/*    width={300}*/}
                        {/*    height={200}*/}
                        {/*/>*/}
                        <span className="text-sm">Bokeh effect</span>
                    </div>
                    <div className="bg-gray-700 p-2 rounded flex flex-col items-center">
                        {/*<img src="/effect-layered-paper.png" alt="Layered paper" className="mb-2"/>*/}
                        {/*<Image*/}
                        {/*    src="/layered.png"*/}
                        {/*    alt="Upload your image"*/}
                        {/*    width={300}*/}
                        {/*    height={200}*/}
                        {/*/>*/}
                        <span className="text-sm">Layered paper</span>
                    </div>
                    {/* ... more grid items */}
                </div>
            </div>
        </div>

    );
}