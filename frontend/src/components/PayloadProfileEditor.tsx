import { FormEvent, useState } from 'react';
import type { PayloadProfile } from '../types';
import { joinCsv, splitCsv } from '../utils/formatters';
import { api } from '../api/resources';

const blank = { name: '', description: '', parserFamily: '', headerNormalizationMode: 'preserve-order', cacheKeyAssumptions: [] as string[], notes: '' };

export function PayloadProfileEditor({ onSaved }: { onSaved: () => void }) {
  const [draft, setDraft] = useState<Omit<PayloadProfile, 'id' | 'createdAt' | 'updatedAt'>>(blank);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.name.trim() || !draft.parserFamily.trim()) {
      setError('Name and parser family are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.createPayloadProfile(draft);
      setDraft(blank);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save payload profile.');
    } finally {
      setSaving(false);
    }
  }
  return <form className='card p-5' onSubmit={submit}><h3 className='text-lg font-semibold text-white'>Create payload profile</h3><div className='mt-4 grid gap-4 md:grid-cols-2'><label className='label'>Name<input className='input mt-1' value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required /></label><label className='label'>Parser family<input className='input mt-1' value={draft.parserFamily} onChange={(e) => setDraft({ ...draft, parserFamily: e.target.value })} placeholder='nginx, envoy, node-http' required /></label><label className='label md:col-span-2'>Description<input className='input mt-1' value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label><label className='label'>Header normalization mode<input className='input mt-1' value={draft.headerNormalizationMode} onChange={(e) => setDraft({ ...draft, headerNormalizationMode: e.target.value })} /></label><label className='label'>Cache key assumptions<input className='input mt-1' value={joinCsv(draft.cacheKeyAssumptions)} onChange={(e) => setDraft({ ...draft, cacheKeyAssumptions: splitCsv(e.target.value) })} /></label><label className='label md:col-span-2'>Notes<textarea className='input mt-1 min-h-20' value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></label></div>{error && <p className='mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100'>{error}</p>}<button className='btn-primary mt-5' disabled={saving}>{saving ? 'Saving...' : 'Save payload profile'}</button></form>;
}
