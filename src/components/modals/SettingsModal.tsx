import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useChat } from '../../contexts/ChatContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Sliders,
  Moon,
  Sun,
  Monitor,
  Key,
  Database,
  Trash2,
  Sparkles,
  Check,
  Zap,
} from 'lucide-react';
import { AccentColor, AIProviderId, FontSize, ChatWidth } from '../../types/chat';
import { AI_PROVIDERS, AVAILABLE_MODELS } from '../../lib/ai-providers';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, settings, updateSettings, clearHistory } =
    useChat();
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();

  const [activeTab, setActiveTab] = useState<'general' | 'model' | 'api' | 'data'>('general');
  const [apiKeyInputs, setApiKeyInputs] = useState<Partial<Record<AIProviderId, string>>>(
    settings.customApiKeys || {}
  );
  const [savedToast, setSavedToast] = useState(false);

  const handleSaveApiKeys = () => {
    updateSettings({ customApiKeys: apiKeyInputs });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleKeyChange = (provider: AIProviderId, value: string) => {
    setApiKeyInputs((prev) => ({ ...prev, [provider]: value }));
  };

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      title="Axiom Settings & Preferences"
      icon={<Sliders className="w-5 h-5 text-blue-400" />}
      maxWidth="2xl"
    >
      <div className="flex flex-col md:flex-row gap-6 min-h-[400px]">
        {/* Left Tabs */}
        <div className="w-full md:w-48 shrink-0 flex md:flex-col gap-1 border-b md:border-b-0 md:border-r border-slate-800/80 pb-3 md:pb-0 md:pr-3">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
              activeTab === 'general'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Appearance & UI</span>
          </button>

          <button
            onClick={() => setActiveTab('model')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
              activeTab === 'model'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Model & Parameters</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
              activeTab === 'api'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Key className="w-4 h-4 text-cyan-400" />
            <span>API Keys Setup</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
              activeTab === 'data'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-rose-400" />
            <span>Storage & Cache</span>
          </button>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 space-y-6 text-xs text-slate-200">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Theme Selector */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-300">Color Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-medium ${
                      theme === 'dark'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Dark Theme</span>
                  </button>

                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-medium ${
                      theme === 'light'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Light Theme</span>
                  </button>

                  <button
                    onClick={() => setTheme('system')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-medium ${
                      theme === 'system'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    <span>System Sync</span>
                  </button>
                </div>
              </div>

              {/* Accent Color Palette */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-300">Accent Glow Theme</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'blue-purple', name: 'Blue + Purple (Default)', bg: 'from-blue-500 to-purple-600' },
                    { id: 'cyan-emerald', name: 'Cyan + Emerald', bg: 'from-cyan-400 to-emerald-500' },
                    { id: 'violet-pink', name: 'Violet + Pink', bg: 'from-purple-500 to-pink-500' },
                    { id: 'amber-orange', name: 'Amber + Orange', bg: 'from-amber-400 to-orange-500' },
                    { id: 'indigo-blue', name: 'Indigo + Electric Blue', bg: 'from-indigo-500 to-blue-500' },
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => setAccentColor(acc.id as AccentColor)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left ${
                        accentColor === acc.id
                          ? 'border-blue-500 bg-blue-500/10 text-slate-100 font-semibold'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${acc.bg} shrink-0`} />
                      <span className="truncate">{acc.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size & Chat Width */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Font Size</label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: e.target.value as FontSize })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="small">Small (13px)</option>
                    <option value="medium">Medium Default (15px)</option>
                    <option value="large">Large (17px)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Chat Container Width</label>
                  <select
                    value={settings.chatWidth}
                    onChange={(e) => updateSettings({ chatWidth: e.target.value as ChatWidth })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="compact">Compact (Max 600px)</option>
                    <option value="standard">Standard Default (Max 800px)</option>
                    <option value="wide">Wide Screen (Max 1100px)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODEL */}
          {activeTab === 'model' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-semibold text-slate-300">Active AI Model</label>
                <div className="grid grid-cols-1 gap-2">
                  {AVAILABLE_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => updateSettings({ selectedModel: model.id })}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        settings.selectedModel === model.id
                          ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-medium'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100">{model.name}</span>
                          {model.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                              {model.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{model.description}</p>
                      </div>

                      {settings.selectedModel === model.id && (
                        <Check className="w-5 h-5 text-purple-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-300">Temperature (Creativity)</label>
                  <span className="font-mono text-purple-400 font-semibold">{settings.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={settings.temperature}
                  onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.0 Precise / Factual</span>
                  <span>0.5 Balanced</span>
                  <span>1.0 Creative / Expressive</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-300">Max Tokens Response Limit</label>
                  <span className="font-mono text-purple-400 font-semibold">{settings.maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="1024"
                  max="8192"
                  step="512"
                  value={settings.maxTokens}
                  onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
                  className="w-full accent-purple-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: API KEYS */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs leading-relaxed">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Configure API Keys</span>
                </p>
                By default, Axiom uses server-side Google Gemini credentials (`GEMINI_API_KEY`). You can paste custom keys below to override default routing or connect additional providers directly. Keys are stored locally in your browser.
              </div>

              {AI_PROVIDERS.map((provider) => (
                <div key={provider.id} className="space-y-1">
                  <label className="font-medium text-slate-300 text-xs flex items-center justify-between">
                    <span>{provider.name} API Key</span>
                    <span className="text-[10px] text-slate-500">{provider.description}</span>
                  </label>
                  <input
                    type="password"
                    value={apiKeyInputs[provider.id] || ''}
                    onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                    placeholder={provider.keyPlaceholder}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                  />
                </div>
              ))}

              <div className="pt-2 flex items-center justify-between">
                {savedToast ? (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-4 h-4" /> API Keys Saved Successfully!
                  </span>
                ) : (
                  <span />
                )}

                <button
                  onClick={handleSaveApiKeys}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-600/30 transition-all"
                >
                  Save API Configuration
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DATA & STORAGE */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="font-semibold text-slate-200 text-sm">Local Storage & Cache</h4>
                <p className="text-slate-400 leading-relaxed">
                  Axiom saves your conversations, settings, and active model preferences locally in your browser's LocalStorage. No user data is tracked or sold.
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Clear all conversation history? This action cannot be undone.')) {
                        clearHistory();
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Chat History</span>
                  </button>

                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                  >
                    <span>Reset All Axiom Preferences & Refresh</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
