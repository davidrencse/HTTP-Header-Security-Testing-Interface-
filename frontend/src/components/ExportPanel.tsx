import { FormEvent, useState } from 'react';
import type { ExportArtifact } from '../types';
import { api } from '../api/resources';
import { splitCsv } from '../utils/formatters';

export function ExportPanel({ runId, onGenerated }: { runId: string; onGenerated?: (artifact: ExportArtifact) => void }) {
  const [format, setFormat] = useState<'json' | 'harLike'>('json');
  const [redact, setRedact] = useState('authorization, cookie, set-cookie');
  const [truncateBodyBytes, setTruncateBodyBytes] = useState(4096);
  const [excludeBody, setExcludeBody] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const response = await api.createExport({ runId, format, redaction: { redactHeaderNames: splitCsv(redact), truncateBodyBytes, excludeBody } });
      setMessage(`Generated ${response.export.fileName}`);
      onGenerated?.(response.export);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to generate export.');
    } finally {
      setSaving(false);
    }
  }
  return <form className='card p-5' onSubmit={submit}><h3 className='text-lg font-semibold text-white'>Generate sanitized trace export</h3><div className='mt-4 grid gap-4 md:grid-cols-2'><label className='label'>Format<select className='input mt-1' value={format} onChange={(e) => setFormat(e.target.value as 'json' | 'harLike')}><option value='json'>JSON</option><option value='harLike'>HAR-like</option></select></label><label className='label'>Truncate body bytes<input className='input mt-1' type='number' min={0} value={truncateBodyBytes} onChange={(e) => setTruncateBodyBytes(Number(e.target.value))} /></label><label className='label md:col-span-2'>Header names to redact<input className='input mt-1' value={redact} onChange={(e) => setRedact(e.target.value)} /></label><label className='flex gap-3 text-sm text-slate-200'><input type='checkbox' checked={excludeBody} onChange={(e) => setExcludeBody(e.target.checked)} />Exclude bodies from export content</label></div><button className='btn-primary mt-5' disabled={saving || !runId}>{saving ? 'Generating...' : 'Generate export'}</button>{message && <p className='mt-3 text-sm text-slate-300'>{message}</p>}</form>;
}
