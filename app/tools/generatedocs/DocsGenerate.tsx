'use client'

import React, {useEffect, useState} from 'react';
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";

// Assuming LLMProps defines the structure of an individual LLM object

interface LLMProps {
    llm_id: string;
    name: string;
    version: string;
}

async function fetchCategorization(text: string, model: string, categories: string[]) {
    const bodyData = {
        type,
        template,
        text,
        model,
        ...(categories.length > 0 && {schema: categories}) // Only include 'enum' if categories are provided
    };

    console.log('bodyData', bodyData);

    const response = await fetch('http://127.0.0.1:9000/extract_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    console.log('response', data); // Now 'data' contains the parsed JSON response body
    return data;
}

export default function DocsGenerate() {
    const supabase = createClientComponentClient<Database>();
    const [text, setText] = useState('');
    const [categories, setCategories] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [categorizationResult, setCategorizationResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [llmOptions, setLlmOptions] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const {data, error} = await supabase.from('llm').select();

            if (data && data.length > 0) {
                setLlmOptions(data);
                setSelectedModel(data[0].name); // Adjust as necessary
            } else {
                console.error("No LLM models found or error fetching models:", error);
            }

            setIsLoading(false);
        };

        fetchData();
    }, []);

    const handleCategorize = async () => {
        if (!text || !selectedModel) {
            alert('Please fill in all fields.');
            return;
        }

        console.log('Categorizing:', text, selectedModel, categories);
        const categoriesArray = categories.split(',').map(cat => cat.trim()).filter(cat => cat); // Prepare categories array from input

        try {
            setIsLoading(true);
            const result = await fetchCategorization(text, selectedModel, categoriesArray);
            setCategorizationResult(result); // Adjust according to your API response
        } catch (error) {
            console.error('Error fetching categorization:', error);
            alert('Failed to fetch categorization.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 px-8">
            <div>
                <h1 className="text-4xl mb-10 text-center font-bold">Docs Generate</h1>
                <input
                    type="text"
                    className="w-full p-2 mb-4 bg-gray-800 text-gray-300"
                    placeholder="Enter which type of document need to generate"
                    value={categories}
                    onChange={(e) => setCategories(e.target.value)}
                />
                <textarea
                    className="w-full p-2 mb-4 bg-gray-800 text-gray-300"
                    rows={10}
                    placeholder="Enter template of the document to be generated"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                <textarea
                    className="w-full p-2 mb-4 bg-gray-800 text-gray-300"
                    rows={10}
                    placeholder="Enter the content that must be included in the document"
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
                    onClick={handleCategorize}
                >
                    Generate
                </button>
            </div>
            {categorizationResult && (
                <div>
                    {categorizationResult.length > 0 && (
                        <div className="mt-4">
                            <h3 className="mb-2 text-xl">Categorization Results:</h3>
                            {categorizationResult.map((item, index) => (
                                <div key={index} className="mb-4">
                                    {Object.entries(item).map(([key, value]) => (
                                        <p key={key}>{key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.slice(1)}: {value || 'N/A'}</p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
