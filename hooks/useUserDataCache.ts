import { useState, useCallback } from 'react';
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";


// Custom hook for managing user data cache
function useUserDataCache() {
    const [userDataCache, setUserDataCache] = useState({});
    const supabase = createClientComponentClient<Database>();

    async function fetchUserData(userId) {
        const {data, error} = await supabase
            .from('chat_message')
            .insert([
                {
                    chat_id: params.chat_id,
                    user_id: user.id,
                    text: llmResponse,
                    version: 1,
                    previous_message_id: theRealLastMessage.message_id
                }
            ]);
    }

    const getUserData = useCallback(async (userId) => {


        // Check if user data is already cached
        if (!userDataCache[userId]) {
            try {
                const userData = await fetchUserData(userId); // Fetch from Supabase
                if (userData) {
                    // Update cache with new user data
                    setUserDataCache((prevCache) => ({
                        ...prevCache,
                        [userId]: userData,
                    }));
                } else {
                    // Handle case where user data is not found by setting a default value
                    setUserDataCache((prevCache) => ({
                        ...prevCache,
                        [userId]: { name: 'Unknown', imageUrl: '/default_profile_image.png' },
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch user data', error);
                // Optionally set default values in case of an error
            }
        }

        return userDataCache[userId] || { name: 'Unknown', imageUrl: '/default_profile_image.png' };
    }, [userDataCache]);

    return { getUserData, userDataCache };
}

export default useUserDataCache;