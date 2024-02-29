// hooks/useManualServerSentEvents.ts
import { useCallback, useState } from 'react';

export const useManualServerSentEvents = (url: string, headers?: HeadersInit) => {
    const [messages, setMessages] = useState<string[]>([]);
    let eventSource: EventSource | null = null;

    const startListening = useCallback(() => {
        eventSource = new EventSource(url, { withCredentials: true });

        eventSource.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, newMessage.message]);
        };

        eventSource.onerror = (error) => {
            console.error("EventSource failed:", error);
            eventSource?.close();
        };
    }, [url]);

    const stopListening = useCallback(() => {
        if (eventSource) {
            eventSource.close();
            eventSource = null;
        }
    }, []);

    return { messages, startListening, stopListening };
};




// import { useCallback, useState } from 'react';
//
// export const useManualServerSentEvents = (postUrl: string, messageText: string, headers?: HeadersInit) => {
//     const [messages, setMessages] = useState<string[]>([]);
//     let eventSource: EventSource | null = null;
//
//     const startListening = useCallback(() => {
//         // Perform the POST request to initiate the streaming
//         fetch(postUrl, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 ...headers,
//             },
//             body: JSON.stringify({ message: messageText }),
//             credentials: 'include',
//         })
//             .then(response => {
//                 if (response.ok) {
//                     // Assuming the server responds with a URL for the SSE
//                     return response.text();
//                 }
//                 throw new Error('Network response was not ok.');
//             })
//             .then(streamUrl => {
//                 // Now we start listening to the stream at the provided URL
//                 eventSource = new EventSource(streamUrl, { withCredentials: true });
//
//                 eventSource.onmessage = (event) => {
//                     try {
//                         const newMessage = JSON.parse(event.data);
//                         setMessages((prevMessages) => [...prevMessages, newMessage.message]);
//                     } catch (error) {
//                         console.error("Error parsing message:", event.data, error);
//                     }
//                 };
//
//                 eventSource.onerror = (error) => {
//                     console.error("EventSource failed:", error);
//                     eventSource?.close();
//                 };
//             })
//             .catch(error => {
//                 console.error("Failed to start the stream with POST request:", error);
//             });
//     }, [postUrl, messageText]);
//
//     const stopListening = useCallback(() => {
//         if (eventSource) {
//             eventSource.close();
//             eventSource = null;
//         }
//     }, []);
//
//     return { messages, startListening, stopListening };
// };