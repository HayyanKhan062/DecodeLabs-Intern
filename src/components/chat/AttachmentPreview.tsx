import React from 'react';
import { Attachment } from '../../types/chat';
import { FileText, Image as ImageIcon, FileCode, X } from 'lucide-react';
import { formatFileSize } from '../../lib/file-utils';

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove?: (id: string) => void;
  readonly?: boolean;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  onRemove,
  readonly = false,
}) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {attachments.map((file) => {
        const isImage = file.type.startsWith('image/');

        return (
          <div
            key={file.id}
            className="group relative flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 backdrop-blur-md text-xs text-slate-200 shadow-sm transition-all hover:border-blue-500/50"
          >
            {isImage && file.url ? (
              <img
                src={file.url}
                alt={file.name}
                className="w-7 h-7 object-cover rounded-md border border-slate-700"
              />
            ) : isImage ? (
              <ImageIcon className="w-4 h-4 text-purple-400 shrink-0" />
            ) : file.name.endsWith('.csv') || file.name.endsWith('.json') || file.name.endsWith('.js') || file.name.endsWith('.ts') ? (
              <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
            )}

            <div className="flex flex-col min-w-0 max-w-[160px]">
              <span className="truncate font-medium text-slate-200">{file.name}</span>
              <span className="text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
            </div>

            {!readonly && onRemove && (
              <button
                type="button"
                onClick={() => onRemove(file.id)}
                className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-700/80 transition-colors"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
