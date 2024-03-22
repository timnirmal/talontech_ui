'use client'

import React, {useEffect, useState} from 'react';
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import Link from 'next/link'; // Importing Link component

// Assuming LLMProps defines the structure of an individual LLM object

interface LLMProps {
    llm_id: string;
    name: string;
    version: string;
}

async function fetchSummarization(text: string, model: string) {
    const response = await fetch('http://127.0.0.1:8000/summerize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({text, model}),
    });

    // Correctly waiting for the promise to resolve before logging or returning
    const data = await response.json();
    console.log('response', data); // Now 'data' contains the parsed JSON response body
    return data;
}

export default function Summerize() {
    const supabase = createClientComponentClient<Database>();
    const [text, setText] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [summarizationResult, setSummarizationResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [llmOptions, setLlmOptions] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const {data, error} = await supabase.from('llm_fixed').select();

            if (data && data.length > 0) {
                setLlmOptions(data);
                setSelectedModel(data[0].name); // Assuming 'id' is the correct identifier. Adjust if necessary.
            } else {
                console.error("No LLM models found or error fetching models:", error);
            }

            setIsLoading(false);
        };

        fetchData();
    }, []);

    const handleSummarize = async () => {
        console.log('selectedModel', selectedModel);
        console.log('text', text);
        if (!text || !selectedModel) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            setIsLoading(true); // Show loading indicator
            const result = await fetchSummarization(text, selectedModel);
            setSummarizationResult(result.summarized_text); // Assuming the API response has a 'summary' field
            console.log('result', summarizationResult);
        } catch (error) {
            console.error('Error fetching summarization:', error);
            alert('Failed to fetch summarization.');
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 px-8">
             <Link href="/projects/" passHref>
                <button className="bg-transparent hover:bg-red-500 text-red-500 hover:text-white font-bold py-2 px-4 rounded">
                    Back
                </button>
            </Link>
            <div>
                <h1 className="text-4xl mb-10 text-center font-bold">Summarize</h1>
                <textarea
                    className="w-full p-2 mb-4 bg-gray-800 text-gray-300"
                    rows={10}
                    placeholder="Enter text to summarize"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <select
                    className="w-full p-2 mb-4 bg-gray-800 text-gray-300"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                >
                    {llmOptions.map((option) => (
                        <option key={option.id} value={option.name}>
                            {option.name}
                        </option>
                    ))}
                </select>
                <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                    onClick={handleSummarize}
                >
                    Summarize
                </button>
            </div>
            {summarizationResult && (
                <div className="mt-4">
                    <h3 className="mb-2 text-xl text-white">Summarization Result:</h3>
                    <p className='text-white'>{summarizationResult}</p>
                </div>
            )}
        </div>
    );
}
