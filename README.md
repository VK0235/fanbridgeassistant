# Cognizant Practice Speech Assessment Portal

An advanced, GenAI-powered speech evaluation and language practice portal built for candidates. This secure, production-grade application evaluates English speaking clarity, auditory repetition accuracy, grammatical control, and listening comprehension.

Powered by **Groq Whisper** (real-time voice transcription) and **Groq Llama 3** (automated structural grading and feedback) inside a high-fidelity **glassmorphic responsive UI**.

---

## Key Features

- **Dynamic Candidate Registry (Excel Integration)**: 
  - Verified against an official registry of **1,420 eligible candidates** parsed directly from raw spreadsheet data.
  - Zero hardcoding: typing an eligible email triggers a 1-second simulated secure database query and auto-populates candidate Name, Registration Number, Department, and Section.
- **Glassmorphism Design System**:
  - Semi-transparent floating glass cards (`bg-white/60 backdrop-blur-xl border-white/80`) and glowing backdrop blobs.
  - No generic AI-generated layouts: custom micro-animations, hover scaling, responsive container wraps, and click-revealed dropdown menus.
- **Audio Review & Re-record Control**:
  - Candidates can review their recorded audio using a built-in player. If they made a mistake or had ambient noise, they can discard the clip and re-record it before submitting it to the AI.
- **25-Second Auto-Submit Timer**:
  - Integrated into Section A speaking cards. It displays a live countdown timer and automatically stops and locks the recording at 25 seconds.
- **Auto-Save Session Recovery**:
  - Automatically backups progress state (`currentSection`, `sectionIndex`, answers, and scores) to `localStorage` on every interaction. If the page is refreshed or the browser closes, the candidate recovers instantly.
- **4-Section Evaluation Structure**:
  - **Section A**: Reading aloud & auditory repeat sentences with native Speech Synthesis (TTS) playbacks.
  - **Section B**: Spontaneous speaking topics with prep countdowns.
  - **Section C**: Grammar multiple-choice assessments.
  - **Section D**: Listening comprehension passages.
- **Groq AI Grading Route**:
  - Backend API (`/api/assess`) transcribes speech and grades pronunciation, fluency, grammar, vocabulary, coherence, and accuracy, returning a CEFR score (A2 to C2) and constructive feedback.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS (Frosted Glass and Responsive Flexbox)
- **Language**: TypeScript
- **Audio Capturing**: HTML MediaRecorder API
- **Audio Playback**: HTML Audio API & Web Speech Synthesis API
- **AI Backend**: Groq REST SDK (Whisper-large-v3-turbo & Llama-3.3-70b-versatile)

---

## Installation & Setup

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
   *Note: Environment variables are strictly kept on the backend server and never leaked to client components.*

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```
   *During compile, the 1,420 candidate JSON directory is statically bundled, eliminating runtime file dependencies.*

---

## Developed By
**Designed & Engineered by Vinay**  
*Corporate Assessment Solutions Provider*
