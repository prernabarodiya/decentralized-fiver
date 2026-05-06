"use client";

import {
  WalletDisconnectButton,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/utils";

export const Appbar = () => {
  const { publicKey, signMessage } = useWallet();

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const signAndSend = async () => {
      if (!publicKey || !signMessage) return;

      try {
        const message = new TextEncoder().encode(
          "Sign into Decentralized Fiverr as a worker"
        );
        const signature = await signMessage(message);

        const response = await axios.post(`${BACKEND_URL}/v1/worker/signin`, {
          signature: Array.from(signature || []),
          publicKey: publicKey.toString()
        });

        setBalance(response.data.amount);
        localStorage.setItem("token", response.data.token);
      } catch (error) {
        console.error(error);
      }
    };

    signAndSend();
  }, [publicKey, signMessage]);

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-xl">◈</span>
          <span className="text-zinc-100 text-xl font-serif tracking-tight">
            DFiver Worker
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* Pay Button */}
          <button
            disabled={loading}
            onClick={async () => {
              try {
                setLoading(true);
                await axios.post(
                  `${BACKEND_URL}/v1/worker/payout`,
                  {},
                  {
                    headers: {
                      Authorization: localStorage.getItem("token")
                    }
                  }
                );
              } catch (e) {
                console.error(e);
              } finally {
                setLoading(false);
              }
            }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2
              ${loading
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : "bg-amber-500 text-black hover:bg-amber-400 hover:-translate-y-[1px]"
              }`}
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              <>Pay ({balance}) →</>
            )}
          </button>

          {/* Wallet */}
          <div className="scale-90">
            {publicKey ? <WalletDisconnectButton /> : <WalletMultiButton />}
          </div>

        </div>
      </div>
    </header>
  );
};


// "use client"
// import {
//     WalletModalProvider,
//     WalletDisconnectButton,
//     WalletMultiButton
// } from '@solana/wallet-adapter-react-ui';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { BACKEND_URL } from '@/utils';

// // export const Appbar = () => {
// //   const { publicKey, signMessage } = useWallet();
// //   const [balance, setBalance] = useState(0);

// //   useEffect(() => {
// //     const signAndSend = async () => {
// //       if (!publicKey || !signMessage) {
// //         return;
// //       }
// //       try {
// //         const message = new TextEncoder().encode("Sign into Decentralized Fiverr as a worker");
// //         const signature = await signMessage(message);
// //         console.log(signature);
// //         console.log(publicKey);
        
// //         const response = await axios.post(`${BACKEND_URL}/v1/worker/signin`, {
// //           signature: Array.from(signature || []),
// //           publicKey: publicKey.toString()
// //         });

// //         setBalance(response.data.amount);
// //         localStorage.setItem("token", response.data.token);
// //       } catch (error) {
// //         console.error("Sign and send error:", error);
// //       }
// //     };

// //     signAndSend();
// //   }, [publicKey, signMessage]);

// //   return (
// //     <div className="flex justify-between border-b pb-2 pt-2 bg-red-400 text-black-300 ">
// //       <div className="text-2xl pl-4 flex justify-center pt-3 ">
// //         DFiver
// //       </div>

// //       <div className="text-2xl pr-4 flex justify-center pt-3 ">
// //         <button 
// //           onClick={() => {
// //             axios.post(`${BACKEND_URL}/v1/worker/payout`, {}, {
// //               headers: {
// //                 "Authorization": localStorage.getItem("token")
// //               }
// //             })
// //           }} 
// //           className="mt-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none 
// //             focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800
// //             dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
// //         >
// //           Pay me out({balance})
// //         </button>
// //         {publicKey ? <WalletDisconnectButton /> : <WalletMultiButton />}
// //       </div>
// //     </div>
// //   );
// // }

// export const Appbar = () => {
//   const { publicKey, signMessage } = useWallet();

//   const [balance, setBalance] = useState(0);
//   const [loading, setLoading] = useState(false); // ✅ ADD THIS

//   useEffect(() => {
//     const signAndSend = async () => {
//       if (!publicKey || !signMessage) return;

//       try {
//         const message = new TextEncoder().encode(
//           "Sign into Decentralized Fiverr as a worker"
//         );
//         const signature = await signMessage(message);

//         const response = await axios.post(`${BACKEND_URL}/v1/worker/signin`, {
//           signature: Array.from(signature || []),
//           publicKey: publicKey.toString()
//         });

//         setBalance(response.data.amount);
//         localStorage.setItem("token", response.data.token);
//       } catch (error) {
//         console.error("Sign and send error:", error);
//       }
//     };

//     signAndSend();
//   }, [publicKey, signMessage]);

//   return (
//     <div className="flex justify-between border-b pb-2 pt-2 bg-red-400 text-black-300">
//       <div className="text-2xl pl-4 flex justify-center pt-3">
//         DFiver
//       </div>

//       <div className="text-2xl pr-4 flex justify-center pt-3">
//         <button
//           disabled={loading} // ✅ works now
//           onClick={async () => {
//             try {
//               setLoading(true); // ✅ works now
//               await axios.post(`${BACKEND_URL}/v1/worker/payout`, {}, {
//                 headers: {
//                   Authorization: localStorage.getItem("token")
//                 }
//               });
//             } catch (e) {
//               console.error(e);
//             } finally {
//               setLoading(false); // ✅ works now
//             }
//           }}
//           className="mt-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none 
//           focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
//         >
//           {loading ? "Processing..." : `Pay me out (${balance})`}
//         </button>

//         {publicKey ? <WalletDisconnectButton /> : <WalletMultiButton />}
//       </div>
//     </div>
//   );
// };

// //******************************************** */

// // "use client";
// // import Link from "next/link";
// // import { useState } from "react";

// // export const Appbar = () => {
// //   const [connected, setConnected] = useState(false);

// //   return (
// //     <header className="sticky top-0 z-50 bg-black/85 backdrop-blur-xl border-b border-white/10">
// //       <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">

// //         {/* Brand */}
// //         <Link
// //           href="/"
// //           className="flex items-center gap-2 hover:opacity-80 transition"
// //         >
// //           <span className="text-xl text-amber-400 leading-none">◈</span>
// //           <span className="text-[1.35rem] text-zinc-100 tracking-tight font-serif">
// //             DFiver
// //           </span>
// //         </Link>

// //         {/* Wallet */}
// //         {!connected ? (
// //           <button
// //             onClick={() => setConnected(true)}
// //             className="flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition transform hover:-translate-y-[1px]"
// //           >
// //             Connect Wallet
// //             <span className="text-base transition group-hover:translate-x-1">
// //               →
// //             </span>
// //           </button>
// //         ) : (
// //           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-zinc-200 text-sm">
// //             <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
// //             5BSM...nn2x
// //           </div>
// //         )}

// //       </div>
// //     </header>
// //   );
// // };


// // export const Appbar = () =>{

// //   return (
// //     <div className="flex justify-between border-b pb-2 pt-2 bg-red-400 text-black-300 ">
// //         <div className="text-2xl pl-4 flex justify-center pt-3 ">
// //             DFiver (Worker)
// //         </div>
// //         <div className="text-2xl pr-4 flex justify-center pt-3 ">
// //             Connect Wallet
// //         </div>
// //     </div>
// //   );
// // }

// //**************************************************************** */

// // "use client";
// // import Link from "next/link";
// // import { useState } from "react";

// // export const Appbar = () => {
// //   const [connected, setConnected] = useState(false);

// //   return (
// //     <header className="sticky top-0 z-50 bg-black/85 backdrop-blur-xl border-b border-white/10">
// //       <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">

// //         {/* Brand */}
// //         <Link
// //           href="/"
// //           className="flex items-center gap-2 hover:opacity-80 transition"
// //         >
// //           <span className="text-xl text-amber-400 leading-none">◈</span>
// //           <span className="text-[1.35rem] text-zinc-100 tracking-tight font-serif">
// //             DFiver
// //           </span>
// //         </Link>

// //         {/* Wallet */}
// //         {!connected ? (
// //           <button
// //             onClick={() => setConnected(true)}
// //             className="flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition transform hover:-translate-y-[1px]"
// //           >
// //             Connect Wallet
// //             <span className="text-base transition group-hover:translate-x-1">
// //               →
// //             </span>
// //           </button>
// //         ) : (
// //           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-zinc-200 text-sm">
// //             <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
// //             5BSM...nn2x
// //           </div>
// //         )}

// //       </div>
// //     </header>
// //   );
// // };