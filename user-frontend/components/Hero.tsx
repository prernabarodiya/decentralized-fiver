
export const Hero = () => {
    return <div className="text-black pt-10">
        <div className="text-2xl flex justify-center">
            Welcome to DFiver
        </div>
        <div className="text-lg flex justify-center pt-8">
            Your one stop destination to getting your data labelled
        </div>
    </div>
}

//********************************************************* */

// export const Hero = () => {
//   return (
//     <section className="min-h-[calc(100vh-64px)] bg-black flex items-center justify-center relative overflow-hidden">
      
//       {/* Glow Background */}
//       <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />

//       <div className="text-center max-w-[780px] px-8 py-16 relative z-10">

//         {/* Badge */}
//         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium tracking-wider uppercase mb-8 animate-[fadeUp_0.6s_ease_forwards]">
//           <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
//           Data Labeling Platform
//         </div>

//         {/* Heading */}
//         <h1 className="text-[clamp(3rem,7vw,5.5rem)] leading-tight text-zinc-100 tracking-tight font-serif mb-5 animate-[fadeUp_0.8s_ease_forwards]">
//           Get your data <br />
//           <span className="text-amber-400 italic">labelled, fast.</span>
//         </h1>

//         {/* Subtext */}
//         <p className="text-[1.05rem] leading-relaxed text-white/50 font-light animate-[fadeUp_1s_ease_forwards]">
//           Your one stop destination to getting your data labelled.
//         </p>

//       </div>

//       {/* Animation keyframes (Tailwind custom) */}
//       <style jsx>{`
//         @keyframes fadeUp {
//           0% {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           100% {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </section>
//   );
// };