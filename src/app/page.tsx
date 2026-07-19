"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-[#f3f7fc] via-[#eef2f8] to-[#f4f8fc] flex items-center justify-center p-3 sm:p-6 py-6 sm:py-12 relative overflow-hidden">
      {/* High-fidelity glowing backdrop mesh */}
      <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-300/20 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "14s" }} />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] bg-blue-300/15 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "18s" }} />

      {/* Main Glass Card - Compact design to fit 100% scroll-free on mobile viewports */}
      <div className="w-full max-w-[460px] bg-white/50 backdrop-blur-3xl rounded-3xl border border-white/80 shadow-[0_15px_50px_rgba(0,0,80,0.03)] p-5 sm:p-8 relative z-10 text-center flex flex-col justify-between hover:shadow-[0_20px_60px_rgba(0,51,160,0.06)] hover:scale-[1.005] transition-all duration-300">
        
        <div>
          {/* Brand Logo Header */}
          <div className="flex justify-center mb-4">
            <div className="relative w-40 sm:w-48 h-10 hover:scale-[1.02] transition-transform duration-300">
              <Image
                src="/Cognizant_idqBwjBQXB_1.png"
                alt="Cognizant Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="h-0.5 w-12 bg-[#0033a0]/15 mx-auto mb-4" />

          {/* Typography Header */}
          <h1 className="text-xl sm:text-2xl font-black text-[#000048] tracking-tight leading-tight mb-1">
            Speech Assessment
          </h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-4">
            Candidate Practice Portal
          </p>

          <p className="text-slate-600 text-xs font-semibold leading-relaxed max-w-sm mx-auto mb-5.5">
            Evaluate spoken fluency, pronunciation accuracy, and listening comprehension in a secure environment graded by GenAI.
          </p>

          {/* Company-Grade Horizontal Syllabus Timeline */}
          <div className="space-y-2 mb-6">
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#000048]/55 block text-center">
              Assessment Structure
            </span>
            <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-500 bg-white/40 border border-white/60 p-2.5 rounded-xl backdrop-blur-md shadow-sm">
              <div className="flex flex-col items-center flex-1 border-r border-slate-200/50 py-0.5">
                <span className="text-[#0033a0] font-black text-xs">A</span>
                <span className="mt-0.5 font-bold tracking-tight text-[9px] text-slate-700">Reading</span>
              </div>
              <div className="flex flex-col items-center flex-1 border-r border-slate-200/50 py-0.5">
                <span className="text-[#0033a0] font-black text-xs">B</span>
                <span className="mt-0.5 font-bold tracking-tight text-[9px] text-slate-700">Speaking</span>
              </div>
              <div className="flex flex-col items-center flex-1 border-r border-slate-200/50 py-0.5">
                <span className="text-[#0033a0] font-black text-xs">C</span>
                <span className="mt-0.5 font-bold tracking-tight text-[9px] text-slate-700">Grammar</span>
              </div>
              <div className="flex flex-col items-center flex-1 py-0.5">
                <span className="text-[#0033a0] font-black text-xs">D</span>
                <span className="mt-0.5 font-bold tracking-tight text-[9px] text-slate-700">Listening</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA and Signature Footer */}
        <div>
          <div className="flex justify-center mb-5.5">
            <button
              onClick={handleGetStarted}
              className="group w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-[#000048] to-[#0033a0] hover:brightness-110 text-white font-bold text-xs rounded-xl transition-all shadow-[0_4px_16px_rgba(0,51,160,0.2)] hover:shadow-[0_6px_22px_rgba(0,51,160,0.35)] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
            >
              Get Started
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </div>

          <div className="border-t border-slate-200/40 pt-4 text-center">
            <span className="text-[8px] font-bold text-slate-400 tracking-[0.2em] block uppercase">
              Designed & Engineered By
            </span>
            <span 
              className="text-[#000048] text-sm font-extrabold mt-1 block tracking-wide hover:scale-[1.04] hover:text-[#0033a0] transition-all cursor-default"
              style={{ fontFamily: "'Playfair Display', Georgia, Cambria, serif", fontStyle: "italic" }}
            >
              Vinay
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
