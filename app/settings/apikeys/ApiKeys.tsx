'use client';

import React, {useEffect, useState} from 'react';
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {AuthContext} from "@/components/AuthProvider";

const CryptoJS = require('crypto-js');
var Base64 = require("js-base64");

const SECRET_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// https://stackoverflow.com/questions/11567290/cryptojs-and-pycrypto-working-together#:~:text=Report%20this%20ad-,0,AES.js,-var%20CryptoJS%20%3D

type ApiKey = {
    id: string;
    api_key: string;
    service: string;
    enabled: boolean;
};

const services = ['OpenAI', 'Claude', 'Pinecone', 'test']; // Example services

const secret = "V1VWTVRFOVhJRk5WUWsxQlVrbE9SUT09LFRrOUNUMFJaSUZkSlRFd2dTMDVQVnc9PQ=="

function encrypt(str, secret) {
    str = Math.random().toString(36).substring(2, 10) + str;
    var _strkey = Base64.decode(secret);
    _strkey.split(",");
    var text = CryptoJS.enc.Utf8.parse(str);
    var Key = CryptoJS.enc.Base64.parse(_strkey.split(",")[1]); //secret key
    var IV = CryptoJS.enc.Base64.parse(_strkey.split(",")[0]); //16 digit
    var encryptedText = CryptoJS.AES.encrypt(text, Key, {
        keySize: 128 / 8,
        iv: IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    var b64 = encryptedText.toString();
    var e64 = CryptoJS.enc.Base64.parse(b64);
    var eHex = e64.toLocaleString(CryptoJS.enc.Hex);
    return eHex.toUpperCase();
}

const encryptApiKey = (apiKey) => {
    const encrypted = encrypt(apiKey, secret);
    console.log("encrypted", encrypted);
    return encrypted;
};

const decryptApiKey = (cipherText) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

export default function ApiKeysComponent() {
    const supabase = createClientComponentClient()
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
    const [triggerFetch, setTriggerFetch] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);

    // State for adding a new API key
    const [newApiKey, setNewApiKey] = useState('');
    const [newService, setNewService] = useState(services[0] || '');
    const [newEnabled, setNewEnabled] = useState(true);

    // State for editing an existing API key
    const [editApiKey, setEditApiKey] = useState('');
    const [editService, setEditService] = useState('');
    const [editEnabled, setEditEnabled] = useState(false);

    const {accessToken, user} = React.useContext(AuthContext);
    const userId = user?.id;

    const toggleShowKey = (id: string) => {
        setShowKey(prev => ({...prev, [id]: !prev[id]}));
    };

    const fetchApiKeys = async () => {
        const {data, error} = await supabase.from('api_keys').select('*');
        if (error) {
            console.error('Error fetching API keys:', error);
        } else {
            const decryptedData = data.map(item => ({
                ...item,
                api_key: decryptApiKey(item.api_key) // Decrypt API key
            }));
            setApiKeys(decryptedData);
        }
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newApiKey || !newService) {
            alert('Please fill in all fields.');
            return;
        }
        const encryptedApiKey = encryptApiKey(newApiKey);
        const {data, error} = await supabase.from('api_keys').insert([
            {user_id: userId, api_key: encryptedApiKey, service: newService, enabled: newEnabled}
        ]);

        if (error) {
            console.error('Error adding new API key:', error);
            alert('Failed to add new API key.');
        } else {
            // Assuming the insert was successful, toggle the trigger to re-fetch data
            setTriggerFetch(f => !f); // Toggle to trigger re-fetch
            // Reset form fields
            setNewApiKey('');
            setNewService(services[0] || '');
            setNewEnabled(true);

        }
    };

    const handleDelete = async (id: string) => {
        const {error} = await supabase.from('api_keys').delete().match({id});

        if (error) {
            console.error('Error deleting API key:', error);
            alert('Failed to delete API key.');
        } else {
            // Option 1: Re-fetch API keys
            setTriggerFetch(f => !f);
            // Option 2: Filter out the deleted key directly from state (uncomment to use this instead)
            // setApiKeys(apiKeys.filter(key => key.id !== id));
        }
    };

    const handleSaveEdit = async () => {
        if (editingId) {
            const {error} = await supabase
                .from('api_keys')
                .update({api_key: editApiKey, service: editService, enabled: editEnabled})
                .match({id: editingId});

            if (error) {
                console.error('Error updating API key:', error);
                alert('Failed to update API key.');
            } else {
                // Reset and trigger re-fetch
                setEditingId(null);
                setEditApiKey('');
                setEditService('');
                setEditEnabled(false);
                setTriggerFetch(f => !f);
            }
        }
    };

    const startEdit = (apiKey: ApiKey) => {
        setEditingId(apiKey.id);
        setNewApiKey(apiKey.api_key);
        setNewService(apiKey.service);
        setNewEnabled(apiKey.enabled);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        // Reset edit state
        setEditApiKey('');
        setEditService('');
        setEditEnabled(false);
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

    useEffect(() => {
        fetchApiKeys();
    }, [triggerFetch]);


    return (
        <div className="space-y-4">
            <div className="my-4">
                <h3 className="text-lg font-semibold">Add New API Key</h3>
                <div className="flex flex-col space-y-2">
                    <input
                        type="text"
                        placeholder="API Key"
                        className="border p-2"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                    />
                    <select
                        className="border p-2"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                    >
                        {services.map(service => (
                            <option key={service} value={service}>{service}</option>
                        ))}
                    </select>
                    <label className="flex items-center space-x-2">
                        <span>Enabled</span>
                        <input
                            type="checkbox"
                            checked={newEnabled}
                            onChange={(e) => setNewEnabled(e.target.checked)}
                        />
                    </label>
                    <button
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        onClick={handleSubmit}
                    >Add API Key
                    </button>
                </div>
            </div>

            {apiKeys.map(apiKey => (
                <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                        {editingId === apiKey.id ? (
                            <>
                                <select
                                    className="border p-2 mb-2"
                                    value={editService}
                                    onChange={(e) => setEditService(e.target.value)}
                                >
                                    {services.map(service => (
                                        <option key={service} value={service}>{service}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    className="border p-2 mb-2"
                                    value={editApiKey}
                                    onChange={(e) => setEditApiKey(e.target.value)}
                                />
                                <label className="flex items-center space-x-2 mb-2">
                                    <span>Enabled</span>
                                    <input
                                        type="checkbox"
                                        checked={editEnabled}
                                        onChange={(e) => setEditEnabled(e.target.checked)}
                                    />
                                </label>
                            </>
                        ) : (
                            <>
                                <div>Service: {apiKey.service}</div>
                                <div>API Key: {showKey[apiKey.id] ? apiKey.api_key : '••••••••'}</div>
                                <div>{apiKey.enabled ? 'Enabled' : 'Disabled'}</div>
                            </>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => toggleShowKey(apiKey.id)}
                                className="px-2 py-1 text-xs bg-gray-200 rounded">View
                        </button>
                        {editingId === apiKey.id ? (
                            <>
                                <button onClick={() => handleSaveEdit(apiKey.id)}
                                        className="px-2 py-1 text-xs bg-green-200 rounded">Save
                                </button>
                                <button onClick={handleCancelEdit}
                                        className="px-2 py-1 text-xs bg-gray-200 rounded">Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => handleDelete(apiKey.id)}
                                        className="px-2 py-1 text-xs bg-red-200 rounded">Remove
                                </button>
                                <button onClick={() => startEdit(apiKey)}
                                        className="px-2 py-1 text-xs bg-blue-200 rounded">Edit
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

}
