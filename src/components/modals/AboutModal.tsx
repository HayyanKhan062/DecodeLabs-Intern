import React from 'react';
import { Modal } from '../ui/Modal';
import { useChat } from '../../contexts/ChatContext';
import { Info, Sparkles, ShieldCheck, Zap, Code, Heart, User, CheckCircle } from 'lucide-react';

export const AboutModal: React.FC = () => {
  const { isAboutOpen, setIsAboutOpen } = useChat();

  return (
    <Modal
      isOpen={isAboutOpen}
      onClose={() => setIsAboutOpen(false)}
      title="About Axiom AI"
      icon={<Info className="w-5 h-5 text-cyan-400" />}
      maxWidth="md"
    >
      <div className="space-y-5 text-xs text-slate-200">
        {/* Main Glassmorphism Brand Card */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="relative w-16 h-16 rounded-2xl p-[1.5px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-xl shadow-purple-600/20 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center overflow-hidden">
                <img src="/axiom-logo.jpg" alt="Axiom AI Logo" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Axiom AI
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-semibold">
                  Version 1.0
                </span>
              </div>
              <p className="text-slate-300 font-medium text-xs mt-0.5">
                Think Smarter. Respond Faster.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold mt-1">
                <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Developed by <strong className="text-white font-bold">Hayyan Khan</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Description */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 leading-relaxed text-slate-300 space-y-2">
          <p>
            <strong>Axiom AI</strong> is a next-generation intelligence workspace designed for high-performance reasoning, code synthesis, multimodal document analysis, and intuitive multi-model interaction powered by <strong>AX Nova 1.0</strong>.
          </p>
        </div>

        {/* Core Highlights Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-200">AX Nova 1.0 Engine</p>
              <p className="text-[10px] text-slate-400">Next-gen multimodal intelligence</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-200">Production Ready</p>
              <p className="text-[10px] text-slate-400">Deployable on Vercel & GitHub</p>
            </div>
          </div>
        </div>

        {/* Tech Stack Pills */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
            Built With Modern Tech
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Express.js', 'Google GenAI'].map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Footer & Copyright */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by <strong className="text-slate-300">Hayyan Khan</strong></span>
          </div>
          <span>© 2026 Axiom AI. All rights reserved.</span>
        </div>
      </div>
    </Modal>
  );
};

