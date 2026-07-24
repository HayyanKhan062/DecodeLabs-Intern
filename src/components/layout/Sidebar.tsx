import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Download,
  Settings,
  Info,
  Keyboard,
  X,
  ChevronRight,
  Sparkles,
  FileText,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { ChatSession } from '../../types/chat';
import {
  exportChatAsTxt,
  exportChatAsMarkdown,
  exportChatAsJson,
  exportChatAsPdf,
} from '../../lib/export';

interface SidebarProps {
  onRenameRequest: (session: ChatSession) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onRenameRequest }) => {
  const {
    sessions,
    activeSessionId,
    selectSession,
    createNewChat,
    deleteSession,
    togglePinSession,
    clearHistory,
    isSidebarOpen,
    setIsSidebarOpen,
    setIsSettingsOpen,
    setIsSearchOpen,
    setIsShortcutsOpen,
    setIsAboutOpen,
    activeSession,
  } = useChat();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [filterText, setFilterText] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Filtered session list
  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(filterText.toLowerCase())
  );

  const pinnedSessions = filtered.filter((s) => s.pinned);
  const recentSessions = filtered.filter((s) => !s.pinned);

  const handleExport = (type: 'txt' | 'md' | 'json' | 'pdf') => {
    if (!activeSession) return;
    if (type === 'txt') exportChatAsTxt(activeSession);
    if (type === 'md') exportChatAsMarkdown(activeSession);
    if (type === 'json') exportChatAsJson(activeSession);
    if (type === 'pdf') exportChatAsPdf(activeSession);
    setShowExportMenu(false);
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          />

          {/* Sidebar Drawer */}
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed lg:static top-0 left-0 z-50 h-screen lg:h-[calc(100vh-4rem)] w-72 lg:w-80 shrink-0 border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl flex flex-col p-4 text-slate-100 shadow-2xl overflow-hidden"
          >
            {/* Top Header & Search */}
            <div className="space-y-3 shrink-0">
              {/* Header Logo & Close Mobile Button */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl p-[1px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-sm shadow-blue-500/30 shrink-0">
                    <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center overflow-hidden">
                      <img src="/axiom-logo.jpg" alt="Axiom AI" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <h2 className="font-bold text-base bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      Axiom AI
                    </h2>
                    <p className="text-[10px] text-slate-400">Next Gen Intelligence</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* New Chat Primary Button */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal('login');
                  } else {
                    createNewChat();
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.01]"
              >
                <Plus className="w-4 h-4" />
                <span>New Conversation</span>
              </button>

              {/* Quick Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Filter conversations..."
                  className="w-full bg-slate-900 border border-slate-800/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            {/* Middle Chat Sessions List */}
            <div className="flex-1 min-h-0 overflow-y-auto my-3 space-y-4 pr-1 custom-scrollbar">
              {!isAuthenticated ? (
                <div className="p-4 text-center space-y-3 my-auto rounded-2xl bg-slate-900/60 border border-slate-800/80 mt-4">
                  <p className="text-xs font-semibold text-slate-200">Sign in to view history</p>
                  <p className="text-[11px] text-slate-400">Please sign in or create an account to view and save conversation history.</p>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-medium text-purple-200 transition-colors"
                  >
                    Sign In / Register
                  </button>
                </div>
              ) : (
                <>
                  {/* Pinned Chats */}
                  {pinnedSessions.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 px-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                        <Pin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Pinned Chats</span>
                      </div>
                      {pinnedSessions.map((session) => (
                        <SessionItem
                          key={session.id}
                          session={session}
                          isActive={session.id === activeSessionId}
                          onSelect={() => {
                            selectSession(session.id);
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                          }}
                          onRename={() => onRenameRequest(session)}
                          onDelete={() => deleteSession(session.id)}
                          onTogglePin={() => togglePinSession(session.id)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Recent Chats */}
                  <div className="space-y-1">
                    <div className="px-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                      Recent Conversations ({recentSessions.length})
                    </div>
                    {recentSessions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No recent conversations found.
                      </div>
                    ) : (
                      recentSessions.map((session) => (
                        <SessionItem
                          key={session.id}
                          session={session}
                          isActive={session.id === activeSessionId}
                          onSelect={() => {
                            selectSession(session.id);
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                          }}
                          onRename={() => onRenameRequest(session)}
                          onDelete={() => deleteSession(session.id)}
                          onTogglePin={() => togglePinSession(session.id)}
                        />
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Options & Actions (Anchored at bottom) */}
            <div className="mt-auto shrink-0 pt-3 border-t border-slate-800/80 space-y-2">
              {/* Export Chat Menu */}
              {activeSession && (
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-900 border border-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>Export Active Chat</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showExportMenu ? 'rotate-90' : ''}`} />
                  </button>

                  {showExportMenu && (
                    <div className="mt-1 p-1 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-xs shadow-xl">
                      <button
                        onClick={() => handleExport('txt')}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>Plain Text (.txt)</span>
                      </button>
                      <button
                        onClick={() => handleExport('md')}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                      >
                        <FileCode className="w-3.5 h-3.5 text-purple-400" />
                        <span>Markdown (.md)</span>
                      </button>
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                        <span>JSON Format (.json)</span>
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Printable PDF</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Clear History button */}
              {sessions.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all conversation history?')) {
                      clearHistory();
                    }
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Clear All History</span>
                </button>
              )}

              {/* Premium Glassmorphism Bottom Navigation Dock */}
              <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-2xl shadow-xl shadow-slate-950/50">
                <div className="grid grid-cols-3 gap-1.5">
                  {/* Settings Button */}
                  <div className="relative group/tooltip">
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-950/60 hover:bg-slate-800/90 border border-slate-800/60 hover:border-blue-500/40 text-slate-400 hover:text-slate-100 transition-all duration-200 group-hover/tooltip:scale-[1.02] shadow-inner"
                    >
                      <Settings className="w-4 h-4 mb-1 text-blue-400 group-hover/tooltip:rotate-45 transition-transform duration-300" />
                      <span className="text-[10px] font-semibold tracking-tight">Settings</span>
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-medium text-slate-200 shadow-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                      Preferences & Engine
                    </div>
                  </div>

                  {/* Shortcuts Button */}
                  <div className="relative group/tooltip">
                    <button
                      onClick={() => setIsShortcutsOpen(true)}
                      className="w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-950/60 hover:bg-slate-800/90 border border-slate-800/60 hover:border-purple-500/40 text-slate-400 hover:text-slate-100 transition-all duration-200 group-hover/tooltip:scale-[1.02] shadow-inner"
                    >
                      <Keyboard className="w-4 h-4 mb-1 text-purple-400 group-hover/tooltip:-translate-y-0.5 transition-transform duration-200" />
                      <span className="text-[10px] font-semibold tracking-tight">Shortcuts</span>
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-medium text-slate-200 shadow-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                      Keyboard Controls
                    </div>
                  </div>

                  {/* About Button */}
                  <div className="relative group/tooltip">
                    <button
                      onClick={() => setIsAboutOpen(true)}
                      className="w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-950/60 hover:bg-slate-800/90 border border-slate-800/60 hover:border-cyan-500/40 text-slate-400 hover:text-slate-100 transition-all duration-200 group-hover/tooltip:scale-[1.02] shadow-inner"
                    >
                      <Info className="w-4 h-4 mb-1 text-cyan-400 group-hover/tooltip:scale-110 transition-transform duration-200" />
                      <span className="text-[10px] font-semibold tracking-tight">About</span>
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-medium text-slate-200 shadow-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                      Axiom v1.0 Info
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onTogglePin,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`
        group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all
        ${
          isActive
            ? 'bg-blue-600/20 border border-blue-500/40 text-blue-200 font-semibold shadow-md'
            : 'hover:bg-slate-900/80 text-slate-300 border border-transparent'
        }
      `}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <MessageSquare
          className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`}
        />
        <span className="truncate">{session.title}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 rounded hover:bg-slate-800 ${
            session.pinned ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
          }`}
          title={session.pinned ? 'Unpin' : 'Pin chat'}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRename();
          }}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          title="Rename"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
