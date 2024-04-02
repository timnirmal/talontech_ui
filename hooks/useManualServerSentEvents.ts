import { useCallback, useEffect, useState } from 'react';

export const useManualServerSentEvents = (url: string, body: any, headers?: HeadersInit) => {
    const [messages, setMessages] = useState<string[]>([]);
    const [controller, setController] = useState<AbortController | null>(null);

    const reset = useCallback(() => {
        // Clear messages
        setMessages([]);
        // Abort ongoing fetch operation, if any
        if (controller) {
            controller.abort();
            setController(null); // Ensure controller is reset to null
        }
    }, [controller]);

    const startFetching = useCallback(() => {
        reset(); // Reset before starting a new session to ensure clean state
        const newController = new AbortController();
        setController(newController);
        const signal = newController.signal;

        console.log("body", body);
        console.log("body", body);
        console.log("body", body);
        console.log("body", body);
        console.log("body", body);
        console.log("body", body);
        console.log("body", body);

        // Return a new promise that will be resolved when the stream ends
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers,
                    },
                    body: JSON.stringify(body),
                    signal,
                });

                if (response.body) {
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            resolve(); // Resolve the promise when the stream ends
                            break;
                        }
                        const str = decoder.decode(value);
                        try {
                            // Adjust for SSE format by stripping 'data: ' prefix and trimming whitespace
                            const jsonStr = str.replace(/^data: /, '').trim();
                            const newMessage = JSON.parse(jsonStr);
                            setMessages((prevMessages) => [...prevMessages, newMessage.message]);
                        } catch (error) {
                            console.error("Error parsing message:", error);
                        }
                    }
                } else {
                    reject(new Error('Response body is null'));
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    console.error("Fetch error:", error);
                    reject(error);
                }
            }
        });
    }, [url, body, headers, reset]);

    const stopFetching = useCallback(() => {
        reset(); // Also reset when manually stopping the fetch
    }, [reset]);

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (controller) {
                controller.abort();
            }
        };
    }, [controller]);

    return { messages, startFetching, stopFetching, reset };
};
