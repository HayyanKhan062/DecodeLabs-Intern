import React from 'react';
import { motion } from 'motion/react';
import {
  Code,
  FileText,
  Sparkles,
  Database,
  Globe,
  Terminal,
  ArrowRight,
} from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';

interface SuggestedPrompt {
  title: string;
  category: string;
  prompt: string;
  icon: React.ReactNode;
  gradient: string;
}

export const WelcomeScreen: React.FC = () => {
  const { sendMessage } = useChat();

  const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
    {
      title: 'Explain React',
      category: 'Frontend Development',
      prompt: 'Explain React fundamentals including Virtual DOM, Hooks, and Component State in clear, structured terms with code examples.',
      icon: <Code className="w-5 h-5 text-blue-400" />,
      gradient: 'from-blue-500/10 to-indigo-500/10 hover:border-blue-500/50',
    },
    {
      title: 'Write Python code',
      category: 'Software Engineering',
      prompt: 'Write a production-ready Python script that fetches data from an API, processes JSON, and handles errors with full typing.',
      icon: <Terminal className="w-5 h-5 text-purple-400" />,
      gradient: 'from-purple-500/10 to-pink-500/10 hover:border-purple-500/50',
    },
    {
      title: 'Summarize PDF',
      category: 'Document Analysis',
      prompt: 'How can you help me summarize a PDF or document? Explain your document reading and analytical capabilities.',
      icon: <FileText className="w-5 h-5 text-cyan-400" />,
      gradient: 'from-cyan-500/10 to-teal-500/10 hover:border-cyan-500/50',
    },
    {
      title: 'Generate SQL Query',
      category: 'Data & Databases',
      prompt: 'Generate an optimized SQL query with INNER JOINs, GROUP BY aggregations, and window functions for a user analytics table.',
      icon: <Database className="w-5 h-5 text-amber-400" />,
      gradient: 'from-amber-500/10 to-orange-500/10 hover:border-amber-500/50',
    },
    {
      title: 'Create Portfolio Website',
      category: 'UI/UX & Web Development',
      prompt: 'Guide me step-by-step to build a modern developer portfolio website using React, Tailwind CSS, and glassmorphism styling.',
      icon: <Globe className="w-5 h-5 text-emerald-400" />,
      gradient: 'from-emerald-500/10 to-green-500/10 hover:border-emerald-500/50',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-5xl mx-auto text-center my-auto">
      {/* Robot Logo with Neon Halo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mb-8 group"
      >
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700 animate-pulse" />
        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-3xl p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-2xl shadow-blue-500/30">
          <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center overflow-hidden">
            <img
              src="/axiom-logo.jpg"
              alt="Axiom AI Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </motion.div>

      {/* Greeting Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-3 mb-10 max-w-2xl"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-100">
          Hello 👋 <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            I'm Axiom.
          </span>
        </h1>
        <p className="text-lg md:text-xl font-medium text-slate-300">
          Think Smarter. Respond Faster.
        </p>
        <p className="text-sm md:text-base text-slate-400">
          How can I help you today?
        </p>
      </motion.div>

      {/* Suggested Prompts Cards Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full text-left"
      >
        {SUGGESTED_PROMPTS.map((item, idx) => (
          <div
            key={idx}
            onClick={() => sendMessage(item.prompt)}
            className={`
              group relative p-5 rounded-2xl cursor-pointer
              bg-slate-900/60 backdrop-blur-xl border border-slate-800/80
              bg-gradient-to-br ${item.gradient}
              transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10
              flex flex-col justify-between
            `}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0">
                  {item.icon}
                </div>
                <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-2 py-0.5 rounded-full bg-slate-950/50">
                  {item.category}
                </span>
              </div>
              <h3 className="font-semibold text-slate-200 text-base mb-1 group-hover:text-blue-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {item.prompt}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-end text-xs font-medium text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Ask Axiom</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Capabilities Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 flex items-center gap-2 text-xs text-slate-500 bg-slate-900/40 px-4 py-2 rounded-full border border-slate-800/60"
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span>Powered by AX Nova 1.0 & Multimodal Vision • Supports PDF, DOCX, CSV, Images</span>
      </motion.div>
    </div>
  );
};
