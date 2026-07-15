"use client";

import { useState, useEffect, useRef } from "react";

interface VenueSummary {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  intent?: string;
  cached?: boolean;
}

export default function Page() {
  // Config state
  const [venues, setVenues] = useState<VenueSummary[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>("metlife");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [userMode, setUserMode] = useState<string>("fan");
  const [activeMobileTab, setActiveMobileTab] = useState<"dashboard" | "chat">("dashboard");

  // Dashboard state
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(true);

  // Chat state
  const [chatInput, setChatInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
  const [detectedIntent, setDetectedIntent] = useState<string>("");

  // Audio / Speech state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechError, setSpeechError] = useState<string>("");

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sound synthesis
  const speakMessage = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      English: "en-US",
      Spanish: "es-MX",
      French: "fr-FR",
      Portuguese: "pt-BR",
      German: "de-DE",
      Italian: "it-IT",
      Telugu: "te-IN",
      Hindi: "hi-IN",
      Japanese: "ja-JP",
      Korean: "ko-KR",
      "Mandarin Chinese": "zh-CN",
      Russian: "ru-RU",
      Turkish: "tr-TR",
    };
    utterance.lang = langMap[selectedLanguage] || "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          setChatInput(resultText);
          setIsRecording(false);
        };
        recog.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setSpeechError(`Voice input error: ${event.error}`);
          setIsRecording(false);
          setTimeout(() => setSpeechError(""), 3000);
        };
        recog.onend = () => {
          setIsRecording(false);
        };
        setRecognition(recog);
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      setSpeechError("Speech recognition is not supported in this browser.");
      setTimeout(() => setSpeechError(""), 3000);
      return;
    }
    if (isRecording) {
      recognition.stop();
    } else {
      setSpeechError("");
      setIsRecording(true);
      const langMap: Record<string, string> = {
        English: "en-US",
        Spanish: "es-MX",
        French: "fr-FR",
        Portuguese: "pt-BR",
        German: "de-DE",
        Italian: "it-IT",
        Telugu: "te-IN",
        Hindi: "hi-IN",
        Japanese: "ja-JP",
        Korean: "ko-KR",
        "Mandarin Chinese": "zh-CN",
        Russian: "ru-RU",
        Turkish: "tr-TR",
      };
      recognition.lang = langMap[selectedLanguage] || "en-US";
      recognition.start();
    }
  };

  // Initial welcome message
  useEffect(() => {
    let welcome = "";
    if (userMode === "fan") {
      welcome = "Welcome to FIFA World Cup 2026! I'm your FanBridge AI companion. How can I help you find your seat, check gate wait times, or locate accessible transit today?";
    } else if (userMode === "volunteer") {
      welcome = "FanBridge Volunteer Hub active. Use this console to monitor zone densities, guide crowd flows, and coordinate with venue operations. Ask me about volunteer post deployments or active staff alerts.";
    } else if (userMode === "staff") {
      welcome = "FanBridge OpsAI interface loaded. Monitoring real-time stadium metrics. Recommending staffing actions for congested areas. Ask me about specific zone status or incident protocols.";
    } else {
      welcome = "FanBridge Command Center online. Aggregate venue analytics and alert logs active. Recommending macro event adjustments. How can I support event coordination?";
    }
    setMessages([{ role: "assistant", content: welcome }]);
  }, [userMode]);

  // Load venues and languages list
  useEffect(() => {
    fetch("/api/venues")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVenues(data);
      })
      .catch((err) => console.error("Error loading venues:", err));

    fetch("/api/languages")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLanguages(data);
      })
      .catch((err) => console.error("Error loading languages:", err));
  }, []);

  // Fetch dashboard data
  const fetchDashboard = (venueId: string, silent = false) => {
    if (!silent) setIsLoadingDashboard(true);
    fetch(`/api/dashboard/${venueId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setDashboard(data);
      })
      .catch((err) => console.error("Error fetching dashboard:", err))
      .finally(() => {
        if (!silent) setIsLoadingDashboard(false);
      });
  };

  useEffect(() => {
    fetchDashboard(selectedVenue);
    const timer = setInterval(() => {
      fetchDashboard(selectedVenue, true);
    }, 8000);
    return () => clearInterval(timer);
  }, [selectedVenue]);

  // Auto-scroll chat via container scroll bounds
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = chatInput.trim();
    if (!query || isLoadingChat) return;

    const userMsg: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsLoadingChat(true);
    setDetectedIntent("");

    const historyPayload = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          language: selectedLanguage,
          history: historyPayload,
          venue_id: selectedVenue,
          user_mode: userMode,
        }),
      });

      const result = await response.json();
      if (response.ok && !result.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: result.reply,
            intent: result.detected_intent,
            cached: result.cached,
          },
        ]);
        setDetectedIntent(result.detected_intent);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${result.error || "Failed to contact system server."}`,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Assistant is temporarily unavailable. Please check your Groq API key.",
        },
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Multilingual Semantic Concourse Mapping
  const getZoneByName = (blueprintName: string) => {
    if (!dashboard || !dashboard.crowd_zones) return null;
    return dashboard.crowd_zones.find((z: any) => {
      const name = z.zone.toLowerCase();
      if (blueprintName === "North") {
        return name.includes("north") || name.includes("norte") || name.includes("explanada n");
      }
      if (blueprintName === "South") {
        return name.includes("south") || name.includes("sur");
      }
      if (blueprintName === "East") {
        return name.includes("east") || name.includes("oriente") || name.includes("corredor o");
      }
      if (blueprintName === "West") {
        return name.includes("west") || name.includes("poniente") || name.includes("plaza p");
      }
      if (blueprintName === "Level 2") {
        return name.includes("level 2") || name.includes("pasillo") || name.includes("central");
      }
      if (blueprintName === "Upper Bowl") {
        return name.includes("upper") || name.includes("rampa") || name.includes("bridge") || name.includes("tunnel");
      }
      return false;
    });
  };

  const getZoneColor = (blueprintName: string) => {
    const zone = getZoneByName(blueprintName);
    if (!zone) return "rgba(203, 213, 225, 0.25)";
    switch (zone.density.toLowerCase()) {
      case "critical":
        return "rgba(239, 68, 68, 0.3)";
      case "high":
        return "rgba(249, 115, 22, 0.25)";
      case "medium":
        return "rgba(245, 158, 11, 0.2)";
      default:
        return "rgba(16, 185, 129, 0.15)";
    }
  };

  const getZoneStroke = (blueprintName: string) => {
    const zone = getZoneByName(blueprintName);
    if (!zone) return "#cbd5e1";
    switch (zone.density.toLowerCase()) {
      case "critical":
        return "#ef4444";
      case "high":
        return "#f97316";
      case "medium":
        return "#f59e0b";
      default:
        return "#10b981";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-750 border border-red-200/60 animate-pulse";
      case "medium":
        return "bg-amber-50 text-amber-750 border border-amber-200/60";
      default:
        return "bg-blue-50 text-blue-755 border border-blue-100";
    }
  };

  const getDensityBadge = (density: string) => {
    switch (density.toLowerCase()) {
      case "critical":
        return "bg-red-50 text-red-700 border border-red-200/60 rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase";
      case "high":
        return "bg-orange-50 text-orange-700 border border-orange-200/60 rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase";
      case "medium":
        return "bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase";
      default:
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase";
    }
  };

  const getWaitStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "critical":
        return "bg-red-50 text-red-700 border border-red-200/50 rounded-full px-2.5 py-0.5 text-[9px] font-bold";
      case "high":
        return "bg-orange-50 text-orange-700 border border-orange-200/50 rounded-full px-2.5 py-0.5 text-[9px] font-bold";
      case "medium":
        return "bg-amber-50 text-amber-700 border border-amber-200/50 rounded-full px-2.5 py-0.5 text-[9px] font-bold";
      default:
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-full px-2.5 py-0.5 text-[9px] font-bold";
    }
  };

  const getPersonaLabel = (mode: string) => {
    switch (mode) {
      case "staff":
        return "Venue Staff Console";
      case "volunteer":
        return "Volunteer Hub";
      case "organizer":
        return "Organizer Analytics";
      default:
        return "Fan Assistant";
    }
  };

  const getEcoPercentage = () => {
    if (selectedVenue === "metlife") return { carbon: 85, solar: 40 };
    if (selectedVenue === "sofi") return { carbon: 90, solar: 25 };
    return { carbon: 80, solar: 30 };
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f8fa] text-slate-700 font-sans flex flex-col relative select-none pb-6">
      {/* Background Soft Blobs to show off Glassmorphism */}
      <div className="absolute top-[-150px] left-[-150px] w-[450px] h-[450px] bg-sky-300/20 rounded-full blur-[110px] pointer-events-none animate-soft-pulse" />
      <div className="absolute top-[25%] right-[25%] w-[600px] h-[600px] bg-indigo-300/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-emerald-300/15 rounded-full blur-[110px] pointer-events-none animate-soft-pulse" />
      <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] bg-rose-200/15 rounded-full blur-[100px] pointer-events-none animate-soft-pulse" />

      {/* Main Header (Floating Glass Card - Responsive heights) */}
      <header className="min-h-16 py-3 shrink-0 border border-white/50 bg-white/60 backdrop-blur-md px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between mx-4 sm:mx-6 mt-4 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.015)] z-10 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-650 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">
              FanBridge AI
            </h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Stadium Operations Companion
            </p>
          </div>
        </div>

        {/* Configurations selector panel (Fully responsive wrap-grids) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 w-full md:w-auto">
          {/* Venue Selector */}
          <div className="flex items-center bg-white/40 border border-white/60 rounded-xl p-1 shadow-sm backdrop-blur-sm shrink-0">
            <span className="text-[8px] text-slate-450 px-1 font-extrabold uppercase">Stadium</span>
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="bg-transparent text-[10px] sm:text-xs text-slate-700 outline-none pr-2 py-0.5 font-bold cursor-pointer"
            >
              {venues.length > 0 ? (
                venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))
              ) : (
                <option value="metlife">MetLife Stadium</option>
              )}
            </select>
          </div>

          {/* User Persona Selector */}
          <div className="flex items-center bg-white/40 border border-white/60 rounded-xl p-1 shadow-sm backdrop-blur-sm shrink-0">
            <span className="text-[8px] text-slate-450 px-1 font-extrabold uppercase">View As</span>
            <select
              value={userMode}
              onChange={(e) => setUserMode(e.target.value)}
              className="bg-transparent text-[10px] sm:text-xs text-slate-700 outline-none pr-2 py-0.5 font-bold cursor-pointer"
            >
              <option value="fan">Fan</option>
              <option value="volunteer">Volunteer</option>
              <option value="staff">Staff</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center bg-white/40 border border-white/60 rounded-xl p-1 shadow-sm backdrop-blur-sm shrink-0">
            <span className="text-[8px] text-slate-450 px-1 font-extrabold uppercase">Lang</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-[10px] sm:text-xs text-slate-700 outline-none pr-2 py-0.5 font-bold cursor-pointer"
            >
              {languages.length > 0 ? (
                languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))
              ) : (
                <option value="English">English</option>
              )}
            </select>
          </div>
        </div>
      </header>

      {/* Mobile Tab Swapper (Visible on screens below lg) */}
      <div className="flex lg:hidden shrink-0 bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl p-1 mx-4 sm:mx-6 mt-3 shadow-sm select-none z-10">
        <button
          onClick={() => setActiveMobileTab("dashboard")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeMobileTab === "dashboard"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "text-slate-500 hover:text-slate-750"
          }`}
        >
          Live Metrics
        </button>
        <button
          onClick={() => setActiveMobileTab("chat")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeMobileTab === "chat"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "text-slate-505 hover:text-slate-750"
          }`}
        >
          AI Assistant
        </button>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 gap-6 z-10 w-full">
        
        {/* Left Dashboard Column */}
        <div className={`flex-1 w-full space-y-6 ${activeMobileTab === "dashboard" ? "flex" : "hidden lg:flex"} flex-col`}>
          {isLoadingDashboard ? (
            <div className="h-64 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Syncing telemetry data...</p>
              </div>
            </div>
          ) : dashboard ? (
            <>
              {/* Stadium Live Summary Banner with Graphic */}
              <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-white/80 transition-all duration-300">
                <div className="flex items-center gap-4">
                  {/* Custom Stadium graphic visual */}
                  <img
                    src={`/images/${selectedVenue}.png`}
                    alt={dashboard.venue_name}
                    className="w-16 h-12 sm:w-28 sm:h-20 rounded-xl object-cover shadow-sm border border-white/60 shrink-0 hover:scale-[1.02] transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                        Live Telemetry Feed
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      {dashboard.venue_name}
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      Stadium: {dashboard.city} · {dashboard.capacity.toLocaleString()} Seats
                    </p>
                  </div>
                </div>

                {/* Stat boxes */}
                <div className="flex items-center gap-4 self-stretch md:self-auto overflow-x-auto">
                  <div className="bg-white border border-slate-100 rounded-xl p-3 min-w-[110px] sm:min-w-[125px] flex flex-col items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.005)]">
                    <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">
                      Fans Inside
                    </span>
                    <span className="text-base font-black text-blue-650 mt-0.5">
                      {dashboard.total_fans_today.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl p-3 min-w-[110px] sm:min-w-[125px] flex flex-col items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.005)]">
                    <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">
                      Satisfaction
                    </span>
                    <span className="text-base font-black text-indigo-655 mt-0.5">
                      Rating: {dashboard.avg_satisfaction_score}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl p-3 min-w-[110px] sm:min-w-[125px] flex flex-col items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.005)]">
                    <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">
                      Alerts Log
                    </span>
                    <span
                      className={`text-base font-black mt-0.5 ${
                        dashboard.staff_alerts.length > 0 ? "text-amber-605" : "text-emerald-600"
                      }`}
                    >
                      Alerts: {dashboard.staff_alerts.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid 1: Heatmap and Gates board */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Visual Crowd Density Heatmap (Glass Card) */}
                <div className="glass-card rounded-2xl p-5 flex flex-col hover:bg-white/80 transition-all duration-300">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                    <span className="w-1 h-2.5 bg-blue-600 rounded-sm" />
                    Interactive Bowl Heatmap
                  </h3>

                  {/* SVG Concourse Vector Blueprint */}
                  <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50/50 rounded-2xl border border-slate-200/30 p-4">
                    <div className="w-full md:w-1/2 aspect-[16/11] flex items-center justify-center relative bg-white border border-slate-100 rounded-xl shadow-inner p-2 shrink-0">
                      <svg viewBox="0 0 100 60" className="w-full h-full">
                        {/* Soccer Field (Pitch) in Center */}
                        <rect x="36" y="21" width="28" height="18" rx="2" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1" />
                        <line x1="50" y1="21" x2="50" y2="39" stroke="#a7f3d0" strokeWidth="0.8" />
                        <circle cx="50" cy="30" r="4.5" fill="none" stroke="#a7f3d0" strokeWidth="0.8" />

                        {/* North Concourse Segment */}
                        <path
                          d="M26,18 C35,9 65,9 74,18 L68,23 C62,17 38,17 32,23 Z"
                          fill={getZoneColor("North")}
                          stroke={getZoneStroke("North")}
                          strokeWidth="1.2"
                          className="cursor-pointer transition-all duration-200 hover:opacity-75"
                          onClick={() => setChatInput("Tell me about crowd conditions at North Concourse")}
                        />

                        {/* South Plaza Segment */}
                        <path
                          d="M26,42 C35,51 65,51 74,42 L68,37 C62,43 38,43 32,37 Z"
                          fill={getZoneColor("South")}
                          stroke={getZoneStroke("South")}
                          strokeWidth="1.2"
                          className="cursor-pointer transition-all duration-200 hover:opacity-75"
                          onClick={() => setChatInput("Tell me about crowd conditions at South Plaza")}
                        />

                        {/* West Plaza Segment */}
                        <path
                          d="M18,22 C10,28 10,32 18,38 L23,34 C19,31 19,29 23,26 Z"
                          fill={getZoneColor("West")}
                          stroke={getZoneStroke("West")}
                          strokeWidth="1.2"
                          className="cursor-pointer transition-all duration-200 hover:opacity-75"
                          onClick={() => setChatInput("Tell me about crowd conditions at West Plaza")}
                        />

                        {/* East Concourse Segment */}
                        <path
                          d="M82,22 C90,28 90,32 82,38 L77,34 C81,31 81,29 77,26 Z"
                          fill={getZoneColor("East")}
                          stroke={getZoneStroke("East")}
                          strokeWidth="1.2"
                          className="cursor-pointer transition-all duration-200 hover:opacity-75"
                          onClick={() => setChatInput("Tell me about crowd conditions at East Concourse")}
                        />

                        {/* Level 2 Concourse Inner Ring */}
                        <path
                          d="M29,24 C34,18 66,18 71,24 L73,27 C69,22 31,22 27,27 Z"
                          fill={getZoneColor("Level 2")}
                          stroke={getZoneStroke("Level 2")}
                          strokeWidth="1.2"
                          className="cursor-pointer transition-all duration-200 hover:opacity-75"
                          onClick={() => setChatInput("Tell me about crowd conditions at Level 2 Concourse")}
                        />

                        {/* Upper Bowl Outer Ring Arc */}
                        <path
                          d="M29,36 C34,42 66,42 71,36 L73,33 C69,38 31,38 27,33 Z"
                          fill={getZoneColor("Upper Bowl")}
                          stroke={getZoneStroke("Upper Bowl")}
                          strokeWidth="1.2"
                          className="cursor-pointer transition-all duration-200 hover:opacity-75"
                          onClick={() => setChatInput("Tell me about crowd conditions at Upper Bowl Ramp")}
                        />
                      </svg>
                    </div>

                    {/* Concourse Info Side list - Responsive 1 column layout on narrow widths */}
                    <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {dashboard.crowd_zones.map((zone: any, i: number) => (
                        <div
                          key={i}
                          className="bg-white border border-slate-100 p-2.5 rounded-xl flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.005)] hover:border-slate-300 transition-all cursor-pointer gap-2"
                          onClick={() => setChatInput(`Tell me about crowd conditions at ${zone.zone}`)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-slate-850 truncate" title={zone.zone}>
                              {zone.zone}
                            </p>
                            <span className="text-[8px] text-slate-404 font-bold uppercase">{zone.density_pct}% density</span>
                          </div>
                          <span className={`${getDensityBadge(zone.density)} shrink-0`}>{zone.density}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive legend and info */}
                  <div className="mt-3 text-[9px] text-slate-450 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between border-t border-slate-100 pt-3 font-extrabold uppercase">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Low
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Medium
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-505" /> High
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-505 animate-pulse" /> Critical
                      </span>
                    </div>
                    <span className="italic font-bold normal-case text-slate-400">Click blueprint to ask AI</span>
                  </div>
                </div>

                {/* Gate Entry Board */}
                <div className="glass-card rounded-2xl p-5 flex flex-col hover:bg-white/80 transition-all duration-300">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                    <span className="w-1 h-2.5 bg-indigo-650 rounded-sm" />
                    Gate clearance Board
                  </h3>

                  <div className="space-y-2">
                    {dashboard.gates.map((gate: any, i: number) => (
                      <div
                        key={i}
                        className="bg-white border border-slate-100 hover:border-slate-350/50 rounded-2xl p-3 flex items-center justify-between transition-all duration-300 hover:shadow-sm hover:scale-[1.005] cursor-pointer"
                        onClick={() => {
                          setChatInput(`How is accessibility and wait times at ${gate.id}?`);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-205 flex flex-col items-center justify-center shrink-0 shadow-sm">
                            <span className="text-[7px] text-slate-404 font-black uppercase leading-none">
                              {gate.zone}
                            </span>
                            <span className="text-xs font-black text-slate-800 mt-0.5">
                              {gate.id.replace("Gate ", "").replace("Puerta ", "")}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-800">{gate.id}</h4>
                              {gate.accessible && (
                                <span className="text-[8px] bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-1.5 py-0.2 font-black uppercase tracking-wider">
                                  access
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                              {gate.type}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-xs font-black text-slate-855">
                              {gate.wait_minutes} min
                            </span>
                            <span className={getWaitStatusBadge(gate.wait_status)}>
                              {gate.wait_status}
                            </span>
                          </div>
                          {/* Wait Progress visual line */}
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5 ml-auto">
                            <div
                              className={`h-full rounded-full ${
                                gate.wait_status.toLowerCase() === "critical" ? "bg-red-500" :
                                gate.wait_status.toLowerCase() === "high" ? "bg-orange-500" :
                                gate.wait_status.toLowerCase() === "medium" ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(100, (gate.wait_minutes / 35) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid 2: Transport & Sustainability, Operational Alerts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Transport & Sustainability Operations */}
                <div className="glass-card rounded-2xl p-5 space-y-5 hover:bg-white/80 transition-all duration-300">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                    <span className="w-1.5 h-2.5 bg-emerald-650 rounded-sm" />
                    Transport & Carbon Offsets
                  </h3>

                  {/* Shuttle tracker board */}
                  <div className="space-y-3">
                    <h4 className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                      Transit Shuttles Load Factor
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {dashboard.shuttle_status.map((shuttle: any, i: number) => (
                        <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 shadow-[0_4px_12px_rgba(0,0,0,0.005)]">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-xs font-bold text-slate-855">{shuttle.route}</h5>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5 truncate max-w-[120px]" title={shuttle.from}>
                                {shuttle.from}
                              </p>
                            </div>
                            <span
                              className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase border ${
                                shuttle.status.includes("delay")
                                  ? "bg-red-50 text-red-655 border-red-100"
                                  : "bg-emerald-50 text-emerald-650 border-emerald-100"
                              }`}
                            >
                              {shuttle.status}
                            </span>
                          </div>

                          {/* Capacity progress */}
                          <div className="mt-3">
                            <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-1">
                              <span>Load Factor</span>
                              <span>{shuttle.capacity_pct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${shuttle.capacity_pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parking Lots and Sustainability info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    {/* Parking lot occupancy */}
                    <div className="space-y-2">
                      <h4 className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                        Lot Occupancy
                      </h4>
                      <div className="space-y-1.5">
                        {dashboard.parking_summary.map((lot: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-bold">{lot.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-805">
                                {lot.spaces}/{lot.total}
                              </span>
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  lot.status === "full" ? "bg-red-550 animate-pulse" : "bg-emerald-550 animate-pulse"
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sustainability targets card with Circular rings */}
                    <div className="bg-emerald-500/[0.01] border border-emerald-500/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-1 text-emerald-600 text-[9px] font-black uppercase mb-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Eco parameters
                        </div>
                        <p className="text-[10px] text-slate-555 leading-snug font-semibold font-chat">
                          {selectedVenue === "metlife"
                            ? "MetLife stadium is running on 85% waste recycling."
                            : selectedVenue === "sofi"
                            ? "SoFi targets 90% water waste recycling diversion."
                            : "Azteca utilizes 80% solar backup cells for lights."}
                        </p>
                      </div>

                      {/* circular gauges */}
                      <div className="flex gap-2.5 shrink-0">
                        {/* Carbon diversion gauge */}
                        <div className="flex flex-col items-center">
                          <div className="relative w-11 h-11 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="22" cy="22" r="18" stroke="#f1f5f9" strokeWidth="2.5" fill="transparent" />
                              <circle cx="22" cy="22" r="18" stroke="#10b981" strokeWidth="3" fill="transparent"
                                strokeDasharray={2 * Math.PI * 18}
                                strokeDashoffset={2 * Math.PI * 18 * (1 - getEcoPercentage().carbon / 100)}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute text-[8px] font-black text-slate-800">{getEcoPercentage().carbon}%</span>
                          </div>
                          <span className="text-[7px] text-slate-404 font-extrabold uppercase mt-1">Offset</span>
                        </div>

                        {/* Solar offset gauge */}
                        <div className="flex flex-col items-center">
                          <div className="relative w-11 h-11 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="22" cy="22" r="18" stroke="#f1f5f9" strokeWidth="2.5" fill="transparent" />
                              <circle cx="22" cy="22" r="18" stroke="#3b82f6" strokeWidth="3" fill="transparent"
                                strokeDasharray={2 * Math.PI * 18}
                                strokeDashoffset={2 * Math.PI * 18 * (1 - getEcoPercentage().solar / 100)}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute text-[8px] font-black text-slate-800">{getEcoPercentage().solar}%</span>
                          </div>
                          <span className="text-[7px] text-slate-404 font-extrabold uppercase mt-1">solar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operations Commands & Personnel Alerts */}
                <div className="glass-card rounded-2xl p-5 flex flex-col justify-between hover:bg-white/80 transition-all duration-300">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-550 mb-4 flex items-center gap-1.5">
                      <span className="w-1.5 h-2.5 bg-amber-500 rounded-sm" />
                      Operations Warnings
                    </h3>

                    {/* Active operational alerts */}
                    <div className="space-y-2 mb-4">
                      {dashboard.staff_alerts.length > 0 ? (
                        dashboard.staff_alerts.map((alert: any, i: number) => (
                          <div
                            key={i}
                            className={`rounded-2xl p-3 flex items-start gap-3 border shadow-sm ${getSeverityColor(alert.severity)}`}
                          >
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-wider">{alert.severity} ALERT</span>
                                <span className="text-[9px] font-bold opacity-75">
                                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs mt-1 font-bold leading-normal font-chat">
                                [{alert.zone}] {alert.message}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
                          <p className="text-xs text-slate-400 font-bold">All telemetry indicators normal. No active alerts.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medical Point references depending on view */}
                  <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3.5 space-y-2">
                    <h4 className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                      Medical Assistance Points
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {dashboard.medical_points.map((med: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.005)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <div>
                            <p className="font-bold text-slate-800 truncate max-w-[140px]">{med.location}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{med.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Persona Context Panels (Specific Info depending on Mode) */}
              {userMode !== "fan" && (
                <div className="bg-white/40 border border-dashed border-slate-350 rounded-2xl p-5 shadow-sm backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <h3 className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                      {userMode === "volunteer"
                        ? "Volunteer Shift Deployments"
                        : userMode === "staff"
                        ? "Direct Operations Protocols"
                        : "Match Day Event Analytics"}
                    </h3>
                  </div>

                  {userMode === "volunteer" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {dashboard.volunteer_posts.map((post: any, i: number) => (
                        <div key={i} className="bg-white border border-slate-100 shadow-sm rounded-xl p-3 text-center">
                          <p className="text-[9px] text-slate-400 font-black uppercase">{post.id}</p>
                          <p className="text-xs font-black text-slate-800 mt-1 truncate" title={post.role}>{post.role}</p>
                          <p className="text-[9px] text-slate-505 font-semibold mt-0.5 truncate">{post.zone}</p>
                          <div className="mt-2 inline-block bg-slate-100 text-[9px] font-black px-1.5 py-0.5 rounded-full text-indigo-700">
                            {post.headcount} slots
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : userMode === "staff" ? (
                    <div className="space-y-2 text-xs font-chat">
                      <p className="text-slate-655 font-bold">
                        Emergency Security: {dashboard.analytics.top_questions ? "Dial extension 911 from any venue terminal. Command stationed at Gate A." : ""}
                      </p>
                      <p className="text-slate-655 font-bold">
                        Lost Child Reunification: Guide families to Gate C Guest Services. Immediate PA overrides.
                      </p>
                      <p className="text-slate-655 font-bold">
                        Lost & Found: Stationed at Guest Services desk (Gate C). Open until 1h post whistle.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white border border-slate-100 shadow-sm p-3 rounded-xl">
                        <span className="text-[9px] text-slate-404 font-bold uppercase block">Queries Handled</span>
                        <span className="text-lg font-black text-blue-600">{dashboard.analytics.queries_handled}</span>
                      </div>
                      <div className="bg-white border border-slate-100 shadow-sm p-3 rounded-xl">
                        <span className="text-[9px] text-slate-404 font-bold uppercase block">Core user topic</span>
                        <span className="text-[10px] font-bold text-slate-700 truncate block mt-1 font-chat">{dashboard.analytics.top_questions[0]}</span>
                      </div>
                      <div className="bg-white border border-slate-100 shadow-sm p-3 rounded-xl col-span-2">
                        <span className="text-[9px] text-slate-404 font-bold uppercase block">Matches Scheduled</span>
                        <div className="flex gap-2 items-center mt-1">
                          {dashboard.match_schedule.map((match: any, idx: number) => (
                            <span key={idx} className="text-[10px] bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full font-bold text-slate-700">
                              {match.home} vs {match.away} ({match.time})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">
              Telemetry synchronization offline.
            </div>
          )}
        </div>

        {/* Right Console: AI Assistant Panel */}
        <div className={`w-full lg:w-[400px] lg:sticky lg:top-6 h-[600px] lg:h-[calc(100vh-7rem)] bg-white/70 backdrop-blur-lg border border-slate-205/65 shadow-[0_8px_32px_0_rgba(31,38,135,0.035)] rounded-2xl flex flex-col overflow-hidden shrink-0 z-10 ${activeMobileTab === "chat" ? "flex" : "hidden lg:flex"}`}>
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-105 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-655 animate-pulse" />
                AI Assistant
              </h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                {getPersonaLabel(userMode)} · {selectedLanguage}
              </p>
            </div>
            {detectedIntent && (
              <span className="text-[9px] uppercase tracking-wider font-extrabold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full shadow-sm">
                {detectedIntent}
              </span>
            )}
          </div>

          {/* Voice input error banner */}
          {speechError && (
            <div className="bg-red-50 text-red-755 text-[10px] px-4 py-2 border-b border-red-100 font-bold animate-pulse">
              {speechError}
            </div>
          )}

          {/* Chat Message Window */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none bg-[#fcfdfe]/40 font-chat">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.005)] ${
                    m.role === "user"
                      ? "bg-gradient-to-tr from-blue-600 to-indigo-650 text-white rounded-tr-none"
                      : "bg-white border border-slate-150 text-slate-800 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
                {/* Meta details below message */}
                <div className="flex items-center gap-2 mt-1.5 px-1 text-[9px] text-slate-400 font-extrabold">
                  <span>{m.role === "user" ? "You" : "Assistant"}</span>
                  {m.intent && m.intent !== "general" && (
                    <span>· Intent: {m.intent}</span>
                  )}
                  {m.cached && (
                    <span className="text-emerald-700 border border-emerald-200/50 bg-emerald-50 px-1.5 rounded-full font-bold">
                      cached
                    </span>
                  )}
                  {m.role === "assistant" && window.speechSynthesis && (
                    <button
                      onClick={() => speakMessage(m.content)}
                      className="text-blue-600 hover:text-blue-850 ml-1 cursor-pointer font-extrabold uppercase tracking-wider flex items-center gap-0.5"
                      title="Speak response"
                    >
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                      </svg>
                      Listen
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoadingChat && (
              <div className="flex flex-col items-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                </div>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 px-1">Retrieving context...</span>
              </div>
            )}
          </div>

          {/* Quick suggestions based on Persona */}
          <div className="px-4 py-2 bg-white/40 border-t border-slate-100 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
            {(userMode === "fan"
              ? ["Which gate is fastest?", "Wheelchair routing details", "Green transport routes", "sensory room locations"]
              : userMode === "volunteer"
              ? ["Check volunteer posts", "List medical points", "Emergency gate procedures"]
              : ["Deploy flow managers", "Read emergency protocol", "Gate B capacity issue"]
            ).map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => setChatInput(phrase)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-550 px-2.5 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Chat Form Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm flex items-center gap-2 shrink-0">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isRecording
                  ? "bg-red-50 border-red-300 text-red-500 animate-pulse scale-95"
                  : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 shadow-sm"
              }`}
              title="Toggle speech input (Web Speech API)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isRecording ? "Listening..." : "Ask about navigation, wait times, safety..."}
              maxLength={800}
              className="flex-1 bg-white border border-slate-200 hover:border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-xs text-slate-805 font-bold outline-none transition-all placeholder-slate-400 font-chat"
              disabled={isLoadingChat}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!chatInput.trim() || isLoadingChat}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-650 text-white flex items-center justify-center shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 disabled:bg-slate-100 disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-400 disabled:shadow-none transition-all cursor-pointer shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
