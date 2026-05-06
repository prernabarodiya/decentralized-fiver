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
        headers: { Authorization: localStorage.getItem("token") || "" },
      });

      const { preSignedUrl: presignedUrl, fields } = response.data;

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", file);

      await axios.post(presignedUrl, formData, {
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
          alt="uploaded"
          className="w-full h-full object-cover"
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
        <div className="flex flex-col items-center gap-2 text-xs text-white/50">
          <div className="w-7 h-7 border-2 border-white/10 border-t-amber-400 rounded-full animate-spin" />
          Uploading...
        </div>
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