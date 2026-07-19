"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import studentData from "../../lib/studentDatabase.json";

interface StudentRecord {
  email: string;
  name: string;
  regNo: string;
  dept: string;
  section: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [regNo, setRegNo] = useState("");
  const [dept, setDept] = useState("Computer Science & Engineering");
  const [section, setSection] = useState("Section-A");
  const [studentName, setStudentName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [isFound, setIsFound] = useState(false);

  // Trigger search lookup manually upon clicking "Verify Email" or pressing Enter
  const handleVerifyEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSearching(true);
    setIsFound(false);
    setError("");

    setTimeout(() => {
      const match = (studentData as StudentRecord[]).find(
        (s) => s.email.toLowerCase() === cleanEmail
      );

      if (match) {
        setRegNo(match.regNo);
        setDept(match.dept);
        setSection(match.section);
        setStudentName(match.name);
        setIsFound(true);
        setError("");
      } else {
        setIsFound(false);
        setRegNo("");
        setStudentName("");
        setError("Email address not found in the official candidate eligibility registry.");
      }
      setIsSearching(false);
    }, 1000); // 1000ms database lookup simulation
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFound) {
      handleVerifyEmail();
      return;
    }
    
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      localStorage.setItem(
        "assessment_user",
        JSON.stringify({
          name: studentName,
          role: "USER",
          email: email,
          regNo: regNo,
          dept: dept,
          section: section,
        })
      );
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-[#f3f7fc] via-[#eef2f8] to-[#f4f8fc] flex items-center justify-center p-3 sm:p-6 py-6 sm:py-12 relative overflow-hidden">
      {/* High-fidelity glassmorphism neon blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-indigo-200/25 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: "12s" }} />
      <div className="absolute bottom-[-10%] left-[-5%] w-[45vw] h-[45vw] bg-blue-200/20 rounded-full blur-[110px] pointer-events-none animate-pulse" style={{ animationDuration: "15s" }} />

      <div className="w-full max-w-[480px] bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_12px_45px_rgba(0,0,80,0.03)] p-6 sm:p-8 relative z-10 hover:shadow-[0_15px_50px_rgba(0,0,80,0.05)] transition-all duration-300">
        
        {/* Cognizant Header */}
        <div className="flex flex-col items-center text-center mb-5 border-b border-slate-100/80 pb-4">
          <div className="mb-3 relative w-40 h-10 hover:scale-[1.02] transition-transform">
            <Image
              src="/Cognizant_idqBwjBQXB_1.png"
              alt="Cognizant Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-black text-[#000048] tracking-tight">
            Verify Registration
          </h1>
          <p className="text-slate-400 text-[10px] sm:text-xs font-bold mt-0.5">
            Hi! please login with your credentials
          </p>
        </div>

        <form onSubmit={isFound ? handleSignIn : handleVerifyEmail} className="space-y-4">
          {error && !isSearching && (
            <div className="p-3 text-[10px] sm:text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-[10px] font-bold text-[#000048] uppercase tracking-wider mb-1.5"
            >
              Registered Email ID
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="Enter your registered email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isFound) setIsFound(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0033a0]/15 focus:border-[#0033a0] text-xs transition-all"
                required
              />
            </div>
            
            {/* Real-time Loading and Success Indicators */}
            {isSearching && (
              <div className="text-[9px] text-[#0033a0] font-bold mt-1.5 flex items-center gap-1.5 animate-pulse">
                <div className="w-2.5 h-2.5 border border-[#0033a0] border-t-transparent rounded-full animate-spin" />
                Querying candidate eligibility registry...
              </div>
            )}
            
            {isFound && !isSearching && (
              <div className="text-[9px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
                Record found & loaded from candidate database!
              </div>
            )}
          </div>

          {/* Student Profile Info Section (Frosted Glass ID layout) */}
          {isFound && !isSearching && (
            <div className="border border-white/80 bg-white/40 backdrop-blur-md rounded-2xl p-4.5 space-y-3.5 animate-fadeIn shadow-inner">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#000048]/60 block mb-1">
                Candidate Credentials
              </span>

              <div>
                <label
                  htmlFor="name"
                  className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-0.5"
                >
                  Candidate Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={studentName}
                  disabled
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200/50 bg-white/30 text-slate-600 text-[11px] font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label
                    htmlFor="regNo"
                    className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-0.5"
                  >
                    Reg No
                  </label>
                  <input
                    id="regNo"
                    type="text"
                    value={regNo}
                    disabled
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200/50 bg-white/30 text-slate-600 text-[11px] font-bold focus:outline-none"
                  />
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="dept"
                    className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-0.5"
                  >
                    Dept
                  </label>
                  <input
                    id="dept"
                    type="text"
                    value={dept}
                    disabled
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200/50 bg-white/30 text-slate-600 text-[11px] font-bold focus:outline-none text-ellipsis overflow-hidden"
                  />
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="section"
                    className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-0.5"
                  >
                    Section
                  </label>
                  <input
                    id="section"
                    type="text"
                    value={section}
                    disabled
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200/50 bg-white/30 text-[#0033a0] text-[11px] font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-1.5">
            {!isFound ? (
              <button
                type="button"
                onClick={() => handleVerifyEmail()}
                disabled={isSearching || !email.trim()}
                className="w-full py-3 bg-gradient-to-r from-[#000048] to-[#0033a0] hover:brightness-115 text-white font-bold rounded-xl transition-all shadow-[0_4px_16px_rgba(0,51,160,0.2)] hover:shadow-[0_6px_22px_rgba(0,51,160,0.35)] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold rounded-xl transition-all shadow-[0_4px_16px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.35)] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>
            )}
          </div>
        </form>

        {/* Signature */}
        <div className="mt-6 border-t border-slate-200/40 pt-4 text-center">
          <span className="text-[8px] font-bold text-slate-400 tracking-[0.2em] block uppercase">
            Designed & Engineered By
          </span>
          <span 
            className="text-[#000048] text-sm font-extrabold mt-1 block tracking-wide hover:scale-105 transition-transform cursor-default"
            style={{ fontFamily: "'Playfair Display', Georgia, Cambria, serif", fontStyle: "italic" }}
          >
            Vinay
          </span>
          <p className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
            Corporate Assessment Solutions Provider
          </p>
        </div>

      </div>
    </div>
  );
}
