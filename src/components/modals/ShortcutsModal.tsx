import React from 'react';
import { Modal } from '../ui/Modal';
import { useChat } from '../../contexts/ChatContext';
import { Keyboard } from 'lucide-react';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useChat();

  const SHORTCUTS = [
    { key: 'Ctrl + K  /  ⌘ + K', description: 'Open Search history dialog' },
    { key: 'Ctrl + N  /  ⌘ + N', description: 'Start a new chat conversation' },
    { key: 'Ctrl + /  /  ⌘ + /', description: 'Focus input box immediately' },
    { key: 'Enter', description: 'Send active message' },
    { key: 'Shift + Enter', description: 'Insert new line in input' },
    { key: 'Esc', description: 'Close any open modal or overlay' },
  ];

  return (
    <Modal
      isOpen={isShortcutsOpen}
      onClose={() => setIsShortcutsOpen(false)}
      title="Keyboard Shortcuts"
      icon={<Keyboard className="w-5 h-5 text-purple-400" />}
      maxWidth="md"
    >
      <div className="space-y-3">
        {SHORTCUTS.map((s, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
          >
            <span className="font-medium text-slate-300">{s.description}</span>
            <kbd className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700/80 font-mono text-purple-300 text-[11px] shadow-sm">
              {s.key}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
};
