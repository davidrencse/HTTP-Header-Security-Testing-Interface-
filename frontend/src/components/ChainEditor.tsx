import { FormEvent, useEffect, useState } from 'react';
import type { ChainValidationResult, ModuleDescriptor, ModuleType, RequestChain, RequestStepInput } from '../types';
import { api } from '../api/resources';
import { moduleLabel, splitCsv, joinCsv, issueClass } from '../utils/formatters';
import { validateSteps } from '../utils/validation';
import { LoadingState, ErrorState, Badge } from './StatusView';
import { RequestStepEditor, newStep } from './RequestStepEditor';

export function ChainEditor({ chainId }: { chainId?: string }) {
  const [loading, setLoading] = useState(Boolean(chainId));
  const [error, setError] = useState('');
  const [modules, setModules] = useState<ModuleDescriptor[]>([]);
  const [validation, setValidation] = useState<ChainValidationResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<{ name: string; description: string; moduleType: ModuleType; tags: string[]; steps: RequestStepInput[] }>({ name: '', description: '', moduleType: 'custom', tags: [], steps: [newStep(1)] });

  useEffect(() => { api.modules().then((res) => setModules(res.items)).catch(() => setModules([])); }, []);
  useEffect(() => {
    if (!chainId) return;
    setLoading(true);
    api.getChain(chainId).then(({ chain }) => setDraft({ name: chain.name, description: chain.description, moduleType: chain.moduleType, tags: chain.tags, steps: chain.steps.map(({ sequence, method, path, headers, cookies, bodyTemplate, encodingFlags, delayMs }) => ({ sequence, method, path, headers, cookies, bodyTemplate, encodingFlags, delayMs })) })).catch((err) => setError(err instanceof Error ? err.message : 'Unable to load chain.')).finally(() => setLoading(false));
  }, [chainId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const localErrors = validateSteps(draft.steps);
    if (!draft.name.trim()) localErrors.unshift('Chain name is required.');
    if (localErrors.length) {
      setValidation({ valid: false, issues: localErrors.map((message, index) => ({ code: `local-${index}`, severity: 'error', message })) });
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = chainId ? await api.updateChain(chainId, draft) : await api.createChain(draft);
      setValidation(response.validation);
      if (!chainId) window.location.hash = `/chains/${response.chain.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save chain.');
    } finally {
      setSaving(false);
    }
  }

  async function validateSaved() {
    if (!chainId) return;
    try { setValidation((await api.validateChain(chainId)).validation); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to validate chain.'); }
  }

  if (loading) return <LoadingState label='Loading request chain...' />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  return <form className='space-y-5' onSubmit={submit}><div className='card p-5'><div className='grid gap-4 md:grid-cols-2'><label className='label'>Chain name<input className='input mt-1' value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required /></label><label className='label'>Module type<select className='input mt-1' value={draft.moduleType} onChange={(e) => setDraft({ ...draft, moduleType: e.target.value as ModuleType })}><option value='custom'>{moduleLabel('custom')}</option>{modules.map((module) => <option key={module.type} value={module.type}>{module.name}</option>)}</select></label><label className='label md:col-span-2'>Description<input className='input mt-1' value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label><label className='label md:col-span-2'>Tags<input className='input mt-1' value={joinCsv(draft.tags)} onChange={(e) => setDraft({ ...draft, tags: splitCsv(e.target.value) })} /></label></div>{modules.length > 0 && <div className='mt-4 grid gap-3 md:grid-cols-2'>{modules.map((module) => <div key={module.type} className={`rounded-xl border p-3 ${draft.moduleType === module.type ? 'border-rift-500 bg-rift-500/10' : 'border-white/10 bg-white/5'}`}><div className='font-semibold text-white'>{module.name}</div><p className='mt-1 text-sm text-slate-300'>{module.description}</p><ul className='mt-2 text-xs text-slate-400'>{module.safetyNotes.map((note) => <li key={note}>• {note}</li>)}</ul></div>)}</div>}</div><div className='space-y-4'>{draft.steps.sort((a, b) => a.sequence - b.sequence).map((step, index) => <RequestStepEditor key={index} step={step} onChange={(next) => setDraft({ ...draft, steps: draft.steps.map((item, i) => i === index ? next : item) })} onRemove={() => setDraft({ ...draft, steps: draft.steps.filter((_, i) => i !== index).map((item, i) => ({ ...item, sequence: i + 1 })) })} />)}</div><div className='flex flex-wrap gap-3'><button className='btn-secondary' type='button' onClick={() => setDraft({ ...draft, steps: [...draft.steps, newStep(draft.steps.length + 1)] })}>Add step</button>{chainId && <button className='btn-secondary' type='button' onClick={validateSaved}>Validate saved chain</button>}<button className='btn-primary' disabled={saving}>{saving ? 'Saving...' : 'Save chain'}</button></div>{validation && <div className='card p-5'><Badge className={validation.valid ? 'border-emerald-400/20 bg-emerald-500/15 text-emerald-200' : 'border-rose-400/20 bg-rose-500/15 text-rose-200'}>{validation.valid ? 'Valid' : 'Needs changes'}</Badge><div className='mt-3 space-y-2'>{validation.issues.map((issue) => <div key={`${issue.code}-${issue.message}`} className={`rounded-xl border p-3 text-sm ${issueClass(issue.severity)}`}>{issue.message}</div>)}</div></div>}</form>;
}
