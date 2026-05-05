"use client"
import { BACKEND_URL } from "@/utils";
import axios from "axios";
import { useEffect, useState } from "react"

interface Task {
    "id": number,
    "amount": number,
    "title": string,
    "options": {
        id: number;
        image_url: string;
        task_id: number
    }[]
}


export const NextTask = () => {
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { 
        axios.get(`${BACKEND_URL}/v1/worker/nextTask`, { 
            headers: { 
                Authorization: localStorage.getItem("token") 
            } 
        }) 
        .then(res => { 
            setCurrentTask(res.data.task); 
        }) 
        .catch(() => { 
            setCurrentTask(null); 
        }) 
        .finally(() => {
            setLoading(false);
        });
    }, []);

    // useEffect(() => { 
    //     setLoading(true); 
    //     axios.get(`${BACKEND_URL}/v1/worker/nextTask`, { 
    //         headers: { 
    //             "Authorization": localStorage.getItem("token") 

    //         } 
    //     }) 
    //         .then(res => { 
    //             setCurrentTask(res.data.task); 
    //             setLoading(false) 
    //         }) 
    //         .catch(e => { 
    //             setLoading(false) 
    //             setCurrentTask(null) 
            
    //         }) 
    // }, [])

    
    
    if (loading) {
        return <div className="h-screen flex justify-center flex-col">
            <div className="w-full flex justify-center text-2xl">
                Loading...
            </div>
        </div>
    }

    if (!currentTask) {
        return <div className="h-screen flex justify-center flex-col">
            <div className="w-full flex justify-center text-2xl">
                Please check back in some time, there are no pending tasks at the moment
            </div>
        </div>
    }

    // return <div>
    //     <div className='text-2xl pt-20 flex justify-center'>
    //         {currentTask.title}
    //         <div className="pl-4">
    //             {submitting && "Submitting..."}
    //         </div>
    //     </div>
    //     <div className='flex justify-center pt-8'>
    //         {currentTask.options.map(option => <Option onSelect={async () => {
    //             setSubmitting(true);
    //             try {
    //                 const response = await axios.post(`${BACKEND_URL}/v1/worker/submission`, {
    //                     taskId: currentTask.id.toString(),
    //                     selection: option.id.toString()
    //                 }, {
    //                     headers: {
    //                         "Authorization": localStorage.getItem("token")
    //                     }
    //                 });
    
    //                 const nextTask = response.data.nextTask;
    //                 if (nextTask) {
    //                     setCurrentTask(nextTask)
    //                 } else {
    //                     setCurrentTask(null);
    //                 }
    //                 // refresh the user balance in the appbar
    //             } catch(e) {
    //                 console.log(e);
    //             }
    //             setSubmitting(false);

    //         }} key={option.id} imageUrl={option.image_url} />)}
    //     </div>
    // </div>


    return <div>
        <div className="text-2xl pt-20 flex justify-center">
            (task - {currentTask.id} ) {currentTask.title}  
            { submitting && "    Submitting..."}

        </div>
        <div className="flex justify-center pt-8">
            {currentTask.options.map(option => <Option onSelect={async () => {
                setSubmitting(true);
                try{
                    const response = await axios.post(`${BACKEND_URL}/v1/worker/submission`, {
                    taskId: currentTask.id.toString(),
                    selection: option.id.toString()
                }, {
                    headers: {
                        "Authorization": localStorage.getItem("token")
                    }
                });
                const nextTask = response.data.nextTask;
                if(nextTask){
                    setCurrentTask(nextTask)
                }else {
                    setCurrentTask(null);
                }
                }catch(e){
                    console.log(e);
                }
                setSubmitting(false);
                
            }} key={option.id} imageUrl={option.image_url} /> )}
        </div>
    </div>
}

function Option({imageUrl, onSelect}: {
    imageUrl: string;

    onSelect: () => void;
}) {
    return <div>
        <img onClick={onSelect} className={"p-2 w-96 rounded-md"} src={imageUrl} />
    </div>
}

//**********************************************************



// "use client";

// import { BACKEND_URL } from "@/utils";
// import axios from "axios";
// import { useEffect, useState } from "react";

// interface Task {
//   id: number;
//   amount: number;
//   title: string;
//   options: {
//     id: number;
//     image_url: string;
//     task_id: number;
//   }[];
// }

// export const NextTask = () => {
//   const [currentTask, setCurrentTask] = useState<Task | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     axios
//       .get(`${BACKEND_URL}/v1/worker/nextTask`, {
//         headers: {
//           Authorization: localStorage.getItem("token"),
//         },
//       })
//       .then((res) => {
//         setCurrentTask(res.data.task);
//       })
//       .catch(() => {
//         setCurrentTask(null);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center text-white/60">
//         Loading...
//       </div>
//     );
//   }

//   if (!currentTask) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center text-white/40 text-center px-4">
//         No pending tasks right now. Please check back later.
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black relative overflow-hidden">

//       {/* Amber Glow */}
//       <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />

//       <div className="relative z-10 max-w-[1100px] mx-auto px-4 pt-24">

//         {/* Title */}
//         <div className="text-center mb-10 animate-[fadeUp_0.6s_ease_forwards]">
//           <h1 className="text-3xl text-zinc-100 font-serif tracking-tight">
//             (Task {currentTask.id}) {currentTask.title}
//           </h1>

//           {submitting && (
//             <p className="text-amber-400 text-sm mt-2">Submitting...</p>
//           )}
//         </div>

//         {/* Options */}
//         <div className="flex flex-wrap justify-center gap-6 animate-[fadeUp_0.8s_ease_forwards]">
//           {currentTask.options.map((option) => (
//             <Option
//               key={option.id}
//               imageUrl={option.image_url}
//               onSelect={async () => {
//                 setSubmitting(true);
//                 try {
//                   const response = await axios.post(
//                     `${BACKEND_URL}/v1/worker/submission`,
//                     {
//                       taskId: currentTask.id.toString(),
//                       selection: option.id.toString(),
//                     },
//                     {
//                       headers: {
//                         Authorization: localStorage.getItem("token"),
//                       },
//                     }
//                   );

//                   const nextTask = response.data.nextTask;
//                   if (nextTask) {
//                     setCurrentTask(nextTask);
//                   } else {
//                     setCurrentTask(null);
//                   }
//                 } catch (e) {
//                   console.log(e);
//                 }
//                 setSubmitting(false);
//               }}
//             />
//           ))}
//         </div>

//       </div>

//       {/* Animation */}
//       <style jsx>{`
//         @keyframes fadeUp {
//           0% {
//             opacity: 0;
//             transform: translateY(25px);
//           }
//           100% {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// function Option({
//   imageUrl,
//   onSelect,
// }: {
//   imageUrl: string;
//   onSelect: () => void;
// }) {
//   return (
//     <div
//       onClick={onSelect}
//       className="bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer backdrop-blur-md transition hover:-translate-y-1 hover:border-amber-400/40"
//     >
//       <img
//         src={imageUrl}
//         className="w-[260px] h-[180px] object-cover"
//         alt="option"
//       />
//     </div>
//   );
// }