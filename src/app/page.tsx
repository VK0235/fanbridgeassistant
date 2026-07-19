"use client";

import { useState, useEffect } from "react";
import type { VenueSummary, UserMode, MobileTab } from "../types";

// Hooks
import { useDashboard } from "../hooks/useDashboard";
import { useChat } from "../hooks/useChat";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

// Layout Components
import AppHeader from "../components/AppHeader";
import MobileTabSwitcher from "../components/MobileTabSwitcher";

// Dashboard Components
import StadiumSummaryBanner from "../components/dashboard/StadiumSummaryBanner";
import CrowdHeatmap from "../components/dashboard/CrowdHeatmap";
import GateBoard from "../components/dashboard/GateBoard";
import TransportPanel from "../components/dashboard/TransportPanel";
import OperationsAlerts from "../components/dashboard/OperationsAlerts";
import PersonaPanel from "../components/dashboard/PersonaPanel";

// Chat Components
import ChatPanel from "../components/chat/ChatPanel";

export default function Page() {
  // ── Configuration State ──────────────────────────────────────────────
  const [venues, setVenues] = useState<VenueSummary[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [selectedVenue, setSelectedVenue] = useState("metlife");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [userMode, setUserMode] = useState<UserMode>("fan");
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>("dashboard");

  // ── Hooks ────────────────────────────────────────────────────────────
  const { dashboard, isLoading: isLoadingDashboard } = useDashboard(selectedVenue);

  const chat = useChat(selectedVenue, selectedLanguage, userMode);

  const { speakMessage } = useSpeechSynthesis();

  const { isRecording, speechError, toggleRecording } = useSpeechRecognition(
    (transcript) => chat.setChatInput(transcript)
  );

  // ── Initial Data Fetch ───────────────────────────────────────────────
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

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-[#f6f8fa] text-slate-700 font-sans flex flex-col relative select-none pb-6">
      {/* Background Glassmorphism Blobs */}
      <div className="absolute top-[-150px] left-[-150px] w-[450px] h-[450px] bg-sky-300/20 rounded-full blur-[110px] pointer-events-none animate-soft-pulse" />
      <div className="absolute top-[25%] right-[25%] w-[600px] h-[600px] bg-indigo-300/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-emerald-300/15 rounded-full blur-[110px] pointer-events-none animate-soft-pulse" />
      <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] bg-rose-200/15 rounded-full blur-[100px] pointer-events-none animate-soft-pulse" />

      <AppHeader
        venues={venues}
        selectedVenue={selectedVenue}
        onVenueChange={setSelectedVenue}
        userMode={userMode}
        onUserModeChange={(mode) => setUserMode(mode as UserMode)}
        languages={languages}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />

      <MobileTabSwitcher activeTab={activeMobileTab} onTabChange={setActiveMobileTab} />

      <main className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 gap-6 z-10 w-full">
        {/* Left Dashboard Column */}
        <div
          className={`flex-1 w-full space-y-6 ${
            activeMobileTab === "dashboard" ? "flex" : "hidden lg:flex"
          } flex-col`}
        >
          {isLoadingDashboard ? (
            <div className="h-64 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  Syncing telemetry data...
                </p>
              </div>
            </div>
          ) : dashboard ? (
            <>
              <StadiumSummaryBanner dashboard={dashboard} selectedVenue={selectedVenue} />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <CrowdHeatmap crowdZones={dashboard.crowd_zones} onZoneClick={chat.setChatInput} />
                <GateBoard gates={dashboard.gates} onGateClick={chat.setChatInput} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TransportPanel
                  shuttleRoutes={dashboard.shuttle_status}
                  parkingLots={dashboard.parking_summary}
                  selectedVenue={selectedVenue}
                />
                <OperationsAlerts
                  staffAlerts={dashboard.staff_alerts}
                  medicalPoints={dashboard.medical_points}
                />
              </div>

              <PersonaPanel userMode={userMode} dashboard={dashboard} />
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">
              Telemetry synchronization offline.
            </div>
          )}
        </div>

        {/* Right AI Assistant Panel */}
        <ChatPanel
          messages={chat.messages}
          chatInput={chat.chatInput}
          setChatInput={chat.setChatInput}
          isLoading={chat.isLoading}
          detectedIntent={chat.detectedIntent}
          sendMessage={chat.sendMessage}
          chatContainerRef={chat.chatContainerRef}
          userMode={userMode}
          selectedLanguage={selectedLanguage}
          isRecording={isRecording}
          speechError={speechError}
          onToggleRecording={() => toggleRecording(selectedLanguage)}
          onSpeak={(text) => speakMessage(text, selectedLanguage)}
          activeMobileTab={activeMobileTab}
        />
      </main>
    </div>
  );
}
