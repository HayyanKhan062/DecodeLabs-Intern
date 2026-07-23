# Axiom AI 🤖✨

> **Think Smarter. Respond Faster.**

Axiom AI is an ultra-modern, production-ready AI chatbot application built with React 19, TypeScript, Tailwind CSS v4, and Google Gemini API. Designed with dark glassmorphism aesthetic, soft glow ambient gradients, full file attachments (PDF, DOCX, TXT, CSV, Images), Web Speech voice typing, and a multi-provider architecture.

![Axiom AI Logo](./public/axiom-logo.jpg)

---

## 🌟 Key Features

- **Ultra-Modern Glassmorphism UI**: Dark theme luxury design with smooth Framer Motion micro-interactions, customizable accent color palettes, and ambient glow lighting.
- **Multi-Model Architecture**:
  - Google Gemini 2.5 Flash & 2.5 Pro (Default)
  - OpenAI GPT-4o & GPT-4o Mini
  - Anthropic Claude 3.5 Sonnet
  - DeepSeek V3 / R1
  - Groq Llama 3.3 70B
- **Real-Time Streaming Responses**: Powered by server-side streaming via `@google/genai` and express API proxy.
- **Rich Document & File Support**: Drag and drop or upload PDF, DOCX, TXT, CSV, JSON, and Images with multimodal vision analysis.
- **Full Chat Controls**:
  - Code syntax highlighting with line counters and copy code buttons.
  - Formatted tables, lists, and markdown rendering.
  - Message reactions (Like / Dislike / Copy / Regenerate / Edit prompt / Delete).
  - Voice typing via Web Speech API.
  - Stop generating button.
- **Local Storage Persistence**: Save chats locally with search (`Ctrl+K`), pin, rename, export (TXT, Markdown, JSON, PDF), and clear history capabilities.
- **Keyboard Shortcuts**: `Ctrl+K` for Search, `Ctrl+N` for New Chat, `Ctrl+/` for Input Focus, `Esc` to close Modals.

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js 18+ or Bun
- npm or pnpm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/axiom-ai.git
cd axiom-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` or `.env.local`:
```bash
cp .env.example .env
```

Open `.env` and paste your Google Gemini API key:
```env
# Paste your Google Gemini API Key below
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
```

> **Note**: You can also enter custom API keys directly inside the **Axiom Settings UI** in your browser!

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📁 Project Folder Structure

```
.
├── .env.example                # Environment variable guidelines
├── README.md                   # Project documentation
├── metadata.json               # Platform configuration
├── package.json                # Dependencies and scripts
├── public/
│   └── axiom-logo.jpg          # Axiom AI branding logo
├── server.ts                   # Express server entry point
├── src/
│   ├── App.tsx                 # Main application layout & context providers
│   ├── index.css               # Global Tailwind CSS v4 setup & custom styles
│   ├── main.tsx                # React entry point
│   ├── config/
│   │   └── api.ts              # API configurations & system instruction
│   ├── contexts/
│   │   ├── ChatContext.tsx     # Chat state, sessions, streaming & settings
│   │   └── ThemeContext.tsx    # Theme & accent color manager
│   ├── lib/
│   │   ├── ai-providers.ts     # Available AI models & provider meta
│   │   ├── export.ts           # TXT, MD, JSON, PDF export utilities
│   │   ├── file-utils.ts       # PDF, DOCX, CSV, Image document parser
│   │   ├── gemini-server.ts    # Server-side Gemini API stream proxy
│   │   └── speech.ts           # Speech recognition wrapper
│   ├── types/
│   │   └── chat.ts             # TypeScript interface definitions
│   └── components/
│       ├── chat/
│       │   ├── AttachmentPreview.tsx
│       │   ├── ChatInput.tsx
│       │   ├── ChatMessage.tsx
│       │   ├── CodeBlock.tsx
│       │   └── WelcomeScreen.tsx
│       ├── layout/
│       │   ├── Navbar.tsx
│       │   └── Sidebar.tsx
│       ├── modals/
│       │   ├── AboutModal.tsx
│       │   ├── RenameModal.tsx
│       │   ├── SearchModal.tsx
│       │   ├── SettingsModal.tsx
│       │   └── ShortcutsModal.tsx
│       └── ui/
│           ├── GlowCard.tsx
│           └── Modal.tsx
└── vite.config.ts              # Vite configuration & dev server API plugin
```

---

## 🚢 Deployment Guide

### Deploying to Vercel
1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com) and import your repository.
3. Add the `GEMINI_API_KEY` in Vercel's **Environment Variables** section.
4. Click **Deploy**. Vercel will automatically build and deploy Axiom AI.

### Deploying to Docker / Cloud Run
```bash
npm run build
npm start
```

---

## 📄 License
Apache-2.0 License. Built for production excellence.
