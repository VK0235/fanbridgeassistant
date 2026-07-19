"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen w-full bg-[#f3f6fa] flex items-center justify-center p-3 sm:p-6 py-6 sm:py-12 relative overflow-hidden">
      {/* Decorative corporate gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] bg-[#000048]/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-[#0033a0]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Main card - optimized for mobile screen heights */}
      <div className="w-full max-w-[560px] bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,80,0.04)] p-5 sm:p-10 relative z-10 text-center flex flex-col justify-between">
        
        <div>
          {/* Cognizant Logo - responsive size */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative w-44 sm:w-56 h-10 sm:h-12">
              <Image
                src="/Cognizant_idqBwjBQXB_1.png"
                alt="Cognizant Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="w-1.5 h-1.5 rounded-full bg-[#0033a0] mx-auto mb-3" />

          {/* Heading - text-xl/2xl on mobile, text-3xl on desktop */}
          <h1 className="text-xl sm:text-3xl font-black text-[#000048] tracking-tight leading-tight mb-1">
            Speech Assessment
          </h1>
          <p className="text-slate-400 font-bold text-[9px] sm:text-xs uppercase tracking-widest mb-4">
            Practice room evaluation portal
          </p>

          {/* Shorter description to avoid mobile overflow */}
          <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto mb-5">
            Evaluate speaking clarity, sentence repetitions, and grammatical control using automated AI speech grading.
          </p>

          {/* Compact assessment structure overview */}
          <div className="border border-slate-100 bg-[#f9fafc] rounded-xl p-3.5 text-left mb-6">
            <h3 className="text-[9px] font-extrabold uppercase tracking-wider text-[#000048]/60 border-b border-slate-150 pb-1.5 mb-2.5">
              Evaluation structure
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-[#0033a0]/5 text-[#0033a0] font-black text-[9px] flex items-center justify-center shrink-0">
                  A
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 text-[10px] leading-tight">Reading & Repeat</p>
                  <p className="text-[8px] text-slate-400 font-bold">16 mins</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-[#0033a0]/5 text-[#0033a0] font-black text-[9px] flex items-center justify-center shrink-0">
                  B
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 text-[10px] leading-tight">Spontaneous Speech</p>
                  <p className="text-[8px] text-slate-400 font-bold">7 mins</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-[#0033a0]/5 text-[#0033a0] font-black text-[9px] flex items-center justify-center shrink-0">
                  C
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 text-[10px] leading-tight">Grammar & Syntax</p>
                  <p className="text-[8px] text-slate-400 font-bold">20 mins</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-[#0033a0]/5 text-[#0033a0] font-black text-[9px] flex items-center justify-center shrink-0">
                  D
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 text-[10px] leading-tight">Comprehension</p>
                  <p className="text-[8px] text-slate-400 font-bold">15 mins</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA and Signature Footer */}
        <div>
          <div className="flex justify-center mb-5">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-3 bg-[#000048] hover:bg-[#000033] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              Get Started
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3 text-center">
            <span className="text-[8px] font-bold text-slate-400 tracking-[0.15em] block uppercase">
              Developed by
            </span>
            <span 
              className="text-[#000048] text-sm font-extrabold mt-0.5 block tracking-wide hover:scale-105 transition-transform cursor-default"
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
