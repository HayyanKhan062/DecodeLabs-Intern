import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useChat } from '../../contexts/ChatContext';
import { ChatSession } from '../../types/chat';
import { Edit2 } from 'lucide-react';

interface RenameModalProps {
  session: ChatSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({ session, isOpen, onClose }) => {
  const { renameSession } = useChat();
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (session) {
      setTitle(session.title);
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (session && title.trim()) {
      renameSession(session.id, title.trim());
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rename Conversation"
      icon={<Edit2 className="w-5 h-5 text-blue-400" />}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Conversation Title
          </label>
          <input
            type="text"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            Save Title
          </button>
        </div>
      </form>
    </Modal>
  );
};
