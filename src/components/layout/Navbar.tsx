import React, { useState } from 'react';
import {
  Menu,
  Search,
  Settings,
  Sparkles,
  ChevronDown,
  Moon,
  Sun,
  User,
  Plus,
  Info,
  Sliders,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { AVAILABLE_MODELS } from '../../lib/ai-providers';

export const Navbar: React.FC = () => {
  const {
    activeSession,
    createNewChat,
    setIsSettingsOpen,
    setIsSearchOpen,
    setIsAboutOpen,
    setIsSidebarOpen,
    isSidebarOpen,
    settings,
    updateSettings,
  } = useChat();

  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, openAuthModal, logout } = useAuth();

  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const activeModel =
    AVAILABLE_MODELS.find((m) => m.id === settings.selectedModel) || AVAILABLE_MODELS[0];

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else setTheme('dark');
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl flex items-center justify-between px-4 md:px-6 text-slate-100">
      {/* Left section: Sidebar toggle & Axiom Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-xl p-[1px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-sm shadow-blue-500/30">
            <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center overflow-hidden">
              <img src="/axiom-logo.jpg" alt="Axiom" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Axiom
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline -mt-0.5 font-medium">
              Think Smarter. Respond Faster.
            </span>
          </div>
        </div>
      </div>

      {/* Center section: Active Chat Title & AI Model Selector */}
      <div className="hidden md:flex items-center gap-3">
        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-semibold">{activeModel.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Model Selection Menu */}
          {isModelDropdownOpen && (
            <div
              className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 backdrop-blur-2xl"
              onClick={() => setIsModelDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                Select AI Model Architecture
              </div>
              {AVAILABLE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => updateSettings({ selectedModel: model.id })}
                  className={`
                    w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-0.5
                    ${
                      settings.selectedModel === model.id
                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300'
                        : 'hover:bg-slate-800/80 text-slate-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-200">{model.name}</span>
                    {model.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                        {model.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 line-clamp-1">{model.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {activeSession && (
          <span className="text-xs text-slate-400 max-w-[200px] truncate border-l border-slate-800 pl-3">
            {activeSession.title}
          </span>
        )}
      </div>

      {/* Right Section: Actions & Profile Menu */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Search button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
          title="Search chats (Ctrl+K)"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden lg:inline">Search</span>
          <kbd className="hidden lg:inline text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* New Chat quick button */}
        <button
          onClick={() => createNewChat()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
          title="Toggle Dark/Light Mode"
        >
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
          title="Axiom Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Profile Avatar Menu */}
        <div className="relative ml-1">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1px] hover:scale-105 transition-transform"
          >
            <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center text-slate-200 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
          </button>

          {isProfileMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 backdrop-blur-2xl text-xs text-slate-200"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              {user ? (
                <div className="p-3 border-b border-slate-800 mb-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-100 truncate">{user.fullName}</p>
                    {user.isGuest && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                        Guest
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{user.isGuest ? 'Temporary Session' : user.email}</p>
                </div>
              ) : (
                <div className="p-3 border-b border-slate-800 mb-1">
                  <p className="font-semibold text-slate-100">Guest User</p>
                  <p className="text-[11px] text-slate-400">Sign in to sync history</p>
                </div>
              )}

              {user?.isGuest && (
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-purple-300 font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4 text-purple-400" />
                  <span>Sign In / Register</span>
                </button>
              )}

              {user ? (
                <button
                  onClick={() => openAuthModal('profile')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  <User className="w-4 h-4 text-purple-400" />
                  <span>My Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>Sign In / Register</span>
                </button>
              )}

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Preferences & Settings</span>
              </button>

              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
              >
                {resolvedTheme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Switch to Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Switch to Dark Theme</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsAboutOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <Info className="w-4 h-4 text-cyan-400" />
                <span>About Axiom AI</span>
              </button>

              {user && (
                <div className="pt-1 mt-1 border-t border-slate-800">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}

              <div className="mt-1 pt-1 border-t border-slate-800 px-3 py-1 text-[10px] text-slate-500 font-mono">
                Axiom AI • Version 1.0
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
