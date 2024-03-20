'use client';

import React, {useState} from 'react';
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";


const fetchFeedbackData = async () => {
    const supabase = createClientComponentClient()
    const {data, error} = await supabase
        .from('feedback') // Assuming 'feedback' is your table name
        .select('*');

    if (error) {
        console.error('Error fetching feedback data:', error);
        return [];
    }

    return data;
};

const downloadJSON = (data, fileName) => {
    const jsonString = JSON.stringify(data, null, 2); // Pretty print JSON
    const blob = new Blob([jsonString], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


export default function ExportComponent() {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleExport = async () => {
        setIsDownloading(true);
        const data = await fetchFeedbackData();
        if (data.length > 0) {
            downloadJSON(data, 'feedback-data.json');
        } else {
            alert('No data to export.');
        }
        setIsDownloading(false);
    };

    return (
        <div>
            <button onClick={handleExport} disabled={isDownloading}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
                {isDownloading ? 'Exporting...' : 'Export Feedback'}
            </button>
        </div>
    );
}
