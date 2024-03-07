'use client';

import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
// import RealTimeM from "@/app/projects/[id]/chat/[chat_id]/test/RealTimeM";
// import TestMessageTree from "@/app/projects/[id]/chat/[chat_id]/messageNode";
import ChatComponent from "@/app/projects/[id]/chat/[chat_id]/messageNode";



export const revalidate = 0;

export default async function Posts() {
    const supabase = createClientComponentClient<Database>();
    // const {data, error} = await supabase
    //     .from('chat_message')
    //     .select()
    // console.log("data", data);

    const data = [
        {
            "message_id": "5063a388-5a04-456a-ae04-92ea15b754de",
            "chat_id": "7e1a0e0e-cb5a-4aac-955a-e1f8c06cfc3a",
            "user_id": "89e9b16c-49c3-49a4-88bf-3ccdac429d4f",
            "llm_id": null,
            "text": "what is gemma?",
            "created_date": "2024-03-01T08:23:04.506949+00:00",
            "original_message_id": null,
            "version": 1,
            "previous_message_id": null,
            "branch_id": null,
            "branch_parent_id": null,
            "branch_parent_chat_id": null
        },
        {
            "message_id": "d9c412d4-3c23-46be-9c0d-4c477f4455ee",
            "chat_id": "7e1a0e0e-cb5a-4aac-955a-e1f8c06cfc3a",
            "user_id": null,
            "llm_id": "374d3a2d-703f-4f6e-a86b-468441c328fc",
            "text": "Gemma is a family of lightweight, state-of-the-art open models developed by Google DeepMind and other teams across Google. The name \"Gemma\" reflects the Latin word \"gemma,\" meaning \"precious stone.\" These models are designed to assist developers and researchers in building AI responsibly",
            "created_date": "2024-03-01T08:28:26.294485+00:00",
            "original_message_id": null,
            "version": 1,
            "previous_message_id": "5063a388-5a04-456a-ae04-92ea15b754de",
            "branch_id": null,
            "branch_parent_id": null,
            "branch_parent_chat_id": null
        },
        {
            "message_id": "937f94b3-d962-415e-8d0f-f985e1435f61",
            "chat_id": "7e1a0e0e-cb5a-4aac-955a-e1f8c06cfc3a",
            "user_id": "89e9b16c-49c3-49a4-88bf-3ccdac429d4f",
            "llm_id": null,
            "text": "What are the advantages of Gemma?",
            "created_date": "2024-03-01T08:33:47.070201+00:00",
            "original_message_id": null,
            "version": 1,
            "previous_message_id": "d9c412d4-3c23-46be-9c0d-4c477f4455ee",
            "branch_id": null,
            "branch_parent_id": null,
            "branch_parent_chat_id": null
        },
        {
            "message_id": "cbf41974-6ff7-4259-8502-bd2e8b06ec61",
            "chat_id": "7e1a0e0e-cb5a-4aac-955a-e1f8c06cfc3a",
            "user_id": "89e9b16c-49c3-49a4-88bf-3ccdac429d4f",
            "llm_id": null,
            "text": "What is gemma why it is good",
            "created_date": "2024-03-01T18:09:36.526269+00:00",
            "original_message_id": "937f94b3-d962-415e-8d0f-f985e1435f61",
            "version": 2,
            "previous_message_id": "d9c412d4-3c23-46be-9c0d-4c477f4455ee",
            "branch_id": null,
            "branch_parent_id": null,
            "branch_parent_chat_id": null
        }
    ]

    return (
        <div className="text-sm">
            {/*<TestMessageTree data={data}/>*/}
            <ChatComponent data={data}/>
            {/*<RealTimeM ServerPosts={data ?? []}/>*/}
        </div>
    );
}