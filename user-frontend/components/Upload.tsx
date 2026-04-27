// "use client";
// import { UploadImage } from "@/components/UploadImage";
// import { BACKEND_URL } from "@/utils";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export const Upload = () => {
//     const [images, setImages] = useState<string[]>([]);
//     const [title, setTitle] = useState("");
//     const router = useRouter();

//     async function onSubmit() {
//         const response = await axios.post(`${BACKEND_URL}/v1/user/task`, {
//             options: images.map(image => ({
//                 imageUrl: image,
//             })),
//             title,
//             signature: "hardcoded_signature"
//         }, {
//             headers: {
//                 "Authorization": localStorage.getItem("token")
//             }
//         });
//         router.push(`/task/${response.data.id}`);
//     }

//     return (
//         <div className="flex justify-center">
//             <div className="max-w-screen-lg w-full">
//                 <div className="text-2xl text-left pt-20 w-full pl-4">
//                     Create a task
//                 </div>
//                 <label className="pl-4 block mt-2 text-md font-medium text-gray-900">Task details</label>
//                 <input
//                     onChange={(e) => setTitle(e.target.value)}
//                     type="text" id="first_name"
//                     className="ml-4 mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
//                     placeholder="What is your task?"
//                     required
//                 />
//                 <label className="pl-4 block mt-8 text-md font-medium text-gray-900 text-black">Add Images</label>
//                 <div className="flex justify-center pt-4 max-w-screen-lg">
//                     {images.map(image => (
//                         <UploadImage key={image} image={image} onImageAdded={(imageUrl) => {
//                             setImages(i => [...i, imageUrl]);
//                         }} />
//                     ))}
//                 </div>
//                 <div className="ml-4 pt-2 flex justify-center">
//                     <UploadImage onImageAdded={(imageUrl) => {
//                         setImages(i => [...i, imageUrl]);
//                     }} />
//                 </div>
//                 <div className="flex justify-center">
//                     <button
//                         onClick={onSubmit}
//                         type="button"
//                         className="mt-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
//                     >
//                         Submit Task
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }


"use client";
import { UploadImage } from "@/components/UploadImage";
import { BACKEND_URL } from "@/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Upload = () => {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function onSubmit() {
    if (!title.trim() || images.length === 0) return;
    setSubmitting(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/v1/user/task`,
        {
          options: images.map((image) => ({ imageUrl: image })),
          title,
          signature: "hardcoded_signature",
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      router.push(`/task/${response.data.id}`);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  }

  const isReady = title.trim().length > 0 && images.length > 0;

  return (
    <div className="min-h-screen bg-black px-4 py-16 flex justify-center">
      <div className="w-full max-w-[680px]">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-4">
            New Task
          </div>
          <h1 className="text-4xl text-zinc-100 font-serif tracking-tight mb-2">
            Create a labeling task
          </h1>
          <p className="text-white/40 text-sm">
            Upload your images and describe what needs to be labelled.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">

          {/* Title */}
          <div className="flex flex-col gap-3">
            <label className="text-xs uppercase tracking-wider text-white/50 font-semibold flex items-center gap-2">
              <span className="text-amber-400 font-serif italic">01</span>
              Task description
            </label>

            <input
              type="text"
              placeholder="What is your task?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-400/40 focus:bg-amber-400/5"
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 my-6" />

          {/* Images */}
          <div className="flex flex-col gap-4">
            <label className="text-xs uppercase tracking-wider text-white/50 font-semibold flex items-center gap-2">
              <span className="text-amber-400 font-serif italic">02</span>
              Upload images
              {images.length > 0 && (
                <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                  {images.length} added
                </span>
              )}
            </label>

            <div className="flex flex-wrap gap-3">
              {images.map((image) => (
                <UploadImage
                  key={image}
                  image={image}
                  onImageAdded={(url) =>
                    setImages((prev) => [...prev, url])
                  }
                />
              ))}

              <UploadImage
                onImageAdded={(url) =>
                  setImages((prev) => [...prev, url])
                }
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">

            <div className="text-xs text-white/30">
              {!isReady &&
                (!title.trim()
                  ? "Add a task description"
                  : "Upload at least one image")}
            </div>

            <button
              onClick={onSubmit}
              disabled={!isReady || submitting}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition ${
                isReady
                  ? "bg-amber-500 text-black hover:bg-amber-400 hover:-translate-y-[1px]"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              {submitting ? "Submitting..." : "Submit Task →"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};