import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  Attachment,
  ChatMessage,
  ChatSession,
  UserSettings,
} from '../types/chat';
import { API_CONFIG } from '../config/api';
import { AVAILABLE_MODELS } from '../lib/ai-providers';

interface ChatContextType {
  sessions: ChatSession[];
  activeSessionId: string;
  activeSession: ChatSession | null;
  isGenerating: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredSessions: ChatSession[];
  
  // Settings & Modals state
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
  isAboutOpen: boolean;
  setIsAboutOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;

  // Chat Actions
  createNewChat: () => string;
  selectSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, newTitle: string) => void;
  togglePinSession: (id: string) => void;
  clearHistory: () => void;
  
  // Message Actions
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  stopGenerating: () => void;
  regenerateMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => void;
  toggleReaction: (messageId: string, type: 'liked' | 'disliked') => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  accentColor: 'blue-purple',
  fontSize: 'medium',
  chatWidth: 'standard',
  animationSpeed: 'normal',
  selectedModel: API_CONFIG.defaultModel,
  temperature: API_CONFIG.defaultTemperature,
  maxTokens: API_CONFIG.defaultMaxTokens,
  customApiKeys: {},
  autoScroll: true,
  soundEffects: false,
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load settings from localStorage
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('axiom_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Load chat sessions from localStorage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('axiom_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const savedActive = localStorage.getItem('axiom_active_session_id');
    return savedActive || '';
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Abort controller reference for stopping generation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Persist sessions
  useEffect(() => {
    localStorage.setItem('axiom_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Persist active session ID
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('axiom_active_session_id', activeSessionId);
    }
  }, [activeSessionId]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('axiom_settings', JSON.stringify(settings));
  }, [settings]);

  // Active session object
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // Filtered sessions based on search query
  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  });

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const createNewChat = (): string => {
    const newSession: ChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      modelId: settings.selectedModel,
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  };

  const selectSession = (id: string) => {
    setActiveSessionId(id);
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        setActiveSessionId('');
      }
    }
  };

  const renameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  const togglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  };

  const clearHistory = () => {
    setSessions([]);
    setActiveSessionId('');
  };

  // Core AI Stream Request
  const streamAIResponse = async (
    targetSessionId: string,
    historyMessages: ChatMessage[],
    userMessage: ChatMessage
  ) => {
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    const assistantMsgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelUsed: settings.selectedModel,
    };

    // Add empty assistant message to session
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            updatedAt: Date.now(),
            messages: [...s.messages, assistantMsg],
          };
        }
        return s;
      })
    );

    try {
      const payload = {
        messages: historyMessages.concat(userMessage).map((m) => ({
          role: m.role,
          content: m.content,
          attachments: m.attachments,
        })),
        model: settings.selectedModel,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        systemInstruction: settings.systemInstructionOverride || API_CONFIG.systemInstruction,
        customApiKey: settings.customApiKeys?.openrouter || settings.customApiKeys?.gemini || undefined,
        customApiKeys: settings.customApiKeys,
      };

      const response = await fetch(API_CONFIG.chatApiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser/server response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // Update assistant message content in state
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: accumulatedText } : m
                ),
              };
            }
            return s;
          })
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation stopped by user');
      } else {
        console.error('Chat error:', err);
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: m.content || `⚠️ Error: ${err.message || 'Failed to generate response. Please check your API key or network connection.'}`,
                        isError: true,
                      }
                    : m
                ),
              };
            }
            return s;
          })
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const sendMessage = async (content: string, attachments?: Attachment[]) => {
    let currentSessionId = activeSessionId;

    // Auto-create session if none active
    if (!currentSessionId) {
      currentSessionId = createNewChat();
    }

    const currentSession = sessions.find((s) => s.id === currentSessionId);
    const existingMessages = currentSession ? currentSession.messages : [];

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments,
    };

    // Auto update session title if first message
    const isFirstMsg = existingMessages.length === 0;
    const newTitle = isFirstMsg
      ? content.slice(0, 30) + (content.length > 30 ? '...' : '')
      : currentSession?.title || 'New Conversation';

    // Append user message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            title: newTitle,
            updatedAt: Date.now(),
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );

    await streamAIResponse(currentSessionId, existingMessages, userMsg);
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const regenerateMessage = async (messageId: string) => {
    if (!activeSession || isGenerating) return;

    const msgIndex = activeSession.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // Find previous messages
    const history = activeSession.messages.slice(0, msgIndex);
    const lastUserMsg = history.filter((m) => m.role === 'user').pop();

    if (!lastUserMsg) return;

    // Truncate messages down to before the regenerate target
    const truncatedMessages = activeSession.messages.slice(0, msgIndex);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id ? { ...s, messages: truncatedMessages } : s
      )
    );

    const historyBeforeUser = truncatedMessages.slice(0, -1);
    await streamAIResponse(activeSession.id, historyBeforeUser, lastUserMsg);
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!activeSession || isGenerating) return;

    const msgIndex = activeSession.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // Truncate up to edited message and replace content
    const updatedUserMsg: ChatMessage = {
      ...activeSession.messages[msgIndex],
      content: newContent,
      timestamp: Date.now(),
    };

    const historyBeforeEdit = activeSession.messages.slice(0, msgIndex);

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? { ...s, messages: [...historyBeforeEdit, updatedUserMsg] }
          : s
      )
    );

    await streamAIResponse(activeSession.id, historyBeforeEdit, updatedUserMsg);
  };

  const deleteMessage = (messageId: string) => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? { ...s, messages: s.messages.filter((m) => m.id !== messageId) }
          : s
      )
    );
  };

  const toggleReaction = (messageId: string, type: 'liked' | 'disliked') => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            messages: s.messages.map((m) => {
              if (m.id === messageId) {
                const current = m.reaction || {};
                const isAlready = current[type];
                return {
                  ...m,
                  reaction: {
                    liked: type === 'liked' ? !isAlready : false,
                    disliked: type === 'disliked' ? !isAlready : false,
                  },
                };
              }
              return m;
            }),
          };
        }
        return s;
      })
    );
  };

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSessionId,
        activeSession,
        isGenerating,
        searchQuery,
        setSearchQuery,
        filteredSessions,
        settings,
        updateSettings,
        isSettingsOpen,
        setIsSettingsOpen,
        isSearchOpen,
        setIsSearchOpen,
        isShortcutsOpen,
        setIsShortcutsOpen,
        isAboutOpen,
        setIsAboutOpen,
        isSidebarOpen,
        setIsSidebarOpen,
        createNewChat,
        selectSession,
        deleteSession,
        renameSession,
        togglePinSession,
        clearHistory,
        sendMessage,
        stopGenerating,
        regenerateMessage,
        editMessage,
        deleteMessage,
        toggleReaction,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
