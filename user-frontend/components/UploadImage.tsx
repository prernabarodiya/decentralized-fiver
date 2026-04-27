// "use client";

// import { BACKEND_URL, CLOUDFRONT_URL } from "@/utils";
// import axios from "axios";
// import { useState } from "react";

// export function UploadImage({
//     onImageAdded,
//     image,
// }: {
//     onImageAdded: (image: string) => void;
//     image?: string;
// }) {
//     const [uploading, setUploading] = useState(false);

//     async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
//         setUploading(true);

//         try {
//             const file = e.target.files?.[0];
//             if (!file) {
//                 setUploading(false);
//                 return;
//             }

//             // ✅ Step 1: Get presigned URL from backend
//             const response = await axios.get(
//                 `${BACKEND_URL}/v1/user/presignedUrl`,
//                 {
//                     headers: {
//                         Authorization: localStorage.getItem("token") || "",
//                     },
//                 }
//             );

//             console.log("Presigned response:", response.data);

//             const presignedUrl = response.data.preSignedUrl;
//             const fields = response.data.fields;

//             // ✅ Step 2: Build form data CORRECTLY
//             const formData = new FormData();

//             // 🔥 IMPORTANT: Add ALL fields dynamically (no manual mistakes)
//             Object.entries(fields).forEach(([key, value]) => {
//                 formData.append(key, value as string);
//             });

//             // 🔥 File MUST be last
//             formData.append("file", file);

//             // ✅ Step 3: Upload to S3
//             const awsResponse = await axios.post(presignedUrl, formData, {
//                 headers: {
//                     "Content-Type": "multipart/form-data",
//                 },
//             });

//             console.log("S3 upload success:", awsResponse);

//             // ✅ Step 4: Return CloudFront URL
//             const imageUrl = `${CLOUDFRONT_URL}/${fields["key"]}`;
//             onImageAdded(imageUrl);
//         } catch (err) {
//             console.error("Upload failed:", err);
//         }

//         setUploading(false);
//     }

//     // ✅ If image already exists
//     if (image) {
//         return (
//             <img
//                 className="p-2 w-96 rounded"
//                 src={image}
//                 alt="uploaded"
//             />
//         );
//     }

//     // ✅ Upload UI
//     return (
//         <div>
//             <div className="w-40 h-40 rounded border text-2xl cursor-pointer">
//                 <div className="h-full flex justify-center flex-col relative w-full">
//                     <div className="h-full flex justify-center w-full pt-16 text-4xl">
//                         {uploading ? (
//                             <div className="text-sm">Uploading...</div>
//                         ) : (
//                             <>
//                                 +
//                                 <input
//                                     type="file"
//                                     className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
//                                     onChange={onFileSelect}
//                                 />
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


// // "use client"
// // import { BACKEND_URL, CLOUDFRONT_URL } from "@/utils";
// // import axios from "axios";
// // import { useState } from "react"
// // //import Image from "next/image";


// // export function  UploadImage({ onImageAdded, image} : {
// //     onImageAdded : (image: string) => void;
// //     image?: string;
// // }) {
// //     const [uploading, setUploading] = useState(false);

// //     async function onFileSelect(e : React.ChangeEvent<HTMLInputElement>) {
// //         setUploading(true);
// //         try{
// //             const file = e.target.files?.[0];
// //             if (!file) {
// //                 setUploading(false);
// //                 return;
// //             }
// //             const response = await axios.get(`${BACKEND_URL}/v1/user/presignedUrl`, {
// //                 headers: {
// //                     "Authorization": localStorage.getItem("token")
// //                 }
// //             });
// //             console.log("response ******************", response)
// //             const presignedUrl = response.data.preSignedUrl;
// //             const formData = new FormData();
// //             formData.set("bucket", response.data.fields["bucket"])
// //             formData.set("X-Amz-Algorithm", response.data.fields["X-Amz-Algorithm"]);
// //             formData.set("X-Amz-Credential", response.data.fields["X-Amz-Credential"]);
// //             formData.set("X-Amz-Algorithm", response.data.fields["X-Amz-Algorithm"]);
// //             formData.set("X-Amz-Date", response.data.fields["X-Amz-Date"]);
// //             formData.set("key", response.data.fields["key"]);
// //             formData.set("Policy", response.data.fields["Policy"]);
// //             formData.set("X-Amz-Signature", response.data.fields["X-Amz-Signature"]);
// //             formData.set("X-Amz-Algorithm", response.data.fields["X-Amz-Algorithm"]);
// //             formData.append("file", file);
// //             const awsResponse = await axios.post(presignedUrl, formData);
// //             console.log(awsResponse);
// //             onImageAdded(`${CLOUDFRONT_URL}/${response.data.fields["key"]}`);
// //             //await axios.post(presignedUrl, formData);
// //         }catch(e){
// //             console.log(e);
// //         }
// //         setUploading(false);
       
// //     }

// //     if (image) {
// //         return  <img className={"p-2 w-96 rounded"} src={image} />
// //     }

// //     return <div>
// //         <div className="w-40 h-40 rounded border text-2xl cursor-pointer">
// //                 <div className="h-full flex justify-center flex-col relative w-full">
// //                     <div className="h-full flex justify-center w-full pt-16 text-4xl">
// //                     {uploading ? <div className="text-sm">Loading...</div> : <>
// //                         +
// //                         <input className="w-full h-full bg-red-400 w-40 h-40" type="file" style={{position: "absolute", opacity: 0, top: 0, left: 0, bottom: 0, right: 0, width: "100%", height: "100%"}} onChange={onFileSelect} />
// //                     </>}
// //                 </div>
// //             </div>
// //         </div>
// //     </div>


// // }


"use client";

import { BACKEND_URL, CLOUDFRONT_URL } from "@/utils";
import axios from "axios";
import { useState } from "react";

export function UploadImage({
  onImageAdded,
  image,
}: {
  onImageAdded: (image: string) => void;
  image?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/v1/user/presignedUrl`, {
        headers: {
          Authorization: localStorage.getItem("token") || "",
        },
      });

      const { preSignedUrl, fields } = response.data;

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", file);

      await axios.post(preSignedUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onImageAdded(`${CLOUDFRONT_URL}/${fields["key"]}`);
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
  }

  if (image) {
    return (
      <div className="relative w-[120px] h-[120px] rounded-xl overflow-hidden border border-amber-400/40 shadow-[0_0_0_3px_rgba(245,158,11,0.1)]">
        <img
          src={image}
          className="w-full h-full object-cover"
          alt="uploaded"
        />
        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-black text-xs font-bold">
          ✓
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`relative w-[160px] h-[160px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition
        ${
          dragOver
            ? "border-amber-400 bg-amber-400/10 -translate-y-1"
            : "border-white/20 bg-white/5"
        }
        ${uploading && "opacity-60 pointer-events-none"}
      `}
    >
      {uploading ? (
        <div className="text-xs text-white/50">Uploading...</div>
      ) : (
        <>
          <div className="text-white/40 text-2xl">↑</div>
          <span className="text-xs text-white/50">Drop image</span>
          <span className="text-[10px] text-white/30">or click</span>

          <input
            type="file"
            accept="image/*"
            onChange={onFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </>
      )}
    </div>
  );
}
