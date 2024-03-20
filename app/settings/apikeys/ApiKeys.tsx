'use client';

import React, {useEffect, useState} from 'react';
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";

type ApiKey = {
    id: string;
    key: string;
    service: string;
    enabled: boolean;
};

const services = ['Service 1', 'Service 2', 'Service 3']; // Example services

export default function ApiKeysComponent() {
    const supabase = createClientComponentClient()
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});

    const toggleShowKey = (id: string) => {
        setShowKey(prev => ({...prev, [id]: !prev[id]}));
    };

    const toggleEnable = async (id: string) => {
        const apiKeyToUpdate = apiKeys.find(apiKey => apiKey.id === id);
        if (!apiKeyToUpdate) return;

        const {data, error} = await supabase
            .from('api_keys')
            .update({enabled: !apiKeyToUpdate.enabled})
            .match({id});

        if (error) {
            console.error('Error updating API key:', error);
        } else {
            setApiKeys(apiKeys.map(key => key.id === id ? {...key, enabled: !key.enabled} : key));
        }
    };

    useEffect(() => {
        const fetchApiKeys = async () => {
            const {data, error} = await supabase
                .from('api_keys')
                .select('*');

            if (error) {
                console.error('Error fetching API keys:', error);
            } else {
                setApiKeys(data);
                // Initialize showKey state for each fetched key
                const initialShowKeyState = data.reduce((acc, curr) => ({
                    ...acc,
                    [curr.id]: false
                }), {});
                setShowKey(initialShowKeyState);
            }
        };

        fetchApiKeys();
    }
    , []);

    // Handle remove and edit logic here
    // ...

    return (
        <div className="space-y-4">
            {apiKeys.map(apiKey => (
                <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                        <div>Service: {apiKey.service}</div>
                        <div>API Key: {showKey[apiKey.id] ? apiKey.key : '••••••••'}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => toggleShowKey(apiKey.id)}
                                className="px-2 py-1 text-xs bg-gray-200 rounded">View
                        </button>
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input type="checkbox" className="sr-only" checked={apiKey.enabled}
                                       onChange={() => toggleEnable(apiKey.id)}/>
                                <div className="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
                                <div
                                    className={`absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition-transform ${apiKey.enabled ? 'transform translate-x-full' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-xs text-gray-700">{apiKey.enabled ? 'Enabled' : 'Disabled'}</div>
                        </label>
                        <button className="px-2 py-1 text-xs bg-red-200 rounded">Remove</button>
                        <button className="px-2 py-1 text-xs bg-blue-200 rounded">Edit</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
