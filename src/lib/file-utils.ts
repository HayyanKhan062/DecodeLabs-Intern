import { Attachment } from '../types/chat';

/**
 * Parses user uploaded file into Attachment metadata + usable base64 or text content
 */
export async function processUploadedFile(file: File): Promise<Attachment> {
  const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const name = file.name;
  const size = file.size;
  const type = file.type || getFallbackMimeType(name);

  // If image, read as base64 Data URL for Gemini vision inline parts
  if (type.startsWith('image/')) {
    const base64Data = await readFileAsBase64(file);
    return {
      id,
      name,
      size,
      type,
      mimeType: type,
      url: base64Data,
      base64Data: base64Data.split(',')[1] || base64Data,
    };
  }

  // Text based files: TXT, CSV, JSON, MD, JS, TS, HTML, CSS, etc.
  if (
    type.includes('text') ||
    type.includes('json') ||
    type.includes('csv') ||
    name.endsWith('.txt') ||
    name.endsWith('.csv') ||
    name.endsWith('.json') ||
    name.endsWith('.md') ||
    name.endsWith('.js') ||
    name.endsWith('.ts') ||
    name.endsWith('.py')
  ) {
    const textContent = await readFileAsText(file);
    return {
      id,
      name,
      size,
      type,
      content: textContent,
    };
  }

  // For PDF / DOCX or binary formats, extract readable plain text or convert to string representation
  try {
    const textContent = await readFileAsText(file);
    return {
      id,
      name,
      size,
      type,
      content: textContent.length > 0 ? textContent : `[File Attached: ${name} (${formatFileSize(size)})]`,
    };
  } catch {
    return {
      id,
      name,
      size,
      type,
      content: `[File Attached: ${name} (${formatFileSize(size)})]`,
    };
  }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

function getFallbackMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc': return 'application/msword';
    case 'csv': return 'text/csv';
    case 'txt': return 'text/plain';
    case 'json': return 'application/json';
    case 'png': return 'image/png';
    case 'jpg': case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
