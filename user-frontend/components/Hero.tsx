export const Hero = () => {
  return (
    <section className="min-h-[calc(100vh-64px)] bg-[#0a0a0c] flex items-center justify-center relative overflow-hidden">
      
      {/* Glow Background */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />

      <div className="text-center max-w-[780px] px-8 py-16 relative z-10 animate-[fadeUp_0.8s_ease_forwards]">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium tracking-wider uppercase mb-8">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
          Data Labeling Platform
        </div>

        {/* Heading */}
        <h1 className="font-serif text-[clamp(3rem,7vw,5.5rem)] leading-tight text-zinc-100 tracking-tight mb-5">
          Get your data <br />
          <span className="text-amber-400 italic">labelled, fast.</span>
        </h1>

        {/* Description */}
        <p className="text-[1.05rem] leading-relaxed text-white/50 font-light">
          Connect your wallet, upload your images, and create labeling tasks easily.
          Our decentralized workforce ensures fast, scalable, and high-quality results.
        </p>

      </div>

      <style jsx>{`
        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};