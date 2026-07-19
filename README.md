# FanBridge AI — FIFA World Cup 2026 Stadium Operations Companion

A real-time stadium operations and fan assistance dashboard for the FIFA World Cup 2026. FanBridge AI supports MetLife Stadium, SoFi Stadium, and Estadio Azteca, providing live concourse telemetry, queue tracking, carbon-offset metrics, and a voice-activated, multilingual AI assistant.

Built with Next.js 16, TypeScript, and Tailwind CSS. Features a glassmorphic responsive interface with complete cross-device support.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Security Features](#security-features)
- [Accessibility Features](#accessibility-features)
- [AI Fallback Architecture](#ai-fallback-architecture)
- [Supported Languages](#supported-languages)
- [Browser Compatibility](#browser-compatibility)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Problem Statement

Large-scale stadium events generate congestion, accessibility challenges, and information gaps for fans, volunteers, and staff. Attendees need real-time guidance on gate wait times, crowd density, accessible routes, transport options, and emergency procedures — in their preferred language.

## Solution

FanBridge AI unifies live stadium telemetry with a context-aware AI assistant. It provides:

- **Interactive crowd density heatmaps** rendered as SVG concourse blueprints with real-time data
- **Gate clearance tracking** with wait times, accessibility indicators, and live progress bars
- **Multilingual voice interaction** via Web Speech API (13 languages for STT/TTS)
- **Role-based dashboards** for fans, volunteers, staff, and organizers
- **Automatic AI fallback** to a local semantic engine when the Groq API is unavailable

---

## Key Features

| Feature | Description |
|---|---|
| Live Telemetry | Crowd zone density and gate wait times refresh every 8 seconds |
| AI Chat Assistant | Context-aware responses using intent classification and venue data |
| Voice Control | Speech-to-text input and text-to-speech output in 13 languages |
| Interactive Heatmap | Clickable SVG stadium blueprint linked to AI queries |
| Role-Based Views | Fan, Volunteer, Staff, and Organizer personas with tailored UI |
| Transport Tracking | Shuttle load factors, parking lot occupancy, rideshare zones |
| Sustainability Metrics | Carbon offset and solar energy gauges per venue |
| Security Guardrails | Rate limiting, prompt injection defense, input sanitization |
| Local AI Fallback | Fully functional without external API keys |
| Responsive Design | Optimized for desktop, tablet, and mobile viewports |

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────┐
│                    Client (Next.js App Router)          │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ AppHeader│  │Dashboard │  │ChatPanel │              │
│  │          │  │Components│  │          │              │
│  └──────────┘  └────┬─────┘  └────┬─────┘              │
│                     │              │                     │
│  ┌──────────────────┴──────────────┴─────────────────┐  │
│  │              Custom Hooks Layer                    │  │
│  │  useDashboard · useChat · useSpeechRecognition    │  │
│  └──────────────────┬──────────────┬─────────────────┘  │
└─────────────────────┼──────────────┼────────────────────┘
                      │              │
              ┌───────▼───┐  ┌───────▼───────┐
              │/api/       │  │/api/chat      │
              │dashboard/  │  │               │
              │[venueId]   │  │  ┌──────────┐ │
              │            │  │  │ Security │ │
              │ Telemetry  │  │  │ Layer    │ │
              │ Simulator  │  │  └────┬─────┘ │
              └──────┬─────┘  │       │       │
                     │        │  ┌────▼─────┐ │
              ┌──────▼─────┐  │  │  Intent  │ │
              │  dataStore │  │  │Classifier│ │
              │  (JSON DB) │  │  └────┬─────┘ │
              └────────────┘  │       │       │
                              │  ┌────▼─────┐ │
                              │  │LLM Service│ │
                              │  │Groq / Local│ │
                              │  └──────────┘ │
                              └───────────────┘
```

### Request Flow

1. User sends a message (text or voice input)
2. Chat API validates, sanitizes, and rate-limits the request
3. Intent classifier categorizes the query (emergency, navigation, crowd, etc.)
4. LLM service builds a context snippet from the venue database
5. If Groq API is configured → sends to Groq with context-injected prompt
6. If Groq is unavailable → local semantic engine generates a response
7. Response is cached (except emergency queries) and returned to the client

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server-side rendering, API routes |
| Language | TypeScript 5 | Type-safe development |
| UI | React 19 | Component-based UI |
| Styling | Tailwind CSS 4 | Utility-first CSS with glassmorphic design |
| AI Backend | Groq API (LLaMA 3.1 8B) | LLM inference for chat responses |
| Voice | Web Speech API | Browser-native STT and TTS |
| Data | JSON file database | Venue, operations, and analytics data |

---

## Project Structure

```text
├── data/
│   └── stadium_context.json          # Venue database (MetLife, SoFi, Azteca)
├── scripts/
│   └── run-tests.ts                  # Custom assertion-based test runner
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts         # Chat endpoint with rate limits
│   │   │   ├── dashboard/[venueId]/route.ts  # Live telemetry provider
│   │   │   ├── languages/route.ts    # Supported languages endpoint
│   │   │   └── venues/route.ts       # Venue metadata endpoint
│   │   ├── globals.css               # Design tokens and glassmorphic styles
│   │   ├── layout.tsx                # Root layout with font configuration
│   │   └── page.tsx                  # Main page (composes all components)
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatMessage.tsx       # Individual message bubble
│   │   │   └── ChatPanel.tsx         # Full AI assistant panel
│   │   ├── dashboard/
│   │   │   ├── CrowdHeatmap.tsx      # SVG concourse heatmap
│   │   │   ├── GateBoard.tsx         # Gate clearance board
│   │   │   ├── OperationsAlerts.tsx  # Staff alerts and medical points
│   │   │   ├── PersonaPanel.tsx      # Role-specific views
│   │   │   ├── StadiumSummaryBanner.tsx  # Venue summary card
│   │   │   └── TransportPanel.tsx    # Shuttles, parking, eco gauges
│   │   ├── ui/
│   │   │   ├── CircularGauge.tsx     # Reusable SVG progress gauge
│   │   │   ├── ProgressBar.tsx       # Reusable progress bar
│   │   │   └── StatusBadge.tsx       # Reusable status badge
│   │   ├── AppHeader.tsx             # Header with selectors
│   │   └── MobileTabSwitcher.tsx     # Mobile tab navigation
│   ├── hooks/
│   │   ├── useChat.ts               # Chat state management
│   │   ├── useDashboard.ts          # Dashboard polling
│   │   ├── useSpeechRecognition.ts  # Speech-to-text hook
│   │   └── useSpeechSynthesis.ts    # Text-to-speech hook
│   ├── lib/
│   │   ├── dataStore.ts             # JSON database loader with caching
│   │   ├── intent.ts                # Semantic intent classifier
│   │   ├── llmService.ts            # Groq API integration and local fallback
│   │   ├── security.ts              # Rate limiting, injection defense
│   │   └── utils.ts                 # Shared utility functions
│   ├── constants.ts                 # Application-wide constants
│   └── types.ts                     # Centralized TypeScript type definitions
├── eslint.config.mjs
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Installation

### Prerequisites

- Node.js 18+ and npm
- A Groq API key (optional — the app works without one)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd fanbridgeassistant

# Install dependencies
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Required for Groq-powered AI responses (optional — local fallback is automatic)
GROQ_API_KEY=your_groq_api_key_here

# Optional LLM configuration
LLM_MODEL=llama-3.1-8b-instant
LLM_TEMPERATURE=0.4
LLM_MAX_TOKENS=300
CACHE_TTL_S=30
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | No | — | Groq API key for LLM-powered responses |
| `LLM_MODEL` | No | `llama-3.1-8b-instant` | Model identifier for the Groq API |
| `LLM_TEMPERATURE` | No | `0.4` | Response creativity (0.0–1.0) |
| `LLM_MAX_TOKENS` | No | `300` | Maximum response token length |
| `CACHE_TTL_S` | No | `30` | Cache duration for repeated queries (seconds) |

---

## Running the Project

```bash
# Start the development server
npm run dev
```

Open **http://localhost:3000** to access the dashboard.

```bash
# Build for production
npm run build

# Start the production server
npm run start
```

---

## Testing

The project includes a custom assertion-based test suite covering security, intent classification, and data store integrity.

```bash
npm run test
```

### Test Coverage

| Area | Tests | What is Verified |
|---|---|---|
| Input Sanitization | 1 | Whitespace normalization |
| Injection Defense | 2 | Detection of adversarial prompts and acceptance of legitimate queries |
| Rate Limiting | 1 | Request throttling enforcement |
| Intent Classification | 4 | Navigation, emergency, sustainability, and transport intent mapping |
| Data Store | 3 | Venue metadata retrieval, match schedule loading, operations data |

```bash
# Run ESLint
npm run lint
```

---

## Security Features

- **Client IP Rate Limiting**: Sliding window rate limiter (20 requests per 60-second window) tracks per-client request frequency
- **Prompt Injection Defense**: Lexical scanner detects adversarial inputs (e.g., "ignore previous instructions") and returns a safe response
- **Input Sanitization**: Whitespace normalization and 800-character length enforcement on all user messages
- **API Key Isolation**: Environment variables are excluded from version control via `.gitignore`
- **Error Boundary**: All API routes use try-catch with typed error handling; no stack traces are exposed to clients

---

## Accessibility Features

- `aria-label` attributes on all interactive elements (buttons, SVG zones, form inputs)
- `aria-live="polite"` on the chat loading indicator for screen reader announcements
- `role="button"` and keyboard event handlers on interactive SVG heatmap zones
- Semantic HTML structure with proper heading hierarchy
- Keyboard-navigable form controls with visible focus indicators
- No system emojis in UI components (avoids OS-dependent rendering)

---

## AI Fallback Architecture

When `GROQ_API_KEY` is absent or the Groq API returns an error, the system automatically routes through a **local semantic inference engine**:

1. The intent classifier categorizes the user's query
2. The relevant venue data is loaded from the JSON database
3. A response is assembled using the classified intent and venue-specific data
4. Multilingual support is provided for English, Spanish, and French fallback responses

This ensures the application is fully functional for evaluators and users without API credentials.

---

## Supported Languages

The following languages are supported for voice input (STT), voice output (TTS), and AI responses:

| Language | STT/TTS | AI Responses |
|---|---|---|
| English | Yes | Yes (Groq + Local) |
| Spanish | Yes | Yes (Groq + Local) |
| French | Yes | Yes (Groq + Local) |
| Portuguese | Yes | Groq only |
| German | Yes | Groq only |
| Italian | Yes | Groq only |
| Telugu | Yes | Groq only |
| Hindi | Yes | Groq only |
| Japanese | Yes | Groq only |
| Korean | Yes | Groq only |
| Mandarin Chinese | Yes | Groq only |
| Russian | Yes | Groq only |
| Turkish | Yes | Groq only |

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Core Application | Yes | Yes | Yes | Yes |
| Speech Recognition (STT) | Yes | No | Yes | Yes |
| Speech Synthesis (TTS) | Yes | Yes | Yes | Yes |
| Glassmorphic Backdrop | Yes | Yes | Yes | Yes |

Speech Recognition uses the Web Speech API, which requires Chromium-based browsers or Safari. The application gracefully degrades with an error message when STT is unavailable.

---

## Future Improvements

- [ ] Add WebSocket support for real-time telemetry instead of polling
- [ ] Implement server-side authentication for staff/organizer personas
- [ ] Add integration tests with Playwright or Cypress
- [ ] Support additional LLM providers (OpenAI, Anthropic)
- [ ] Add offline support with service workers
- [ ] Implement dark mode toggle
- [ ] Add data visualization charts for organizer analytics

---

## License

This project is private. All rights reserved.
