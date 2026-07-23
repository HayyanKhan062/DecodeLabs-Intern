import React, { useState, useRef, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatProvider, useChat } from './contexts/ChatContext';
import { AuthProvider } from './contexts/AuthContext';
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
import { Sparkles, ArrowDown } from 'lucide-react';

function ChatContentArea() {
  const { activeSession, isGenerating, settings } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messages = activeSession ? activeSession.messages : [];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (settings.autoScroll) {
      scrollToBottom();
    }
  }, [messages, isGenerating, settings.autoScroll]);

  // Handle scroll bottom button visibility
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isFarFromBottom);
  };

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
