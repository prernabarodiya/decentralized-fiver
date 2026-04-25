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