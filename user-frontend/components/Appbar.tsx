"use client"
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '@/utils';

export const Appbar = () =>{

  const { publicKey, signMessage} = useWallet();
  async function signAndSend() {
    if(!publicKey){
      return;
    }
    const message = new TextEncoder().encode("Sign into Decentralized Fiverr");
    const signature = await signMessage?.(message);
    console.log(message);
    console.log(signature);

    const response = await axios.post(`${BACKEND_URL}/v1/user/signin`, {
      signature: Array.from(signature || []),
      publicKey: publicKey?.toString()
    });
    
    localStorage.setItem("token", response.data.token);
  }

  useEffect(()=> {
    signAndSend()
  }, [publicKey]);

  return (
    <div className="flex justify-between border-b pb-2 pt-2 bg-red-400 text-black-300 ">
        <div className="text-2xl pl-4 flex justify-center pt-3 ">
            DFiver
        </div>
        <div className="text-2xl pr-4 flex justify-center pt-3 ">

            {publicKey ? <WalletDisconnectButton /> : <WalletMultiButton />}
            
        </div>
    </div>
  );
}

//******************************************** */

// "use client";
// import Link from "next/link";
// import { useState } from "react";

// export const Appbar = () => {
//   const [connected, setConnected] = useState(false);

//   return (
//     <header className="sticky top-0 z-50 bg-black/85 backdrop-blur-xl border-b border-white/10">
//       <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">

//         {/* Brand */}
//         <Link
//           href="/"
//           className="flex items-center gap-2 hover:opacity-80 transition"
//         >
//           <span className="text-xl text-amber-400 leading-none">◈</span>
//           <span className="text-[1.35rem] text-zinc-100 tracking-tight font-serif">
//             DFiver
//           </span>
//         </Link>

//         {/* Wallet */}
//         {!connected ? (
//           <button
//             onClick={() => setConnected(true)}
//             className="flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition transform hover:-translate-y-[1px]"
//           >
//             Connect Wallet
//             <span className="text-base transition group-hover:translate-x-1">
//               →
//             </span>
//           </button>
//         ) : (
//           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-zinc-200 text-sm">
//             <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
//             5BSM...nn2x
//           </div>
//         )}

//       </div>
//     </header>
//   );
// };