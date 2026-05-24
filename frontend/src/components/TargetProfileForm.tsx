import { FormEvent, useState } from 'react';
import type { HttpMethod, SafetyValidationResult, TargetProfile } from '../types';
import { HTTP_METHODS, validateTargetDraft } from '../utils/validation';
import { joinCsv, splitCsv } from '../utils/formatters';
import { api } from '../api/resources';
import { Badge } from './StatusView';

const blank = { name: '', protocol: 'https' as const, hostname: '', allowedMethods: ['GET'] as HttpMethod[], allowedPaths: ['/'], pinnedIps: [] as string[], authorizationConfirmed: false, authorizationNote: '' };

export function TargetProfileForm({ initial, onSaved }: { initial?: TargetProfile | null; onSaved: () => void }) {
  const [draft, setDraft] = useState(initial ? { name: initial.name, protocol: initial.protocol, hostname: initial.hostname, allowedMethods: initial.allowedMethods, allowedPaths: initial.allowedPaths, pinnedIps: initial.pinnedIps, authorizationConfirmed: initial.authorizationConfirmed, authorizationNote: initial.authorizationNote } : blank);
  const [errors, setErrors] = useState<string[]>([]);
  const [validation, setValidation] = useState<SafetyValidationResult | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleMethod = (method: HttpMethod) => setDraft((current) => ({ ...current, allowedMethods: current.allowedMethods.includes(method) ? current.allowedMethods.filter((item) => item !== method) : [...current.allowedMethods, method] }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateTargetDraft(draft);
    setErrors(nextErrors);
    if (nextErrors.length) return;
    setSaving(true);
    try {
      const response = initial ? await api.updateTarget(initial.id, draft) : await api.createTarget(draft);
      setValidation(response.validation);
      onSaved();
      if (!initial) setDraft(blank);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Unable to save target profile.']);
    } finally {
      setSaving(false);
    }
  }

  return <form onSubmit={submit} className='card p-5'><h3 className='text-lg font-semibold text-white'>{initial ? 'Edit target profile' : 'Create authorized target profile'}</h3><div className='mt-4 grid gap-4 md:grid-cols-2'><label className='label'>Profile name<input className='input mt-1' value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required /></label><label className='label'>Protocol<select className='input mt-1' value={draft.protocol} onChange={(e) => setDraft({ ...draft, protocol: e.target.value as 'http' | 'https' })}><option value='https'>https</option><option value='http'>http</option></select></label><label className='label md:col-span-2'>Hostname<input className='input mt-1' value={draft.hostname} onChange={(e) => setDraft({ ...draft, hostname: e.target.value })} placeholder='app.internal.example' required /></label><label className='label'>Allowed paths, comma-separated<input className='input mt-1' value={joinCsv(draft.allowedPaths)} onChange={(e) => setDraft({ ...draft, allowedPaths: splitCsv(e.target.value) })} placeholder='/, /api/*' /></label><label className='label'>Pinned IPs, comma-separated<input className='input mt-1' value={joinCsv(draft.pinnedIps)} onChange={(e) => setDraft({ ...draft, pinnedIps: splitCsv(e.target.value) })} placeholder='10.0.0.12' /></label></div><fieldset className='mt-4'><legend className='label'>Allowed methods</legend><div className='mt-2 flex flex-wrap gap-2'>{HTTP_METHODS.map((method) => <label key={method} className='rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200'><input type='checkbox' className='mr-2' checked={draft.allowedMethods.includes(method)} onChange={() => toggleMethod(method)} />{method}</label>)}</div></fieldset><label className='label mt-4 block'>Authorization note<textarea className='input mt-1 min-h-24' value={draft.authorizationNote} onChange={(e) => setDraft({ ...draft, authorizationNote: e.target.value })} placeholder='Record ownership, ticket, or written authorization context.' /></label><label className='mt-4 flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200'><input type='checkbox' checked={draft.authorizationConfirmed} onChange={(e) => setDraft({ ...draft, authorizationConfirmed: e.target.checked })} />I confirm this target is owned by me or explicitly authorized for assessment.</label>{errors.length > 0 && <ul className='mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100'>{errors.map((error) => <li key={error}>• {error}</li>)}</ul>}{validation && <div className='mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-3'><Badge className={validation.allowed ? 'border-emerald-400/20 bg-emerald-500/15 text-emerald-200' : 'border-rose-400/20 bg-rose-500/15 text-rose-200'}>{validation.allowed ? 'Allowed' : 'Blocked'}</Badge><p className='mt-2 text-sm text-slate-300'>Resolved IPs: {validation.resolvedIps.join(', ') || 'none returned'}</p></div>}<button className='btn-primary mt-5' disabled={saving}>{saving ? 'Saving...' : 'Save target profile'}</button></form>;
}
