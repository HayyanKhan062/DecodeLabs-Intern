import React, { useState, useRef, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatProvider, useChat } from './contexts/ChatContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { WelcomeScreen } from './components/chat/WelcomeScreen';
import { ChatMessage } from './components/chat/ChatMessage';
import { ChatInput } from './components/chat/ChatInput';
import { SettingsModal } from './components/modals/SettingsModal';
import { SearchModal } from './components/modals/SearchModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { AboutModal } from './components/modals/AboutModal';
import { RenameModal } from './components/modals/RenameModal';
import { AuthModal } from './components/modals/AuthModal';
import { ChatSession } from './types/chat';
import { Sparkles, ArrowDown, LogIn, UserPlus, Lock } from 'lucide-react';

function ChatContentArea() {
  const { activeSession, isGenerating, settings } = useChat();
  const { isAuthenticated, openAuthModal, continueAsGuest } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messages = activeSession ? activeSession.messages : [];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAuthenticated && settings.autoScroll) {
      scrollToBottom();
    }
  }, [messages, isGenerating, settings.autoScroll, isAuthenticated]);

  // Handle scroll bottom button visibility
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isFarFromBottom);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-4rem)] relative overflow-hidden bg-slate-950 text-slate-100">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-blue-600/10 via-purple-600/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex-1 flex items-center justify-center p-6 text-center z-10">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl p-[1px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full rounded-[15px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Welcome to Axiom AI
              </h2>
              <p className="text-sm font-semibold text-purple-300">
                Please sign in, create an account, or continue as guest to use Axiom AI.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Access next-generation AI intelligence, multi-modal file synthesis, custom system instructions, and fast conversation search.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-xs transition-all"
                >
                  <UserPlus className="w-4 h-4 text-purple-400" />
                  <span>Sign Up</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider absolute">
                  Or
                </span>
              </div>

              <button
                onClick={continueAsGuest}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/80 text-cyan-300 hover:text-cyan-200 font-semibold text-xs transition-all shadow-md"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Continue as Guest</span>
              </button>
            </div>
          </div>
        </div>
        <ChatInput />
      </div>
    );
  }

  // Map chat width settings to Tailwind max-width class
  const widthClass = {
    compact: 'max-w-2xl',
    standard: 'max-w-4xl',
    wide: 'max-w-6xl',
  }[settings.chatWidth || 'standard'];

  return (
    <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-4rem)] relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Ambient background glowing accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-blue-600/10 via-purple-600/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Messages or Welcome View */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative z-10 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div className={`w-full ${widthClass} mx-auto py-6 space-y-1`}>
            {messages.map((message, idx) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLast={idx === messages.length - 1}
              />
            ))}

            {/* AI Typing / Streaming Indicator */}
            {isGenerating && (
              <div className="flex items-center gap-3 px-6 py-4 text-xs text-purple-400 font-medium animate-pulse">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Axiom is thinking & synthesizing response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Scroll to Bottom button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-28 right-8 z-30 p-2.5 rounded-full bg-slate-900/90 border border-slate-700 shadow-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Chat Input Floating Bar */}
      <ChatInput />
    </div>
  );
}

export default function App() {
  const [renameTarget, setRenameTarget] = useState<ChatSession | null>(null);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <div className="min-h-screen flex flex-col bg-slate-950 font-sans antialiased text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
            <Navbar />

            <div className="flex-1 flex overflow-hidden">
              <Sidebar onRenameRequest={(session) => setRenameTarget(session)} />
              <ChatContentArea />
            </div>

            {/* Global Modals */}
            <SettingsModal />
            <SearchModal />
            <ShortcutsModal />
            <AboutModal />
            <AuthModal />
            <RenameModal
              session={renameTarget}
              isOpen={!!renameTarget}
              onClose={() => setRenameTarget(null)}
            />
          </div>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
