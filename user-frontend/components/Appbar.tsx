"use client";

import {
  WalletDisconnectButton,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/utils";

export const Appbar = () => {
  const { publicKey, signMessage } = useWallet();

  async function signAndSend() {
    if (!publicKey) return;

    const message = new TextEncoder().encode(
      "Sign into Decentralized Fiverr"
    );

    const signature = await signMessage?.(message);

    const response = await axios.post(
      `${BACKEND_URL}/v1/user/signin`,
      {
        signature: Array.from(signature || []),
        publicKey: publicKey.toString(),
      }
    );

    localStorage.setItem("token", response.data.token);
  }

  useEffect(() => {
    signAndSend();
  }, [publicKey]);

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0c]/85 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-xl text-amber-400">◈</span>
          <span className="text-[1.35rem] text-zinc-100 tracking-tight font-serif">
            DFiver
          </span>
        </div>

        {/* Wallet */}
        <div className="flex items-center">
          {publicKey ? (
            <WalletDisconnectButton className="!bg-white/10 !text-white !rounded-full !px-4 !py-2 hover:!bg-white/20" />
          ) : (
            <WalletMultiButton className="!bg-amber-500 !text-black !rounded-full !px-5 !py-2 hover:!bg-amber-400" />
          )}
        </div>
      </div>
    </header>
  );
};