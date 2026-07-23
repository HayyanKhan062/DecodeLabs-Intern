import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Paperclip,
  Mic,
  MicOff,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Attachment } from '../../types/chat';
import { useChat } from '../../contexts/ChatContext';
import { processUploadedFile } from '../../lib/file-utils';
import { SpeechToTextEngine } from '../../lib/speech';
import { AttachmentPreview } from './AttachmentPreview';

export const ChatInput: React.FC = () => {
  const { sendMessage, isGenerating, stopGenerating } = useChat();

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechEngineRef = useRef<SpeechToTextEngine | null>(null);

  // Initialize Speech Engine
  useEffect(() => {
    speechEngineRef.current = new SpeechToTextEngine();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isGenerating) return;

    const currentInput = input;
    const currentAttachments = [...attachments];

    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(currentInput, currentAttachments);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const att = await processUploadedFile(files[i]);
        newAttachments.push(att);
      } catch (err) {
        console.error('Failed to parse file:', err);
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleVoiceRecording = () => {
    if (!speechEngineRef.current?.isSupported()) {
      setSpeechError('Microphone speech recognition is not supported in this browser.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    if (isListening) {
      speechEngineRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      setIsListening(true);
      speechEngineRef.current.start({
        onResult: (text) => {
          setInput((prev) => (prev ? `${prev} ${text}` : text));
        },
        onError: (err) => {
          setSpeechError(err);
          setIsListening(false);
          setTimeout(() => setSpeechError(null), 4000);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      await handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="sticky bottom-0 z-20 w-full max-w-4xl mx-auto px-4 pb-6 pt-2"
    >
      {/* Speech error toast */}
      {speechError && (
        <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Input container glass card */}
      <div
        className={`
          relative rounded-2xl p-3 md:p-4 backdrop-blur-2xl transition-all duration-300 shadow-2xl
          bg-slate-900/80 border text-slate-100
          ${
            isDragging
              ? 'border-blue-500 bg-blue-950/30 ring-2 ring-blue-500/40'
              : 'border-slate-800/90 shadow-purple-950/20 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/20'
          }
        `}
      >
        {/* Drag over overlay hint */}
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl bg-blue-500/10 backdrop-blur-sm border-2 border-dashed border-blue-400 flex items-center justify-center z-30 pointer-events-none">
            <span className="text-sm font-medium text-blue-300">Drop PDF, DOCX, CSV, TXT or Images here</span>
          </div>
        )}

        {/* Attachment chips */}
        <AttachmentPreview attachments={attachments} onRemove={handleRemoveAttachment} />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Axiom anything... (Press Shift+Enter for new line)"
          rows={1}
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none resize-none text-sm md:text-base leading-relaxed max-h-[200px] custom-scrollbar"
        />

        {/* Input Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-2">
          {/* File input & Mic buttons */}
          <div className="flex items-center gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt,.csv,.json,.png,.jpg,.jpeg,.webp"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800/80 transition-colors"
              title="Attach PDF, DOCX, TXT, CSV, or Image"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'text-rose-400 bg-rose-500/20 animate-pulse'
                  : 'text-slate-400 hover:text-purple-400 hover:bg-slate-800/80'
              }`}
              title={isListening ? 'Stop listening' : 'Voice typing'}
            >
              {isListening ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Character counter */}
            <span className="text-[11px] text-slate-500 ml-2 font-mono hidden sm:inline">
              {input.length} chars
            </span>
          </div>

          {/* Send or Stop button */}
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <button
                type="button"
                onClick={stopGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs md:text-sm shadow-lg shadow-rose-600/30 transition-all"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() && attachments.length === 0}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs md:text-sm transition-all shadow-lg
                  ${
                    input.trim() || attachments.length > 0
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-purple-600/30 hover:opacity-90 hover:scale-[1.02]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                  }
                `}
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
