import React, {useEffect, useState} from 'react';
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import {usePathname, useRouter} from 'next/navigation';
import {AuthContext} from "@/components/AuthProvider";

export const PersonalizationModal = ({ isOpen, onClose }) => {
    // States for form inputs
    const [aboutMe, setAboutMe] = useState('');
    const [respondAs, setRespondAs] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    const supabase = createClientComponentClient<Database>();

    const router = useRouter();
    const pathname = usePathname();
    const {accessToken, user} = React.useContext(AuthContext);

    // on open, set the initial values
    useEffect(() => {
        const pathArray = pathname.split('/');
        let chatId = '';

        // Check if pathname follows the expected format
        if (pathArray.length === 5 && pathArray[1] === 'projects' && pathArray[3] === 'chat') {
            // Extract projectId and chatId from the pathname
            chatId = pathArray[4];
            setIsDefault(false); // Set default to false if the format matches
        } else {
            setIsDefault(true); // Set default to true if the format does not match
        }

        console.log("pathname", pathname);
        console.log("chatId", chatId);
        const userId = user?.id;
        console.log("userId", userId);

        const loadData = async () => {
            if (!userId || !chatId) {
                // If userId or chatId is not defined, do not attempt to load data
                return;
            }

            const { data, error } = await supabase
                .from('personalization')
                .select('*')
                .eq('user_id', userId)
                .eq('chat_id', chatId)
                .eq('general', isDefault)
                // .single();

            if (error) {
                console.error('Error loading data', error);
                return;
            }

            if (data) {
                if (data.length === 0) {
                    // If no data is found, set default values
                    setAboutMe('');
                    setRespondAs('');
                    return;
                }
                console.log("data", data);
                setAboutMe(data[0].about_me || '');
                setRespondAs(data[0].respond_as || '');
                // Only update isDefault based on the data if pathname does not match the expected format
                if (!(pathArray.length === 5 && pathArray[1] === 'projects' && pathArray[3] === 'chat')) {
                    setIsDefault(data[0].default || false);
                }
            }
        };

        if (isOpen) {
            loadData();
        }
    }, [isOpen, isDefault]);



    // Handle form submission
    const handleSubmit = async (e) => {
        const pathArray = pathname.split('/');
        let chatId = '';

        // Check if pathname follows the expected format
        if (pathArray.length === 5 && pathArray[1] === 'projects' && pathArray[3] === 'chat') {
            chatId = pathArray[4];
        }

        console.log("pathname", pathname);
        console.log("chatId", chatId);
        const userId = user?.id;
        console.log("userId", userId);

        e.preventDefault();
        let personalizationData = {};
        if (chatId === '') {
            personalizationData = { user_id: userId, about_me: aboutMe, respond_as: respondAs, general: isDefault };
        }
        else {
            personalizationData = { user_id: userId, chat_id: chatId, about_me: aboutMe, respond_as: respondAs, general: isDefault };
        }
        console.log("personalizationData", personalizationData);

        const { data, error } = await supabase
            .from('personalization')
            .upsert(personalizationData, { onConflict: 'user_id, general' })
            .select();
            // .insert(personalizationData)

        if (error) {
            console.error('Error saving data', error);
            return;
        }

        // Call onClose to close the modal after save
        onClose();
    };


    // Early return if not open
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex justify-center items-center ">
            <div className="bg-white  z-40 p-4 rounded-md shadow-lg max-w-md w-full">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="aboutMe">What would you like ChatGPT to know about you to provide better responses?</label>
                        <textarea
                            id="aboutMe"
                            value={aboutMe}
                            onChange={(e) => setAboutMe(e.target.value)}
                            rows="4"
                            className="w-full p-2 border border-gray-300 rounded-md"
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="respondAs">How would you like ChatGPT to respond?</label>
                        <textarea
                            id="respondAs"
                            value={respondAs}
                            onChange={(e) => setRespondAs(e.target.value)}
                            rows="4"
                            className="w-full p-2 border border-gray-300 rounded-md"
                        ></textarea>
                    </div>
                    <div className="flex items-center my-4">
                        <input
                            id="default"
                            type="checkbox"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor="default" className="ml-2">Enable for new chats</label>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Save</button>
                    </div>

                </form>
            </div>
        </div>
    );
};
