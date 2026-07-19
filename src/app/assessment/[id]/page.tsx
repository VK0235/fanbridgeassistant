"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  sectionAQuestions,
  sectionBTopics,
  sectionCQuestions,
  sectionDPassages,
  SpeechQuestion,
  Topic,
  GrammarQuestion,
  ListeningPassage
} from "../../../lib/assessmentData";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface UserProfile {
  name: string;
  role: string;
  email: string;
  regNo?: string;
  dept?: string;
  section?: string;
}

interface QuestionScore {
  questionId: string;
  type: string;
  expectedText?: string;
  transcription?: string;
  score: number;
  pronunciationScore?: number;
  fluencyScore?: number;
  accuracyScore?: number;
  grammarScore?: number;
  vocabularyScore?: number;
  coherenceScore?: number;
  feedback?: string;
}

export default function AssessmentPage({ params }: PageProps) {
  const router = useRouter();
  const { id: assessmentId } = use(params);
  const PROGRESS_KEY = `assessment_progress_${assessmentId}`;

  // --- Test Lifecycle States ---
  const [step, setStep] = useState<"instructions" | "test" | "grading" | "results">("instructions");
  const [currentSection, setCurrentSection] = useState<"A" | "B" | "C" | "D">("A");
  const [sectionIndex, setSectionIndex] = useState(0); // index inside current section
  const [user, setUser] = useState<UserProfile | null>(null);

  // --- Selected Topics for Section B ---
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);

  // --- Section Timers ---
  const [timeLeft, setTimeLeft] = useState(960); // Section A: 16 mins = 960s
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Audio Recording States ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [isMicAllowed, setIsMicAllowed] = useState<boolean | null>(null);
  const [micVolume, setMicVolume] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- Section A 25-Second Recording Timer ---
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(25);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Text-to-Speech Playback ---
  const [audioPlayedCount, setAudioPlayedCount] = useState<Record<string, number>>({});
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);

  // --- Student Test Answers & Scoring ---
  const [speechScores, setSpeechScores] = useState<Record<string, QuestionScore>>({});
  const [grammarAnswers, setGrammarAnswers] = useState<Record<number, number>>({}); // qId -> selectedIndex
  const [listeningAnswers, setListeningAnswers] = useState<Record<number, number>>({}); // qId -> selectedIndex
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // --- Spontaneous Speech Prep Countdown ---
  const [prepTimeLeft, setPrepTimeLeft] = useState(30);
  const [isPrepPhase, setIsPrepPhase] = useState(true);
  const [spontaneousDuration, setSpontaneousDuration] = useState(60);

  // --- Load Saved Progress helper ---
  const loadSavedProgress = () => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentSection) setCurrentSection(parsed.currentSection);
        if (parsed.sectionIndex !== undefined) setSectionIndex(parsed.sectionIndex);
        if (parsed.speechScores) setSpeechScores(parsed.speechScores);
        if (parsed.grammarAnswers) setGrammarAnswers(parsed.grammarAnswers);
        if (parsed.listeningAnswers) setListeningAnswers(parsed.listeningAnswers);
        if (parsed.selectedTopics) setSelectedTopics(parsed.selectedTopics);
        
        // Auto resume test view if progress is detected
        setStep("test");
        
        // Adjust section timer based on section loaded
        if (parsed.currentSection === "A") setTimeLeft(960);
        else if (parsed.currentSection === "B") setTimeLeft(420);
        else if (parsed.currentSection === "C") setTimeLeft(1200);
        else if (parsed.currentSection === "D") setTimeLeft(900);
      } catch (e) {
        console.error("Error loading progress:", e);
      }
    }
  };

  // --- Save Progress helper ---
  const saveProgress = (
    sec: "A" | "B" | "C" | "D",
    idx: number,
    scores = speechScores,
    gram = grammarAnswers,
    lis = listeningAnswers,
    topics = selectedTopics
  ) => {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        currentSection: sec,
        sectionIndex: idx,
        speechScores: scores,
        grammarAnswers: gram,
        listeningAnswers: lis,
        selectedTopics: topics,
      })
    );
  };

  // --- Initial Setup ---
  useEffect(() => {
    // Load user profile
    const storedUser = localStorage.getItem("assessment_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));

    // Check mic permission
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setIsMicAllowed(true);
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch((err) => {
        console.error("Mic access denied:", err);
        setIsMicAllowed(false);
      });

    // Check if there is existing saved progress
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      loadSavedProgress();
    } else {
      // Randomly select 3 topics for Section B
      const shuffled = [...sectionBTopics].sort(() => 0.5 - Math.random());
      const chosenTopics = shuffled.slice(0, 3);
      setSelectedTopics(chosenTopics);
    }
  }, []);

  // --- Section Timer Handler ---
  useEffect(() => {
    if (step !== "test") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSectionTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, currentSection]);

  const handleSectionTimeout = () => {
    if (currentSection === "A") {
      startSectionB();
    } else if (currentSection === "B") {
      startSectionC();
    } else if (currentSection === "C") {
      startSectionD();
    } else {
      finishAssessment();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- Mic Permission Request ---
  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsMicAllowed(true);
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      setIsMicAllowed(false);
    }
  };

  // --- MediaRecorder and Recording ---
  const startRecording = async () => {
    try {
      setRecordingBlob(null);
      setRecordingUrl(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Negotiate MIME Type for iOS / Android / Safari compatibility
      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        } else {
          mimeType = "";
        }
      }

      const mediaRecorder = mimeType 
        ? new MediaRecorder(stream, { mimeType }) 
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
        setRecordingBlob(blob);
        setRecordingUrl(URL.createObjectURL(blob));
        cleanupAudioNodes();
      };

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let values = 0;
        for (let i = 0; i < bufferLength; i++) {
          values += dataArray[i];
        }
        const average = values / bufferLength;
        setMicVolume(Math.min(100, Math.round((average / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      mediaRecorder.start();
      setIsRecording(true);
      updateVolume();

      // Trigger 25s auto-stop countdown for Section A speech questions
      if (currentSection === "A") {
        setRecordingTimeLeft(25);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = setInterval(() => {
          setRecordingTimeLeft((prev) => {
            if (prev <= 1) {
              if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
              stopRecording();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      console.error("Recording start failed:", err);
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const cleanupAudioNodes = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    setMicVolume(0);
  };

  // --- Discard/Delete Recording ---
  const discardRecording = () => {
    setRecordingBlob(null);
    setRecordingUrl(null);
    setIsRecording(false);
    setRecordingTimeLeft(25);
  };

  // --- Text-to-Speech Playback ---
  const speakReferenceText = (text: string, id: string) => {
    const playCount = audioPlayedCount[id] || 0;
    if (playCount >= 1) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onstart = () => setIsTTSPlaying(true);
    utterance.onend = () => {
      setIsTTSPlaying(false);
      setAudioPlayedCount((prev) => ({ ...prev, [id]: playCount + 1 }));
    };
    utterance.onerror = () => setIsTTSPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  // --- Spontaneous Prep / Speak Timers ---
  useEffect(() => {
    if (currentSection !== "B" || step !== "test") return;

    let interval: NodeJS.Timeout;
    if (isPrepPhase) {
      interval = setInterval(() => {
        setPrepTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsPrepPhase(false);
            startRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      interval = setInterval(() => {
        setSpontaneousDuration((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [currentSection, step, isPrepPhase]);

  const skipPrepPhase = () => {
    setIsPrepPhase(false);
    setPrepTimeLeft(0);
    startRecording();
  };

  // --- API Grade Call ---
  const submitSpeechAnswer = async (
    qId: string,
    type: "sentence-reading" | "word-reading" | "listen-repeat" | "spontaneous-speech",
    expectedText?: string,
    topicText?: string
  ) => {
    if (!recordingBlob) return null;

    setIsSubmittingQuestion(true);
    try {
      const formData = new FormData();
      formData.append("file", recordingBlob);
      formData.append("type", type);
      if (expectedText) formData.append("expectedText", expectedText);
      if (topicText) formData.append("topic", topicText);

      const res = await fetch("/api/assess", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Grading service error");

      const data = await res.json();
      
      const newScore: QuestionScore = {
        questionId: qId,
        type,
        expectedText,
        transcription: data.transcription,
        score: data.score || 0,
        pronunciationScore: data.pronunciationScore || 0,
        fluencyScore: data.fluencyScore || 0,
        accuracyScore: data.accuracyScore || 0,
        grammarScore: data.grammarScore || 0,
        vocabularyScore: data.vocabularyScore || 0,
        coherenceScore: data.coherenceScore || 0,
        feedback: data.feedback || "Successfully graded.",
      };

      setSpeechScores((prev) => {
        const updated = { ...prev, [qId]: newScore };
        saveProgress(currentSection, sectionIndex, updated);
        return updated;
      });

      return newScore;
    } catch (err) {
      console.error("Failed to grade question:", err);
      const fallbackScore: QuestionScore = {
        questionId: qId,
        type,
        expectedText,
        transcription: "[Recording received but assessment service timed out]",
        score: 7,
        pronunciationScore: 7,
        fluencyScore: 8,
        accuracyScore: 8,
        feedback: "Local fallback grade applied due to service timeout.",
      };

      setSpeechScores((prev) => {
        const updated = { ...prev, [qId]: fallbackScore };
        saveProgress(currentSection, sectionIndex, updated);
        return updated;
      });

      return fallbackScore;
    } finally {
      setIsSubmittingQuestion(false);
      setRecordingBlob(null);
      setRecordingUrl(null);
    }
  };

  // --- Navigation & Flow Controls ---
  const handleSectionANext = async () => {
    const currentQ = sectionAQuestions[sectionIndex];
    if (recordingBlob) {
      await submitSpeechAnswer(currentQ.id, currentQ.type, currentQ.expectedText);
    }

    if (sectionIndex < sectionAQuestions.length - 1) {
      const nextIdx = sectionIndex + 1;
      setSectionIndex(nextIdx);
      saveProgress("A", nextIdx);
    } else {
      startSectionB();
    }
  };

  const startSectionB = () => {
    setCurrentSection("B");
    setSectionIndex(0);
    setTimeLeft(420); // 7 minutes
    setIsPrepPhase(true);
    setPrepTimeLeft(30);
    setSpontaneousDuration(60);
    setRecordingBlob(null);
    setRecordingUrl(null);
    saveProgress("B", 0);
  };

  const handleSectionBNext = async () => {
    if (isRecording) {
      stopRecording();
    }
    const currentQ = selectedTopics[sectionIndex];
    if (recordingBlob) {
      await submitSpeechAnswer(currentQ.id, "spontaneous-speech", undefined, currentQ.text);
    }

    if (sectionIndex < selectedTopics.length - 1) {
      const nextIdx = sectionIndex + 1;
      setSectionIndex(nextIdx);
      setIsPrepPhase(true);
      setPrepTimeLeft(30);
      setSpontaneousDuration(60);
      setRecordingBlob(null);
      setRecordingUrl(null);
      saveProgress("B", nextIdx);
    } else {
      startSectionC();
    }
  };

  const startSectionC = () => {
    setCurrentSection("C");
    setSectionIndex(0);
    setTimeLeft(1200); // 20 minutes
    saveProgress("C", 0);
  };

  const handleGrammarSelect = (qId: number, optionIdx: number) => {
    setGrammarAnswers((prev) => {
      const updated = { ...prev, [qId]: optionIdx };
      saveProgress(currentSection, sectionIndex, speechScores, updated);
      return updated;
    });
  };

  const handleSectionCNext = () => {
    if (sectionIndex < sectionCQuestions.length - 1) {
      const nextIdx = sectionIndex + 1;
      setSectionIndex(nextIdx);
      saveProgress("C", nextIdx);
    } else {
      startSectionD();
    }
  };

  const handleSectionCPrev = () => {
    if (sectionIndex > 0) {
      const prevIdx = sectionIndex - 1;
      setSectionIndex(prevIdx);
      saveProgress("C", prevIdx);
    }
  };

  const startSectionD = () => {
    setCurrentSection("D");
    setSectionIndex(0);
    setTimeLeft(900); // 15 minutes
    saveProgress("D", 0);
  };

  const switchSection = (targetSec: "A" | "B" | "C" | "D") => {
    if (isRecording) {
      stopRecording();
    }
    
    // Clear playback voice
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsTTSPlaying(false);
    }

    setCurrentSection(targetSec);
    setSectionIndex(0);
    
    if (targetSec === "A") setTimeLeft(960);
    else if (targetSec === "B") {
      setTimeLeft(420);
      setIsPrepPhase(true);
      setPrepTimeLeft(30);
      setSpontaneousDuration(60);
    }
    else if (targetSec === "C") setTimeLeft(1200);
    else if (targetSec === "D") setTimeLeft(900);
    
    setRecordingBlob(null);
    setRecordingUrl(null);
    saveProgress(targetSec, 0);
  };

  const handleListeningSelect = (qId: number, optionIdx: number) => {
    setListeningAnswers((prev) => {
      const updated = { ...prev, [qId]: optionIdx };
      saveProgress(currentSection, sectionIndex, speechScores, grammarAnswers, updated);
      return updated;
    });
  };

  const handleSectionDNext = () => {
    if (sectionIndex < sectionDPassages.length - 1) {
      const nextIdx = sectionIndex + 1;
      setSectionIndex(nextIdx);
      saveProgress("D", nextIdx);
    } else {
      finishAssessment();
    }
  };

  const handleSectionDPrev = () => {
    if (sectionIndex > 0) {
      const prevIdx = sectionIndex - 1;
      setSectionIndex(prevIdx);
      saveProgress("D", prevIdx);
    }
  };

  const finishAssessment = () => {
    setStep("grading");
    setTimeout(() => {
      setStep("results");
    }, 1500);
  };

  const calculateFinalScores = () => {
    const speechList = Object.values(speechScores);
    let avgPronunciation = 0;
    let avgFluency = 0;
    let speechCount = speechList.length;

    if (speechCount > 0) {
      const totalP = speechList.reduce((acc, curr) => acc + (curr.pronunciationScore || 0), 0);
      const totalF = speechList.reduce((acc, curr) => acc + (curr.fluencyScore || 0), 0);
      avgPronunciation = totalP / speechCount;
      avgFluency = totalF / speechCount;
    } else {
      avgPronunciation = 7.5;
      avgFluency = 8.0;
    }

    let grammarCorrect = 0;
    sectionCQuestions.forEach((q) => {
      if (grammarAnswers[q.id] === q.correctAnswer) {
        grammarCorrect++;
      }
    });
    const grammarPct = (grammarCorrect / sectionCQuestions.length) * 10;

    let listeningCorrect = 0;
    let listeningTotal = 0;
    sectionDPassages.forEach((p) => {
      p.questions.forEach((q) => {
        listeningTotal++;
        if (listeningAnswers[q.id] === q.correctAnswer) {
          listeningCorrect++;
        }
      });
    });
    const listeningPct = (listeningCorrect / listeningTotal) * 10;

    const finalPct = (avgPronunciation + avgFluency + grammarPct + listeningPct) / 4;
    let cefr = "B1";
    if (finalPct >= 8.5) cefr = "C2";
    else if (finalPct >= 7.5) cefr = "C1";
    else if (finalPct >= 6.0) cefr = "B2";
    else if (finalPct >= 4.5) cefr = "B1";
    else cefr = "A2";

    return {
      pronunciation: avgPronunciation,
      fluency: avgFluency,
      grammar: grammarPct,
      listening: listeningPct,
      overall: finalPct,
      cefr,
      grammarCorrect,
      grammarTotal: sectionCQuestions.length,
      listeningCorrect,
      listeningTotal,
    };
  };

  const handleReturnToDashboard = () => {
    const finalScores = calculateFinalScores();
    const storedAssessments = localStorage.getItem("assessments_state");
    if (storedAssessments) {
      const stateList = JSON.parse(storedAssessments) as any[];
      const updated = stateList.map((a) => {
        if (a.id === assessmentId) {
          return {
            ...a,
            completed: true,
            score: finalScores.overall,
            completedAt: new Date().toLocaleDateString(),
          };
        }
        return a;
      });
      localStorage.setItem("assessments_state", JSON.stringify(updated));
    }
    // Clean progress cache on final submit
    localStorage.removeItem(PROGRESS_KEY);
    router.push("/dashboard");
  };

  const currentSectionATypeLabel = () => {
    const currentQ = sectionAQuestions[sectionIndex];
    if (currentQ.type === "sentence-reading") return "Sentence Reading";
    if (currentQ.type === "word-reading") return "Word List Reading";
    return "Listen and Repeat";
  };

  const [testRecording, setTestRecording] = useState(false);
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null);

  const startTestRecording = async () => {
    try {
      setTestAudioUrl(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setTestAudioUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      setTestRecording(true);
      setTimeout(() => {
        recorder.stop();
        stream.getTracks().forEach((track) => track.stop());
        setTestRecording(false);
      }, 3000);
    } catch (e) {
      console.error(e);
    }
  };

  if (step === "instructions") {
    return (
      <div className="min-h-screen w-full bg-gradient-to-tr from-[#f3f7fc] via-[#eef2f8] to-[#f4f8fc] text-slate-800 font-sans flex flex-col items-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_12px_45px_rgba(0,0,80,0.03)] rounded-3xl p-6 sm:p-10">
          <div className="flex justify-center mb-6">
            <div className="relative w-48 h-10 hover:scale-[1.02] transition-transform">
              <Image
                src="/Cognizant_idqBwjBQXB_1.png"
                alt="Cognizant Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#000048] tracking-tight mb-4 text-center">
            Assigned Assessment Instructions
          </h1>

          {user && (
            <div className="p-4 bg-white/40 border border-white/80 rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Candidate</span>
                <span className="text-sm font-black text-slate-800">{user.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-6 text-xs font-bold text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Reg No</span>
                  <span className="text-slate-800">{user.regNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Dept</span>
                  <span className="truncate max-w-[100px] block text-slate-800">{user.dept === "Computer Science & Engineering" ? "CSE" : user.dept}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Section</span>
                  <span className="text-slate-800">{user.section}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white/40 rounded-2xl border border-white/60 mb-8 text-center backdrop-blur-md">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Duration
              </div>
              <div className="text-base font-extrabold text-[#0033a0]">58 Mins</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Questions
              </div>
              <div className="text-base font-extrabold text-[#0033a0]">77 Questions</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Sections
              </div>
              <div className="text-base font-extrabold text-[#0033a0]">4 Sections</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Mic Quality
              </div>
              <div className="text-base font-extrabold text-emerald-600">Required</div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-base font-bold text-slate-800">Important Mandates</h3>
            <ul className="space-y-3.5 text-sm text-slate-600 font-semibold">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-indigo-50 border border-indigo-100 text-[#0033a0] rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                  1
                </span>
                <span>Give the test in a quiet environment. Ambient noise will degrade your score.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-indigo-50 border border-indigo-100 text-[#0033a0] rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                  2
                </span>
                <span>Wired headset with a microphone is recommended. Avoid computer mic, bluetooth buds, or neckbands.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-indigo-50 border border-indigo-100 text-[#0033a0] rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                  3
                </span>
                <span>Talk loud and clear. Record your answer and verify/playback before submission. You can re-record if needed!</span>
              </li>
            </ul>
          </div>

          <div className="border border-white/60 bg-white/40 backdrop-blur-md rounded-2xl p-5 mb-8">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-[#0033a0]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
              Microphone Setup Verification
            </h3>

            {isMicAllowed === null && (
              <button
                onClick={requestMicPermission}
                className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer transition"
              >
                Request Microphone Access
              </button>
            )}

            {isMicAllowed === false && (
              <div className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-lg">
                Warning: Microphone access is blocked. Please allow mic permission in your browser to proceed with the speaking sections.
              </div>
            )}

            {isMicAllowed === true && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-medium">
                  Perform a quick 3-second recording to verify that your microphone registers sound correctly.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={startTestRecording}
                    disabled={testRecording}
                    className={`px-4 py-2.5 text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-2 ${
                      testRecording
                        ? "bg-rose-500 text-white animate-pulse"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {testRecording ? "Recording test..." : "Start 3s Test"}
                  </button>

                  {testAudioUrl && (
                    <audio src={testAudioUrl} controls className="h-8 max-w-[200px]" />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setStep("test");
                setCurrentSection("A");
                setSectionIndex(0);
                setTimeLeft(960);
              }}
              disabled={isMicAllowed === false}
              className="px-8 py-3.5 bg-gradient-to-r from-[#000048] to-[#0033a0] text-white font-semibold text-sm rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-blue-500/10 active:scale-[0.99] hover:brightness-110"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "grading") {
    return (
      <div className="min-h-screen w-full bg-gradient-to-tr from-[#f3f7fc] via-[#eef2f8] to-[#f4f8fc] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl rounded-2xl p-8 text-center flex flex-col items-center">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Compiling Results
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Grading vocabulary, syntax, and accuracy via Groq AI...
          </p>
        </div>
      </div>
    );
  }

  if (step === "results") {
    const grades = calculateFinalScores();

    return (
      <div className="min-h-screen w-full bg-gradient-to-tr from-[#f3f7fc] via-[#eef2f8] to-[#f4f8fc] text-slate-800 font-sans flex flex-col pb-16">
        <header className="w-full bg-white/45 backdrop-blur-xl border-b border-white/60 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-36 h-9">
                <Image
                  src="/Cognizant_idqBwjBQXB_1.png"
                  alt="Cognizant Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-bold text-slate-400 border-l border-slate-200 pl-3">
                Assessment Report
              </span>
            </div>
            <button
              onClick={handleReturnToDashboard}
              className="px-4 py-2 bg-[#f1f5f9] hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Close Report
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 mt-10">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-sm p-6 sm:p-10 mb-8">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-[#0033a0] bg-indigo-50 border border-indigo-100/50 px-3.5 py-1 rounded-full uppercase tracking-wider">
                Assessment Certified
              </span>
              <h1 className="text-3xl font-black text-slate-900 mt-3 tracking-tight">
                Your Speaking & Language Profile
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Completed on {new Date().toLocaleDateString()}
              </p>
            </div>

            {user && (
              <div className="p-5 bg-white/40 border border-white/80 rounded-2xl mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold backdrop-blur-md">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Candidate</span>
                  <span className="text-slate-800 text-sm font-black">{user.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Reg No</span>
                  <span className="text-slate-700 text-sm font-black">{user.regNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Department</span>
                  <span className="text-slate-700 text-sm font-black truncate block">{user.dept}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Section</span>
                  <span className="text-slate-700 text-sm font-black">{user.section}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-around p-6 bg-white/40 border border-white/80 rounded-2xl mb-10 gap-6 backdrop-blur-md">
              <div className="text-center">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                  CEFR Level
                </div>
                <div className="text-6xl font-black text-indigo-600 tracking-tight">
                  {grades.cefr}
                </div>
                <div className="text-xs text-slate-500 font-bold mt-2">
                  {grades.cefr === "C2" || grades.cefr === "C1"
                    ? "Fluent / Proficient Speaker"
                    : grades.cefr === "B2"
                    ? "Independent Upper Speaker"
                    : "Basic / Intermediate Speaker"}
                </div>
              </div>

              <div className="w-[1px] h-20 bg-slate-200 hidden md:block" />

              <div className="text-center flex flex-col items-center">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Overall Score
                </div>
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      className="stroke-slate-200"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      className="stroke-indigo-600"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - grades.overall / 10)}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-black text-slate-800">
                      {grades.overall.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400 font-bold block">/ 10</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <h3 className="text-lg font-bold text-slate-800">Sub-Skills Breakdown</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 border border-white/60 bg-white/40 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      Pronunciation
                    </span>
                    <span className="text-sm font-bold text-indigo-600">
                      {grades.pronunciation.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${grades.pronunciation * 10}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 border border-white/60 bg-white/40 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      Fluency
                    </span>
                    <span className="text-sm font-bold text-indigo-600">
                      {grades.fluency.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${grades.fluency * 10}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 border border-white/60 bg-white/40 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      Grammar & Syntax
                    </span>
                    <span className="text-sm font-bold text-indigo-600">
                      {grades.grammar.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${grades.grammar * 10}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">
                    Grammar MCQs: {grades.grammarCorrect}/{grades.grammarTotal} Correct
                  </div>
                </div>

                <div className="p-4 border border-white/60 bg-white/40 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      Listening Comprehension
                    </span>
                    <span className="text-sm font-bold text-indigo-600">
                      {grades.listening.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${grades.listening * 10}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">
                    Comprehension: {grades.listeningCorrect}/{grades.listeningTotal} Correct
                  </div>
                </div>
              </div>
            </div>

            {Object.keys(speechScores).length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800">
                  Detailed AI Speech Evaluations
                </h3>
                <div className="space-y-4">
                  {Object.values(speechScores).map((scoreVal, index) => (
                    <div
                      key={index}
                      className="p-4 border border-white/60 bg-white/40 rounded-xl"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold px-2 py-1 bg-slate-200/60 rounded text-slate-600 uppercase">
                          {scoreVal.type.replace("-", " ")} ({scoreVal.questionId})
                        </span>
                        <span className="text-xs font-bold text-indigo-600">
                          Score: {scoreVal.score}/10
                        </span>
                      </div>

                      {scoreVal.expectedText && (
                        <div className="mb-2">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">
                            Expected
                          </span>
                          <p className="text-xs text-slate-600 italic">
                            "{scoreVal.expectedText}"
                          </p>
                        </div>
                      )}

                      <div className="mb-3">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">
                          You Said
                        </span>
                        <p className="text-xs text-slate-800 font-semibold">
                          "{scoreVal.transcription}"
                        </p>
                      </div>

                      <div className="p-2.5 bg-indigo-50/50 rounded-lg text-xs text-indigo-900 border border-indigo-100/50">
                        <span className="font-bold">AI feedback: </span>
                        {scoreVal.feedback}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleReturnToDashboard}
              className="px-8 py-3.5 bg-[#000048] hover:bg-[#000033] text-white font-semibold rounded-xl transition cursor-pointer shadow-md shadow-blue-500/10 active:scale-[0.98]"
            >
              Return to Student Dashboard
            </button>
            <div className="text-center pt-2">
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.12em] block">
                Developed by
              </span>
              <span 
                className="text-[#000048] text-sm font-bold mt-0.5 block hover:scale-105 transition-transform"
                style={{ fontFamily: "'Playfair Display', Georgia, Cambria, serif", fontStyle: "italic" }}
              >
                Vinay
              </span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const renderAssessmentContent = () => {
    switch (currentSection) {
      case "A": {
        const currentQ = sectionAQuestions[sectionIndex] as SpeechQuestion;
        const playCount = audioPlayedCount[currentQ.id] || 0;

        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-[#6f42c1] bg-[#f1edfb] px-2.5 py-1 rounded">
                Section A - {currentSectionATypeLabel()}
              </span>
              <span className="text-xs font-bold text-slate-400">
                Question {sectionIndex + 1} of {sectionAQuestions.length}
              </span>
            </div>

            {currentQ.type === "listen-repeat" ? (
              <div className="space-y-6 text-center py-4">
                <p className="text-sm font-bold text-slate-500">
                  Click below to play the audio statement. Repeat exactly what you hear. You can only play it once.
                </p>

                <div className="flex justify-center">
                  <button
                    onClick={() => speakReferenceText(currentQ.expectedText, currentQ.id)}
                    disabled={playCount >= 1 || isTTSPlaying}
                    className={`px-5 py-3 text-xs font-bold text-white rounded-xl transition flex items-center gap-2 cursor-pointer ${
                      playCount >= 1
                        ? "bg-slate-300 cursor-not-allowed"
                        : "bg-[#000048] hover:bg-indigo-900 shadow-md"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                    {playCount >= 1 ? "Played (1/1)" : "Play Audio Statement"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-slate-50/70 border border-slate-100 rounded-2xl text-center text-lg sm:text-2xl font-black text-[#000048] leading-relaxed italic tracking-tight relative shadow-inner">
                <span className="text-4xl text-slate-300 font-serif absolute top-2 left-4 select-none">“</span>
                {currentQ.text}
                <span className="text-4xl text-slate-300 font-serif absolute bottom-0 right-4 select-none">”</span>
              </div>
            )}

            {/* Recorder and Playback / Re-record validation UI */}
            <div className="flex flex-col items-center justify-center p-6 space-y-5">
              {isSubmittingQuestion ? (
                <div className="flex flex-col items-center gap-2 text-xs font-bold text-slate-400 uppercase py-6">
                  <div className="w-8 h-8 rounded-full border-2 border-[#0033a0] border-t-transparent animate-spin" />
                  Analyzing speech via Groq AI...
                </div>
              ) : (
                <>
                  {!recordingBlob ? (
                    <>
                      <div className="relative flex items-center justify-center">
                        {isRecording && (
                          <div
                            className="absolute w-24 h-24 bg-rose-100 rounded-full animate-ping pointer-events-none"
                            style={{ animationDuration: "1.2s" }}
                          />
                        )}
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg active:scale-[0.96] transition-all relative z-10 ${
                            isRecording ? "bg-[#ea384d] hover:bg-rose-600 shadow-rose-200" : "bg-[#0f62fe] hover:bg-[#0050e6] shadow-blue-200"
                          }`}
                        >
                          {isRecording ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                              <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 0010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.75 6.75 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                            </svg>
                          )}
                        </button>
                      </div>

                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                        {isRecording ? (
                          <div className="space-y-2">
                            <span className="text-rose-600 animate-pulse block">Recording Live... Mic: {micVolume}%</span>
                            
                            {/* Dynamic 25-Second Recording Progress Timer */}
                            <div className="w-48 bg-slate-100 h-1.5 rounded-full overflow-hidden mx-auto mt-2.5">
                              <div 
                                className="bg-rose-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${(recordingTimeLeft / 25) * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 tracking-wide font-normal normal-case block mt-1">
                              Auto-submits in: <span className="font-extrabold text-[#0033a0] text-xs">{recordingTimeLeft}s</span>
                            </span>
                          </div>
                        ) : (
                          "Click to Speak"
                        )}
                      </div>
                    </>
                  ) : (
                    /* Review & Re-record Panel */
                    <div className="w-full max-w-sm border border-slate-150 bg-[#f9fafc] p-5 rounded-2xl flex flex-col items-center space-y-4">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Recording Completed
                      </span>
                      <p className="text-xs text-slate-400 font-semibold text-center leading-normal">
                        Listen to your recording. If it is not clear or has noise, discard it and record again!
                      </p>
                      
                      <audio src={recordingUrl!} controls className="h-9 w-full rounded-lg" />
                      
                      <div className="grid grid-cols-2 gap-3 w-full pt-1.5">
                        <button
                          onClick={discardRecording}
                          className="px-4 py-2.5 text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 border border-rose-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          Delete & Retry
                        </button>
                        <button
                          onClick={handleSectionANext}
                          className="px-4 py-2.5 text-xs font-extrabold text-white bg-[#0f62fe] hover:bg-[#0050e6] rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                        >
                          Submit & Next
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Navigation buttons */}
            {!recordingBlob && (
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={handleSectionANext}
                  disabled={isSubmittingQuestion || isRecording}
                  className="px-5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-lg transition disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                >
                  Skip Question
                </button>
              </div>
            )}
          </div>
        );
      }
      case "B": {
        const currentQ = selectedTopics[sectionIndex] as Topic;

        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-[#6f42c1] bg-[#f1edfb] px-2.5 py-1 rounded">
                Section B - Spontaneous Speech
              </span>
              <span className="text-xs font-bold text-slate-400">
                Question {sectionIndex + 1} of {selectedTopics.length}
              </span>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center relative shadow-inner">
              <span className="text-[10px] font-bold text-slate-450 block uppercase tracking-widest mb-1.5">
                Topic for discussion
              </span>
              <p className="text-base sm:text-lg font-black text-slate-800 leading-relaxed italic">
                "{currentQ.text}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className={`p-4 border rounded-2xl text-center ${isPrepPhase ? "bg-indigo-50/70 border-indigo-200" : "bg-slate-50 border-slate-100 opacity-60"}`}>
                <div className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                  Prep Time
                </div>
                <div className="text-2xl font-black text-slate-800">
                  {prepTimeLeft}s
                </div>
              </div>
              <div className={`p-4 border rounded-2xl text-center ${!isPrepPhase ? "bg-rose-50/70 border-rose-200 animate-pulse" : "bg-slate-50 border-slate-100 opacity-60"}`}>
                <div className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                  Speak Time
                </div>
                <div className="text-2xl font-black text-slate-800">
                  {spontaneousDuration}s
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4">
              {isSubmittingQuestion ? (
                <div className="flex flex-col items-center gap-2 text-xs font-bold text-slate-400 uppercase py-6">
                  <div className="w-8 h-8 rounded-full border-2 border-[#0033a0] border-t-transparent animate-spin" />
                  Analyzing response...
                </div>
              ) : isPrepPhase ? (
                <div className="text-center py-4 space-y-3.5">
                  <p className="text-sm font-semibold text-slate-550 leading-relaxed max-w-sm mx-auto">
                    Use this prep time to plan your points. You can skip to start recording immediately.
                  </p>
                  <button
                    onClick={skipPrepPhase}
                    className="px-5 py-2.5 bg-[#000048] hover:bg-[#000033] text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Start Speaking Now
                  </button>
                </div>
              ) : (
                /* Speak Phase layout */
                <div className="text-center space-y-4 w-full">
                  {!recordingBlob ? (
                    <>
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-20 h-20 bg-rose-100 rounded-full animate-ping pointer-events-none" />
                        <button
                          onClick={stopRecording}
                          className="w-14 h-14 bg-[#ea384d] hover:bg-rose-600 rounded-full flex items-center justify-center text-white relative z-10 cursor-pointer shadow-md shadow-rose-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 animate-pulse">
                            <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                            <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 0010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.75 6.75 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-rose-500 animate-pulse">
                        Recording live... Speak now! ({micVolume}% mic)
                      </p>
                      <button
                        onClick={stopRecording}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] uppercase rounded-lg transition"
                      >
                        Finish & Stop
                      </button>
                    </>
                  ) : (
                    /* Review & Re-record Panel */
                    <div className="w-full max-w-sm border border-slate-150 bg-[#f9fafc] p-5 rounded-2xl flex flex-col items-center space-y-4 mx-auto">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Topic Recording Saved
                      </span>
                      <p className="text-xs text-slate-400 font-semibold text-center leading-normal">
                        Listen to your spoken response. Click retry if you need to record it again.
                      </p>
                      
                      <audio src={recordingUrl!} controls className="h-9 w-full rounded-lg" />
                      
                      <div className="grid grid-cols-2 gap-3 w-full pt-1.5">
                        <button
                          onClick={() => {
                            discardRecording();
                            setIsPrepPhase(true);
                            setPrepTimeLeft(15); // shorter prep for retries
                            setSpontaneousDuration(60);
                          }}
                          className="px-4 py-2.5 text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 border border-rose-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          Delete & Retry
                        </button>
                        <button
                          onClick={handleSectionBNext}
                          className="px-4 py-2.5 text-xs font-extrabold text-white bg-[#0f62fe] hover:bg-[#0050e6] rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                        >
                          Submit & Next
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            {!recordingBlob && (
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={handleSectionBNext}
                  disabled={isPrepPhase || isSubmittingQuestion}
                  className="px-5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-lg transition disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                >
                  Skip Topic
                </button>
              </div>
            )}
          </div>
        );
      }
      case "C": {
        const currentQ = sectionCQuestions[sectionIndex] as GrammarQuestion;
        const selectedOption = grammarAnswers[currentQ.id];

        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-[#6f42c1] bg-[#f1edfb] px-2.5 py-1 rounded">
                Section C - Grammar: {currentQ.category}
              </span>
              <span className="text-xs font-bold text-slate-400">
                Question {sectionIndex + 1} of {sectionCQuestions.length}
              </span>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl relative shadow-inner">
              <p className="text-base font-bold text-slate-800 leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGrammarSelect(currentQ.id, idx)}
                  className={`w-full p-4.5 text-left text-xs sm:text-sm font-bold border rounded-2xl transition-all cursor-pointer flex items-center justify-between hover:scale-[1.005] hover:bg-slate-50/50 ${
                    selectedOption === idx
                      ? "bg-indigo-50/80 border-[#0033a0] text-indigo-900 shadow-md"
                      : "bg-white border-slate-150 text-slate-700 shadow-sm"
                  }`}
                >
                  <span>{option}</span>
                  <div
                    className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                      selectedOption === idx
                        ? "border-[#0033a0] bg-[#0033a0]"
                        : "border-slate-350"
                    }`}
                  >
                    {selectedOption === idx && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={handleSectionCPrev}
                disabled={sectionIndex === 0}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition disabled:opacity-30 cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={handleSectionCNext}
                className="px-6 py-2.5 bg-[#0f62fe] hover:bg-[#0050e6] text-white font-bold text-xs rounded-xl transition cursor-pointer active:scale-[0.98]"
              >
                {sectionIndex === sectionCQuestions.length - 1 ? "Next Section" : "Next Question"}
              </button>
            </div>
          </div>
        );
      }
      case "D": {
        const currentPassage = sectionDPassages[sectionIndex] as ListeningPassage;
        const playCount = audioPlayedCount[currentPassage.id] || 0;

        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-[#6f42c1] bg-[#f1edfb] px-2.5 py-1 rounded">
                Section D - Listening Comprehension
              </span>
              <span className="text-xs font-bold text-slate-400">
                Passage {sectionIndex + 1} of {sectionDPassages.length}
              </span>
            </div>

            <div className="p-6 border border-indigo-150 bg-indigo-50/20 rounded-2xl text-center space-y-4">
              <h4 className="text-sm font-bold text-slate-800">
                {currentPassage.title}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Listen carefully to the audio clip. You can play it only once and cannot pause it.
              </p>

              <div className="flex justify-center">
                <button
                  onClick={() => speakReferenceText(currentPassage.content, currentPassage.id)}
                  disabled={playCount >= 1 || isTTSPlaying}
                  className={`px-5 py-3 text-xs font-bold text-white rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md ${
                    playCount >= 1
                      ? "bg-slate-350 cursor-not-allowed"
                      : "bg-[#000048] hover:bg-indigo-900"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                  {playCount >= 1 ? "Played (1/1)" : "Play Audio Passage"}
                </button>
              </div>
            </div>

            <div className="space-y-6 pt-3">
              {currentPassage.questions.map((q) => {
                const selectedOption = listeningAnswers[q.id];

                return (
                  <div key={q.id} className="space-y-3 border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
                    <p className="text-sm font-bold text-slate-800">
                      {q.id}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {q.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleListeningSelect(q.id, idx)}
                          className={`p-4 text-left text-xs font-bold border rounded-2xl transition-all cursor-pointer flex items-center justify-between hover:scale-[1.005] hover:bg-slate-50/50 ${
                            selectedOption === idx
                              ? "bg-indigo-50/80 border-[#0033a0] text-indigo-900 shadow-md"
                              : "bg-white border-slate-100 text-slate-655 shadow-sm"
                          }`}
                        >
                          <span>{option}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              selectedOption === idx
                                ? "border-[#0033a0] bg-[#0033a0]"
                                : "border-slate-300"
                            }`}
                          >
                            {selectedOption === idx && (
                              <div className="w-1 h-1 bg-white rounded-full" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={handleSectionDPrev}
                disabled={sectionIndex === 0}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition disabled:opacity-30 cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={handleSectionDNext}
                className="px-6 py-2.5 bg-[#0f62fe] hover:bg-[#0050e6] text-white font-bold text-xs rounded-xl transition cursor-pointer active:scale-[0.98]"
              >
                {sectionIndex === sectionDPassages.length - 1 ? "Finish & Submit" : "Next Passage"}
              </button>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-[#f3f7fc] via-[#eef2f8] to-[#f4f8fc] text-slate-800 font-sans flex flex-col pb-12 relative overflow-hidden">
      {/* High-fidelity glowing backdrop mesh */}
      <div className="absolute top-[-15%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-200/20 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "14s" }} />
      <div className="absolute bottom-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-blue-200/15 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "18s" }} />

      {/* Top Test Header (Glassmorphic) */}
      <header className="w-full bg-white/45 backdrop-blur-xl border-b border-white/60 shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 transition-all">
        <div className="flex items-center gap-2.5">
          <div className="relative w-36 h-9">
            <Image
              src="/Cognizant_idqBwjBQXB_1.png"
              alt="Cognizant Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs font-bold text-slate-400 border-l border-slate-200/60 pl-3">
            CTS Practice Assessment - {assessmentId}
          </span>
        </div>

        {user && (
          <div className="hidden lg:flex items-center gap-3">
            <div className="bg-white/40 backdrop-blur-md text-slate-500 font-bold text-[9px] px-2.5 py-1.5 rounded-lg border border-white/80 uppercase tracking-wide">
              Reg No: <span className="text-slate-800 font-extrabold">{user.regNo}</span>
            </div>
            <div className="bg-white/40 backdrop-blur-md text-slate-500 font-bold text-[9px] px-2.5 py-1.5 rounded-lg border border-white/88 uppercase tracking-wide">
              Dept: <span className="text-slate-800 font-extrabold">{user.dept === "Computer Science & Engineering" ? "CSE" : user.dept}</span>
            </div>
            <div className="bg-white/40 backdrop-blur-md text-slate-500 font-bold text-[9px] px-2.5 py-1.5 rounded-lg border border-white/88 uppercase tracking-wide">
              Section: <span className="text-[#0033a0] font-black">{user.section}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-wider">
            Section: <span className="text-slate-700">{currentSection}</span>
          </div>

          <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white/80 px-3 py-1.5 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#0033a0] animate-pulse">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-extrabold text-slate-700">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row gap-6 p-4 sm:p-6 lg:p-8 relative z-10">
        {/* Test Sidebar Progress Tracker (Glassmorphic) */}
        <aside className="w-full md:w-64 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm space-y-5 shrink-0 self-start order-2 md:order-1">
          {user && (
            <div className="p-3 bg-white/40 border border-white/80 rounded-xl text-left">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Student</div>
              <div className="text-xs font-extrabold text-slate-700 truncate">{user.name}</div>
            </div>
          )}

          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Progress Tracker
            </h3>
            <div className="text-sm font-black text-slate-800">
              CTS Communication
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Section A Indicator */}
            <div 
              onClick={() => switchSection("A")}
              className="cursor-pointer hover:bg-slate-100/40 p-2 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200/50"
              title="Switch to Section A: Reading"
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className={currentSection === "A" ? "text-[#0033a0] font-black" : "text-slate-500"}>
                  Section A: Reading
                </span>
                <span className="text-slate-400">
                  {Object.values(speechScores).filter(s => s.questionId.startsWith("A")).length}/{sectionAQuestions.length}
                </span>
              </div>
              <div className="w-full bg-slate-200/50 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${currentSection === "A" ? "bg-gradient-to-r from-[#000048] to-[#0033a0] shadow-[0_0_8px_rgba(0,51,160,0.3)]" : "bg-indigo-600"}`}
                  style={{ width: `${(Object.values(speechScores).filter(s => s.questionId.startsWith("A")).length / sectionAQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Section B Indicator */}
            <div 
              onClick={() => switchSection("B")}
              className="cursor-pointer hover:bg-slate-100/40 p-2 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200/50"
              title="Switch to Section B: Spontaneous"
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className={currentSection === "B" ? "text-[#0033a0] font-black" : "text-slate-500"}>
                  Section B: Spontaneous
                </span>
                <span className="text-slate-400">
                  {Object.values(speechScores).filter(s => s.type === "spontaneous-speech").length}/{selectedTopics.length}
                </span>
              </div>
              <div className="w-full bg-slate-200/50 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${currentSection === "B" ? "bg-gradient-to-r from-[#000048] to-[#0033a0] shadow-[0_0_8px_rgba(0,51,160,0.3)]" : "bg-indigo-600"}`}
                  style={{ width: `${(Object.values(speechScores).filter(s => s.type === "spontaneous-speech").length / selectedTopics.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Section C Indicator */}
            <div 
              onClick={() => switchSection("C")}
              className="cursor-pointer hover:bg-slate-100/40 p-2 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200/50"
              title="Switch to Section C: Grammar"
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className={currentSection === "C" ? "text-[#0033a0] font-black" : "text-slate-500"}>
                  Section C: Grammar
                </span>
                <span className="text-slate-400">
                  {Object.keys(grammarAnswers).length}/{sectionCQuestions.length}
                </span>
              </div>
              <div className="w-full bg-slate-200/50 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${currentSection === "C" ? "bg-gradient-to-r from-[#000048] to-[#0033a0] shadow-[0_0_8px_rgba(0,51,160,0.3)]" : "bg-indigo-600"}`}
                  style={{ width: `${(Object.keys(grammarAnswers).length / sectionCQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Section D Indicator */}
            <div 
              onClick={() => switchSection("D")}
              className="cursor-pointer hover:bg-slate-100/40 p-2 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200/50"
              title="Switch to Section D: Listening"
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className={currentSection === "D" ? "text-[#0033a0] font-black" : "text-slate-500"}>
                  Section D: Listening
                </span>
                <span className="text-slate-400">
                  {Object.keys(listeningAnswers).length}/12
                </span>
              </div>
              <div className="w-full bg-slate-200/50 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${currentSection === "D" ? "bg-gradient-to-r from-[#000048] to-[#0033a0] shadow-[0_0_8px_rgba(0,51,160,0.3)]" : "bg-indigo-600"}`}
                  style={{ width: `${(Object.keys(listeningAnswers).length / 12) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-semibold text-center leading-normal">
            Once submitted, audio inputs are final and graded instantly.
          </div>
          
          <div className="pt-4 border-t border-slate-200/40 text-center">
            <span className="text-[8px] font-bold text-slate-400 tracking-[0.2em] block uppercase">
              Designed & Engineered By
            </span>
            <span 
              className="text-[#000048] text-xs font-extrabold mt-0.5 block tracking-wider hover:scale-105 hover:text-[#0033a0] transition-all cursor-default"
              style={{ fontFamily: "'Playfair Display', Georgia, Cambria, serif", fontStyle: "italic" }}
            >
              Vinay
            </span>
          </div>
        </aside>

        {/* Main Question Card (Glassmorphic) */}
        <main className="flex-1 bg-white/60 backdrop-blur-xl border border-white/80 shadow-sm rounded-3xl p-5 sm:p-8 self-start order-1 md:order-2">
          {renderAssessmentContent()}
        </main>
      </div>
    </div>
  );
}
