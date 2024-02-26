'use client';
// import {createServerComponentClient} from '@supabase/auth-helpers-nextjs';
// import {cookies} from 'next/headers';
// import Link from 'next/link';
import {redirect} from 'next/navigation';

// import SignOut from '@/components/SignOut';
// import Design from "@/components/Create/Design";
import TabComponent from "@/components/Create/TabComponent";
// import EditedImageShow from "@/components/Create/EditedImageShow";
import React, {useEffect, useRef, useState} from "react";


export default async function Create() {
    // const supabase = createServerComponentClient({cookies});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    // const [text, setText] = useState('');
    const textareaRef = useRef(null);

    // Loading User Data
    useEffect(() => {
        // Define the async function inside useEffect
        const callSupabaseProxy = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/supabaseProxy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Your request body here
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                console.log(data);
                // Handle user data, set it to state, or perform redirect based on response

                setUser(data.user);

                if (!data.user) {
                    redirect('/sign-in');
                }

            } catch (error) {
                console.error('Failed to fetch:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        // Call the function
        callSupabaseProxy();
    }, []); // Empty dependency array means this effect runs once on mount

    // const {
    //     data: {user},
    // } = await supabase.auth.getUser();
    //
    // if (!user) {
    //     redirect('/sign-in');
    // }

    // const callSupabaseProxy = async () => {
    //     setLoading(true);
    //     try {
    //         const response = await fetch('/api/supabaseProxy', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             // Send any required data as JSON in the body
    //             body: JSON.stringify({ /* Your data here */ }),
    //         });
    //         if (!response.ok) throw new Error('Network response was not ok');
    //         const data = await response.json();
    //         // Handle the data
    //         console.log(data);
    //     } catch (error) {
    //         console.error('Failed to fetch:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // // Use the function
    // const user = await callSupabaseProxy();
    //
    // if (!user) {
    //     redirect('/sign-in');
    // }

    const callTextToImageAPI = async () => {
        console.log('Calling API...');
        setLoading(true);
        setError('');

        {
            console.log(textareaRef)
        }
        const text = textareaRef.current.value
        const encodedPrompt = encodeURIComponent(text);
        console.log(encodedPrompt);

        try {
            const response = await fetch('/api/text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // Your request body here, if needed. This example assumes you handle the body in the API route.
                    prompt: encodedPrompt,
                    // prompt: "kitty",
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
                console.error('API error:', response);
            }

            const data = await response.json();
            setResult(data[0].url);
            console.log('API response:', data);
            console.log(data[0].url);
        } catch (error) {
            setError('Failed to fetch: ' + error.message);
            console.error('API error:', error);
        } finally {
            setLoading(false);
            console.log('API call complete.');
        }
    };


    return (
        <div>
            {/*<h2>User Profile</h2>*/}
            {/*<code className="highlight">{user.email}</code>*/}
            {/*<div className="heading">Last Signed In:</div>*/}
            {/*<code className="highlight">{new Date(user.last_sign_in_at).toUTCString()}</code>*/}
            {/*<Link className="button" href="/">*/}
            {/*    Go Home*/}
            {/*</Link>*/}
            {/*<SignOut/>*/}
            <div className="flex h-screen pt-16">
                {/* Left side container */}
                <div className="flex flex-col w-3/4 overflow-hidden">
                    {/* Frame 1 */}
                    <div className="flex overflow-auto p-4" style={{flex: '14'}}>
                        {/* Frame 1.1 - Button Section */}
                        <div className="w-1/8 bg-gray-200 p-2 space-y-2">
                            {/* List of buttons */}
                            <button className="w-full h-10 bg-blue-500 text-white">Button 1</button>
                            <button className="w-full h-10 bg-blue-500 text-white">Button 2</button>
                            {/* Add more buttons as needed */}
                        </div>
                        {/* Frame 1.2 - Working Area with Tabs */}
                        <div className="flex-1 bg-white p-2 flex flex-col">
                            {/* Tabs */}
                            <div className="border-b-2">
                                {/* Tab buttons */}
                                <button className="px-4 py-2">Working Area</button>
                                <button className="px-4 py-2">History</button>
                            </div>
                            {/* Working area with flex grow */}
                            <div className="flex flex-col flex-grow relative overflow-hidden">
                                {/*<Image*/}
                                {/*    src="/demo_image.png"*/}
                                {/*    layout="fill"*/}
                                {/*    objectFit="contain"*/}
                                {/*    alt="Picture of the author"*/}
                                {/*/>*/}
                                {result && (
                                    <div>
                                        {/*<Image src={result} alt="Generated Image" layout="fill" objectFit="contain" />*/}
                                    </div>
                                )}
                                {/*<EditedImageShow/>*/}
                            </div>
                        </div>
                    </div>
                    {/* Frame 2 */}
                    <div className="px-4" style={{flex: '3'}}>
                        <h2 className="text-lg text-white">Text Box</h2>
                        {/* Container for Scrollable Text Box in Frame 2 */}
                        <div
                            className="p-2"> {/* Adjust the height calculation as needed */}
                            {/*<textarea*/}
                            {/*    className="w-full resize-none" // `resize-none` to prevent manual resizing*/}
                            {/*    placeholder="Your text goes here..."*/}
                            {/*    value={text}*/}
                            {/*    onChange={(e) => setText(e.target.value)}*/}
                            {/*/>*/}
                            <textarea
                                className="w-full resize-none"
                                placeholder="Your text goes here..."
                                ref={textareaRef}
                                // value={text}
                                // onChange={(e) => setText(e.target.value)}
                            />

                            {/*{textareaRef.current.value && (*/}
                            {/*    <div>*/}
                            {/*        <p className="text-white">{textareaRef.current.value}</p>*/}
                            {/*    </div>*/}
                            {/*)}*/}
                        </div>
                        <div className="p-2" onClick={callTextToImageAPI}>
                            <button
                                className="w-full h-10 bg-blue-500 text-white">{loading ? 'Loading...' : 'Generate Image'}</button>
                        </div>
                        <h2 className="text-lg text-white">Text Box</h2>
                    </div>
                </div>
                {/* Right side container - Frame 3 */}
                <div className="w-1/4 overflow-auto p-4">
                    {/* Tabs for Frame 3 */}
                    <div className="border-b-2">
                        {/*<button className="px-4 py-2 text-white">Design</button>*/}
                        {/*<button className="px-4 py-2 text-white">Edit</button>*/}
                        {/*<div className="flex space-x-4 mb-4">*/}
                        {/*    <button className="bg-blue-600 px-4 py-2 rounded">Design</button>*/}
                        {/*    <button className="bg-gray-700 px-4 py-2 rounded">Edit</button>*/}
                        {/*    <button className="bg-gray-700 px-4 py-2 rounded">History</button>*/}
                        {/*</div>*/}
                        {/*<Design/>*/}
                        <TabComponent/>
                        {/* Add more component tabs as needed */}
                    </div>
                    {/* Content of Frame 3 */}
                    <div className="mt-4">
                        {/* Component content based on selected tab */}
                    </div>
                </div>
            </div>
        </div>
    );
}
