import { ChatSession } from '../types/chat';

export function exportChatAsTxt(session: ChatSession): void {
  const lines: string[] = [];
  lines.push(`AXIOM AI CHAT EXPORT`);
  lines.push(`Title: ${session.title}`);
  lines.push(`Date: ${new Date(session.createdAt).toLocaleString()}`);
  lines.push(`Model: ${session.modelId}`);
  lines.push(`--------------------------------------------------\n`);

  session.messages.forEach((msg) => {
    const sender = msg.role === 'user' ? 'USER' : 'AXIOM';
    const time = new Date(msg.timestamp).toLocaleTimeString();
    lines.push(`[${time}] ${sender}:`);
    lines.push(msg.content);
    if (msg.attachments && msg.attachments.length > 0) {
      lines.push(`Attachments: ${msg.attachments.map((a) => a.name).join(', ')}`);
    }
    lines.push('\n');
  });

  downloadFile(`${slugify(session.title)}.txt`, lines.join('\n'), 'text/plain');
}

export function exportChatAsMarkdown(session: ChatSession): void {
  const lines: string[] = [];
  lines.push(`# ${session.title}`);
  lines.push(`*Exported from Axiom AI on ${new Date(session.createdAt).toLocaleDateString()}*\n`);

  session.messages.forEach((msg) => {
    const sender = msg.role === 'user' ? '👤 **You**' : '🤖 **Axiom**';
    lines.push(`### ${sender} *(${new Date(msg.timestamp).toLocaleTimeString()})*\n`);
    lines.push(msg.content);
    if (msg.attachments && msg.attachments.length > 0) {
      lines.push(`\n**Attachments:** ${msg.attachments.map((a) => `\`${a.name}\``).join(', ')}`);
    }
    lines.push('\n---\n');
  });

  downloadFile(`${slugify(session.title)}.md`, lines.join('\n'), 'text/markdown');
}

export function exportChatAsJson(session: ChatSession): void {
  const jsonStr = JSON.stringify(session, null, 2);
  downloadFile(`${slugify(session.title)}.json`, jsonStr, 'application/json');
}

export function exportChatAsPdf(session: ChatSession): void {
  // Generates a dedicated printable print view window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export as PDF');
    return;
  }

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Axiom AI Export - ${escapeHtml(session.title)}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
          .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; }
          .meta { font-size: 13px; color: #64748b; }
          .message { margin-bottom: 24px; padding: 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
          .user { background: #eff6ff; border-color: #bfdbfe; }
          .author { font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #1e40af; }
          .user .author { color: #1d4ed8; }
          .time { font-size: 12px; color: #94a3b8; font-weight: normal; margin-left: 8px; }
          pre { background: #0f172a; color: #f8fafc; padding: 12px; border-radius: 8px; overflow-x: auto; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${escapeHtml(session.title)}</h1>
          <div class="meta">Exported from Axiom AI • ${new Date().toLocaleString()} • Model: ${session.modelId}</div>
        </div>
        ${session.messages
          .map(
            (msg) => `
          <div class="message ${msg.role === 'user' ? 'user' : ''}">
            <div class="author">
              ${msg.role === 'user' ? '👤 User' : '🤖 Axiom'}
              <span class="time">${new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            <div>${escapeHtml(msg.content).replace(/\n/g, '<br/>')}</div>
          </div>
        `
          )
          .join('')}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
}

function downloadFile(filename: string, content: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .substring(0, 30);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
