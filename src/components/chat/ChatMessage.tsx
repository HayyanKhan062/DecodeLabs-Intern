import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types/chat';
import { useChat } from '../../contexts/ChatContext';
import { CodeBlock } from './CodeBlock';
import { AttachmentPreview } from './AttachmentPreview';

interface ChatMessageProps {
  message: ChatMessageType;
  isLast?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { regenerateMessage, editMessage, deleteMessage, toggleReaction, isGenerating } =
    useChat();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      editMessage(message.id, editContent);
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`w-full px-4 py-2.5 md:px-8 flex ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`flex flex-col min-w-0 max-w-[88%] md:max-w-[80%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Attachments if present */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={isUser ? 'flex justify-end w-full mb-2' : 'w-full mb-2'}>
            <AttachmentPreview attachments={message.attachments} readonly />
          </div>
        )}

        {/* Message Content Bubble */}
        <div
          className={`group relative rounded-2xl p-4 text-sm md:text-base leading-relaxed transition-all shadow-md ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-tr-xs shadow-purple-950/20'
              : 'bg-slate-900/90 border border-slate-800/80 text-slate-100 rounded-tl-xs shadow-slate-950/40'
          }`}
        >
          {isEditing ? (
            <div className="space-y-3 min-w-[280px]">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-blue-500/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans text-sm resize-y min-h-[90px]"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all"
                >
                  Save & Resubmit
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`prose ${
                isUser ? 'prose-invert text-white' : 'prose-invert text-slate-200'
              } max-w-none text-sm md:text-[15px] leading-relaxed break-words ${
                message.isError ? 'text-rose-300 font-medium' : ''
              }`}
            >
              {message.isError && (
                <div className="flex items-center gap-2 mb-2 text-rose-300 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Error Generating Response</span>
                </div>
              )}

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre({ children }) {
                    return <>{children}</>;
                  },
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeValue = String(children).replace(/\n$/, '');

                    return !inline ? (
                      <CodeBlock language={match ? match[1] : 'text'} value={codeValue} />
                    ) : (
                      <code
                        className={`px-1.5 py-0.5 rounded-md font-mono text-xs ${
                          isUser
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 border border-slate-700/60 text-purple-300'
                        }`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  p({ children }) {
                    return <div className="mb-2 last:mb-0 leading-relaxed">{children}</div>;
                  },
                  ul({ children }) {
                    return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
                  },
                  table({ children }) {
                    return (
                      <div className="my-3 overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs text-slate-300">{children}</table>
                      </div>
                    );
                  },
                  thead({ children }) {
                    return (
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-200 uppercase text-[10px] tracking-wider">
                        {children}
                      </thead>
                    );
                  },
                  td({ children }) {
                    return <td className="px-3 py-2 border-b border-slate-800/60">{children}</td>;
                  },
                  th({ children }) {
                    return <th className="px-3 py-2 font-semibold">{children}</th>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Action Toolbar buttons */}
        {!isEditing && (
          <div
            className={`flex items-center gap-1 mt-1 opacity-70 hover:opacity-100 transition-opacity ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <button
              onClick={handleCopy}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {!isUser && (
              <>
                <button
                  onClick={() => toggleReaction(message.id, 'liked')}
                  className={`p-1 rounded-lg transition-colors ${
                    message.reaction?.liked
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`}
                  title="Good response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => toggleReaction(message.id, 'disliked')}
                  className={`p-1 rounded-lg transition-colors ${
                    message.reaction?.disliked
                      ? 'text-rose-400 bg-rose-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`}
                  title="Bad response"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => regenerateMessage(message.id)}
                  disabled={isGenerating}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 disabled:opacity-40 transition-colors"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {isUser && (
              <button
                onClick={() => setIsEditing(true)}
                disabled={isGenerating}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 disabled:opacity-40 transition-colors"
                title="Edit message"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => deleteMessage(message.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
              title="Delete message"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
