"use client";

import { Appbar } from '@/components/Appbar';
import { BACKEND_URL } from '@/utils';
import axios from 'axios';
import { useEffect, useState } from 'react';

async function getTaskDetails(taskId: string) {
    const response = await axios.get(`${BACKEND_URL}/v1/user/task?taskId=${taskId}`, {
        headers: {
            Authorization: localStorage.getItem("token") || ""
        }
    });
    console.log("API DATA:", response.data);
    return response.data;
}

export default function Page({ params: { taskId } }: { params: { taskId: string } }) {
    
    const [result, setResult] = useState<Record<string, {
        count: number;
        option: { imageUrl: string }
    }>>({});

    const [taskDetails, setTaskDetails] = useState<{
        id: number;
        title?: string;
        amount: number;
        done: boolean;
    } | null>(null);

    useEffect(() => {
        
        async function fetchData() {
            try {
                const data = await getTaskDetails(taskId);

                setResult(data?.result || {});
                setTaskDetails(data?.task || null);

               // console.log("task details:", data.task);
            } catch (err) {
                console.error(err);
            }
        }

        fetchData();
    }, [taskId]);

    return (
        <div>
            <Appbar />

            {/* Title */}
            <div className='text-2xl pt-20 flex justify-center font-semibold'>
                {taskDetails?.title || "Loading..."}
            </div>

            {/* Amount (optional but useful)
            {taskDetails && (
                <div className='flex justify-center text-gray-500 mt-2'>
                    Reward: {taskDetails.amount}
                </div>
            )} */}

            {/* Options */}
            <div className='flex justify-center pt-8 flex-wrap'>
                {Object.keys(result).map((optionId) => (
                    <Task
                        key={optionId}
                        imageUrl={result[optionId].option.imageUrl}
                        votes={result[optionId].count}
                    />
                ))}
            </div>
        </div>
    );
}

function Task({ imageUrl, votes }: {
    imageUrl: string;
    votes: number;
}) {
    return (
        <div className="m-2">
            <img className="p-2 w-96 " src={imageUrl} />
            <div className='flex justify-center font-medium'>{votes} votes</div>
        </div>
    );
}

//******************************************************** */

// "use client";

// import { Appbar } from '@/components/Appbar';
// import { BACKEND_URL } from '@/utils';
// import axios from 'axios';
// import { useEffect, useState } from 'react';

// async function getTaskDetails(taskId: string) {
//     const response = await axios.get(
//         `${BACKEND_URL}/v1/user/task?taskId=${taskId}`,
//         {
//             headers: {
//                 Authorization: localStorage.getItem("token") || ""
//             }
//         }
//     );
//     return response.data;
// }

// export default function Page({ params: { taskId } }: { params: { taskId: string } }) {

//     const [result, setResult] = useState<Record<string, {
//         count: number;
//         option: { imageUrl: string }
//     }>>({});

//     const [taskDetails, setTaskDetails] = useState<{
//         id: number;
//         title?: string;
//         amount: number;
//         done: boolean;
//     } | null>(null);

//     useEffect(() => {
//         async function fetchData() {
//             try {
//                 const data = await getTaskDetails(taskId);
//                 setResult(data?.result || {});
//                 setTaskDetails(data?.task || null);
//             } catch (err) {
//                 console.error(err);
//             }
//         }
//         fetchData();
//     }, [taskId]);

//     return (
//         <div className="min-h-screen bg-black relative overflow-hidden">

//             <Appbar />

//             {/* Amber Glow */}
//             <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />

//             <div className="max-w-[1100px] mx-auto px-4 pt-24 relative z-10">

//                 {/* Title */}
//                 <div className="text-center mb-10">
//                     <h1 className="text-3xl md:text-4xl text-zinc-100 font-serif tracking-tight">
//                         {taskDetails?.title || "Loading..."}
//                     </h1>

//                     {taskDetails && (
//                         <p className="text-white/40 text-sm mt-2">
//                             Reward: {taskDetails.amount}
//                         </p>
//                     )}
//                 </div>

//                 {/* Grid */}
//                 <div className="flex flex-wrap justify-center gap-6">
//                     {Object.keys(result).map((optionId) => (
//                         <Task
//                             key={optionId}
//                             imageUrl={result[optionId].option.imageUrl}
//                             votes={result[optionId].count}
//                         />
//                     ))}
//                 </div>

//             </div>
//         </div>
//     );
// }

// function Task({ imageUrl, votes }: {
//     imageUrl: string;
//     votes: number;
// }) {
//     return (
//         <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md hover:-translate-y-1 transition">

//             <img
//                 src={imageUrl}
//                 className="w-[260px] h-[180px] object-cover"
//                 alt="task"
//             />

//             <div className="text-center py-3 text-sm text-white/70 font-medium">
//                 {votes} votes
//             </div>

//         </div>
//     );
// }