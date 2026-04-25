"use client";
 import { Appbar } from "@/components/Appbar";
 import { Hero } from "@/components/Hero";
import { UploadImage } from "@/components/UploadImage";
import { Upload } from "@/components/Upload";
import Signin from "@/components/Signin"
// import { UploadImage } from "@/components/UploadImage";
//import Image from "next/image";
//import { useState } from "react";

export default function Home() {

  return (
    <main>
{/* <Signin/> */}
      
      <Appbar />
      <Hero />
      
      <Upload />
    </main>
  );
}