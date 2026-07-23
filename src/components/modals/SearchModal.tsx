import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useChat } from '../../contexts/ChatContext';
import { Search, MessageSquare, ArrowRight, Calendar } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, sessions, selectSession } = useChat();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  const matches = sessions.filter((session) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      session.title.toLowerCase().includes(q) ||
      session.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  });

  return (
    <Modal
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
      title="Search Conversation History"
      icon={<Search className="w-5 h-5 text-blue-400" />}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type keywords to search across titles and messages..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 shadow-inner"
          />
        </div>

        {/* Search Results List */}
        <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {matches.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching conversations found for "{query}".
            </div>
          ) : (
            matches.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  selectSession(session.id);
                  setIsSearchOpen(false);
                }}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-800/80 cursor-pointer transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 text-blue-400 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-slate-200 group-hover:text-blue-300 transition-colors">
                      {session.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {session.messages[session.messages.length - 1]?.content || 'Empty conversation'}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{session.messages.length} messages</span>
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
