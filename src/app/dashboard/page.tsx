"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface UserProfile {
  name: string;
  role: string;
  email: string;
  regNo?: string;
  dept?: string;
  section?: string;
}

interface AssessmentStatus {
  id: string;
  title: string;
  completed: boolean;
  score?: number;
  completedAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [assessments, setAssessments] = useState<AssessmentStatus[]>([]);
  const [greeting, setGreeting] = useState("Welcome");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    // 1. Get user profile
    const storedUser = localStorage.getItem("assessment_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const currentUser = JSON.parse(storedUser);
    setUser(currentUser);

    // Set greeting based on local hour
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // 2. Load assessments status from localStorage
    const storedAssessments = localStorage.getItem("assessments_state");
    if (!storedAssessments) {
      const initialAssessments: AssessmentStatus[] = [
        { id: "1", title: "CTS Communication Practice Assessment-1", completed: false },
        { id: "2", title: "CTS Communication Practice Assessment-2", completed: false },
        { id: "3", title: "CTS Communication Practice Assessment-3", completed: false },
      ];
      localStorage.setItem("assessments_state", JSON.stringify(initialAssessments));
      setAssessments(initialAssessments);
    } else {
      setAssessments(JSON.parse(storedAssessments));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("assessment_user");
    router.push("/");
  };

  const startAssessment = (id: string) => {
    router.push(`/assessment/${id}`);
  };

  const completedCount = assessments.filter((a) => a.completed).length;
  const availableCount = assessments.filter((a) => !a.completed).length;
  const totalCount = assessments.length;

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-[#f3f7fc] via-[#eef2f8] to-[#f4f8fc] text-slate-800 font-sans flex flex-col pb-16 relative overflow-hidden">
      {/* High-fidelity glassmorphism neon blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: "12s" }} />
      <div className="absolute top-[25%] left-[-10%] w-[35vw] h-[35vw] bg-blue-200/25 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: "16s" }} />
      <div className="absolute bottom-[-10%] right-[15%] w-[40vw] h-[40vw] bg-purple-200/20 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "14s" }} />

      {/* Glassmorphic Header */}
      <header className="w-full bg-white/45 backdrop-blur-xl border-b border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)] sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-36 h-9 hover:scale-[1.02] transition-transform">
              <Image
                src="/Cognizant_idqBwjBQXB_1.png"
                alt="Cognizant Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-[10px] font-black text-slate-400 border-l border-slate-200 pl-3 uppercase tracking-widest hidden sm:inline-block">
              Assessment Portal
            </span>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Profile Dropdown Trigger */}
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100/60 border border-slate-200/40 backdrop-blur-md transition-all cursor-pointer text-slate-700 active:scale-[0.98]"
            >
              <div className="bg-gradient-to-tr from-[#000048] to-[#0033a0] text-white font-extrabold text-[10px] w-6 h-6 flex items-center justify-center rounded-lg shadow-sm">
                {user.name[0]}
              </div>
              <span className="text-xs font-bold sm:block hidden select-none">
                My Profile
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showProfileDropdown ? "rotate-180" : ""}`}
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Dropdown Glass Card */}
            {showProfileDropdown && (
              <div className="absolute right-0 top-11 w-64 bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-[0_10px_35px_rgba(0,0,80,0.08)] p-5 z-50 animate-fadeIn text-left space-y-3.5">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Candidate</span>
                  <div className="text-xs font-black text-slate-800 tracking-wide mt-0.5">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{user.email}</div>
                </div>

                <div className="space-y-2.5 text-[10px] font-bold text-slate-500">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase tracking-widest mb-0.5">Registration No</span>
                    <span className="text-slate-800 font-extrabold">{user.regNo || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase tracking-widest mb-0.5">Department</span>
                    <span className="text-slate-800 truncate block">{user.dept || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase tracking-widest mb-0.5">Section</span>
                    <span className="text-[#0033a0] font-black">{user.section || "N/A"}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-rose-100/50"
                  >
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
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                      />
                    </svg>
                    Logout Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 w-full flex-1 relative z-10">
        
        {/* Banner Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#000048] tracking-tight mb-1">
            {greeting}, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 font-semibold text-sm">
            Access your language practice rooms and monitor speech clarity grades.
          </p>
        </div>

        {/* Profile Identity Credentials Card (Glassmorphic) */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,80,0.03)] p-6 sm:p-8 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-[0_12px_40px_rgba(0,0,80,0.06)] hover:border-white transition-all duration-300">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-slate-800">{user.name}</h2>
              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Verified Candidate
              </span>
            </div>
            <p className="text-xs text-slate-400 font-bold tracking-wide mt-1.5 uppercase">
              STUDENT ACCOUNT ({user.email})
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-3 text-xs font-bold text-slate-500 bg-white/40 border border-white/60 rounded-2xl px-6 py-4.5 w-full lg:w-auto backdrop-blur-md">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-widest mb-1">Registration No</span>
              <span className="text-slate-800 font-extrabold text-sm">{user.regNo || "N/A"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-widest mb-1">Department</span>
              <span className="text-slate-800 font-extrabold text-sm truncate max-w-[150px] block">{user.dept || "N/A"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-widest mb-1">Section Group</span>
              <span className="text-[#0033a0] font-black text-sm">{user.section || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Stats Section (Glassmorphic) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Card 1: Available */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,80,0.03)] p-6 flex items-center justify-between hover:translate-y-[-3px] hover:shadow-[0_12px_28px_rgba(0,0,80,0.06)] hover:border-white transition-all duration-300">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Available Tests
              </div>
              <div className="text-4xl font-black text-slate-800">
                {availableCount}
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-500/15">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Card 2: Completed */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,80,0.03)] p-6 flex items-center justify-between hover:translate-y-[-3px] hover:shadow-[0_12px_28px_rgba(0,0,80,0.06)] hover:border-white transition-all duration-300">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Completed Tests
              </div>
              <div className="text-4xl font-black text-slate-800">
                {completedCount}
              </div>
            </div>
            <div className="w-12 h-12 bg-indigo-500/10 text-[#0033a0] rounded-2xl flex items-center justify-center border border-indigo-500/15">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Card 3: Total assigned */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,80,0.03)] p-6 flex items-center justify-between hover:translate-y-[-3px] hover:shadow-[0_12px_28px_rgba(0,0,80,0.06)] hover:border-white transition-all duration-300">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Total Exams
              </div>
              <div className="text-4xl font-black text-slate-800">
                {totalCount}
              </div>
            </div>
            <div className="w-12 h-12 bg-white/80 text-[#000048] rounded-2xl flex items-center justify-center border border-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Assessments Section (Glassmorphic Container) */}
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,80,0.03)] p-6 sm:p-8">
          <div className="mb-6 pb-4 border-b border-white/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">
                Assigned Evaluations
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Select a practice room to begin evaluation
              </p>
            </div>
            <span className="text-[9px] font-extrabold text-[#0033a0] bg-indigo-50 border border-indigo-100/50 px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
              Term: 2027 Eligibility
            </span>
          </div>

          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="p-5 border border-white/60 bg-white/40 rounded-2xl hover:shadow-[0_8px_24px_rgba(0,0,80,0.04)] hover:bg-white/85 hover:border-white transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                      {assessment.title}
                    </h3>
                    <span className="text-[9px] font-extrabold text-[#6f42c1] bg-[#f1edfb] px-2 py-0.5 rounded-md uppercase tracking-wide">
                      SpeechX - Mettl
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                        assessment.completed
                          ? "text-blue-600 bg-blue-50/60 border border-blue-100/50"
                          : "text-emerald-600 bg-emerald-50/60 border border-emerald-100/50"
                      }`}
                    >
                      {assessment.completed ? "Completed" : "Available"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-400 font-semibold">
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      Format: speechx-mettl
                    </div>
                    <div className="text-slate-300">•</div>
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zM14.25 15h.008v.008H14.25V15zm0 2.25h.008v.008H14.25v-.008zM16.5 15h.008v.008H16.5V15zm0 2.25h.008v.008H16.5v-.008z" />
                      </svg>
                      Valid until: 7/20/2026
                    </div>
                    {assessment.completed && assessment.score !== undefined && (
                      <>
                        <div className="text-slate-300">•</div>
                        <div className="text-[#0033a0] font-black flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-indigo-500">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.687-3.04a.75.75 0 011.08 1.05l-3.94 4.05a.75.75 0 01-1.08 0l-1.94-2a.75.75 0 111.08-1.04l1.4 1.45 3.4-3.51z" clipRule="evenodd" />
                          </svg>
                          Grade: {assessment.score.toFixed(1)}/10
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {assessment.completed ? (
                    <button
                      onClick={() => startAssessment(assessment.id)}
                      className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-[#0033a0] bg-indigo-500/10 hover:bg-[#0033a0]/15 border border-indigo-500/20 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      View Full Report
                    </button>
                  ) : (
                    <button
                      onClick={() => startAssessment(assessment.id)}
                      className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-white bg-gradient-to-r from-[#0033a0] to-[#0f62fe] hover:brightness-110 rounded-xl transition-all shadow-[0_4px_16px_rgba(15,98,254,0.25)] hover:shadow-[0_6px_22px_rgba(15,98,254,0.4)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Start Assessment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic developer certification badge footer */}
        <div className="mt-14 text-center border-t border-slate-200/40 pt-8 max-w-md mx-auto">
          <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] block uppercase">
            Designed & Engineered By
          </span>
          <span 
            className="text-[#000048] text-base font-extrabold mt-1.5 block hover:scale-105 transition-transform cursor-default"
            style={{ fontFamily: "'Playfair Display', Georgia, Cambria, serif", fontStyle: "italic" }}
          >
            Vinay
          </span>
          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
            Corporate Assessment Solutions Provider
          </p>
        </div>
      </main>
    </div>
  );
}
