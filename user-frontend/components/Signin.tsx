"use client";

import axios from "axios";
import { useState } from "react";

export default function Signin() {
  const [address, setAddress] = useState("");
  const [token, setToken] = useState("");

  async function handleSignin() {
    try {
      const response = await axios.post(
        "http://localhost:5000/v1/user/signin"
      );

      const jwt = response.data.token;

      setToken(jwt);
      localStorage.setItem("token", jwt);

      alert("Token saved to localStorage ✅");
    } catch (e) {
      console.log(e);
      alert("Signin failed ❌");
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="border p-6 rounded w-96">
        <div className="text-2xl mb-4">Signin</div>

        <input
          type="text"
          placeholder="Enter wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="border p-2 w-full mb-4"
        />

        <button
          onClick={handleSignin}
          className="bg-black text-white px-4 py-2 rounded w-full"
        >
          Get Token
        </button>

        {token && (
          <div className="mt-4 break-words text-sm">
            <b>Token:</b> {token}
          </div>
        )}
      </div>
    </div>
  );
}