'use client';

import { useState } from 'react';
import { Eye, Edit3 } from 'lucide-react';

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/### (.+)/g, '<h3 style="font-size:1.1rem;font-weight:800;margin:1rem 0 0.3rem">$1</h3>')
    .replace(/## (.+)/g, '<h2 style="font-size:1.3rem;font-weight:800;margin:1.2rem 0 0.5rem">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:var(--bg-accent);padding:0.1rem 0.3rem;border-radius:3px;font-size:0.85em">$1</code>')
    .replace(/^- (.+)/gm, '<li style="margin-left:1.2rem;list-style:disc">$1</li>')
    .replace(/\n{2,}/g, '</p><p style="margin-bottom:0.5rem">')
    .replace(/\n/g, '<br />');

  html = '<p style="margin-bottom:0.5rem">' + html + '</p>';
  return html;
}

export default function MarkdownInput({ value, onChange, style, placeholder, minHeight }: {
  value: string; onChange: (val: string) => void; style?: React.CSSProperties;
  placeholder?: string; minHeight?: string;
}) {
  const [preview, setPreview] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.3rem' }}>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className="btn-icon"
          style={{ width: '28px', height: '28px', background: preview ? 'var(--primary-glow)' : 'transparent', color: preview ? 'var(--primary)' : 'var(--text-muted)' }}
          title={preview ? 'Editar' : 'Vista previa'}
        >
          {preview ? <Edit3 size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {preview ? (
        <div
          style={{
            ...style as any,
            minHeight: minHeight || '120px',
            background: 'var(--bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.6rem 0.8rem',
            fontSize: '0.85rem',
            lineHeight: '1.6',
            overflowY: 'auto',
            color: 'var(--text)',
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...style as any, minHeight: minHeight || '120px', width: '100%', padding: '0.5rem 0.7rem', background: '#ffffff', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: '#0f172a', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical' }}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
