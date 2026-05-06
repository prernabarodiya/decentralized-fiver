"use client";

import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { UploadImage } from "@/components/UploadImage";
import { BACKEND_URL } from "@/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

export const Upload = () => {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();

  async function onSubmit() {
    if (!title.trim() || images.length === 0) return;
    setSubmitting(true);

    const response = await axios.post(
      `${BACKEND_URL}/v1/user/task`,
      {
        options: images.map((image) => ({
          imageUrl: image,
        })),
        title,
        signature: txSignature,
      },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );

    router.push(`/task/${response.data.id}`);
  }

  async function makePayment() {
    try {
      if (!publicKey) return;

      const toPubkey = new PublicKey(
        "8LiJKH4b16Sy74vdHcgjcawjDPKkoA4NSvGMtpv3r79B"
      );

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey,
          lamports: 100000000,
        })
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);

      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed"
      );

      setTxSignature(signature);
    } catch (err) {
      console.error(err);
    }
  }

  const isReady = title.trim().length > 0 && images.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0c] px-6 py-16 flex justify-center">
      <div className="w-full max-w-[680px] animate-[fadeUp_0.6s_ease_forwards]">

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
              placeholder="e.g. Which one is a cat image"
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
              onClick={txSignature ? onSubmit : makePayment}
              disabled={!isReady || submitting}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition ${
                isReady
                  ? "bg-amber-500 text-black hover:bg-amber-400 hover:-translate-y-[1px]"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              {submitting
                ? "Submitting..."
                : txSignature
                ? "Submit Task →"
                : "Pay 0.1 SOL"}
            </button>

          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};