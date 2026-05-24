import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api/resources';
import { Header } from './components/Header';
import { SafetyBanner } from './components/SafetyBanner';
import { TargetProfileForm } from './components/TargetProfileForm';
import { TargetListTable } from './components/TargetListTable';
import { PayloadProfileEditor } from './components/PayloadProfileEditor';
import { ChainEditor } from './components/ChainEditor';
import { PreflightChecklist } from './components/PreflightChecklist';
import { RunConsole } from './components/RunConsole';
import { DiffPanel } from './components/DiffPanel';
import { ExportPanel } from './components/ExportPanel';
import { Badge, EmptyState, ErrorState, LoadingState } from './components/StatusView';
import type { AppSettings, ExportArtifact, PayloadProfile, RequestChainSummary, RunAcknowledgements, RunDetail, RunEvent, RunOptionsInput, RunPreflightResult, RunStatus, RunSummary, TargetProfileSummary } from './types';
import { formatDate, statusClass, moduleLabel } from './utils/formatters';

function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.replace(/^#/, '') || '/');
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace(/^#/, '') || '/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

function useLoad<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    loader().then(setData).catch((err) => setError(err instanceof Error ? err.message : 'Backend request failed.')).finally(() => setLoading(false));
  }, deps);
  useEffect(() => { reload(); }, [reload]);
  return { data, loading, error, reload };
}

function Page({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return <main className='mx-auto max-w-7xl px-4 py-8'><SafetyBanner /><div className='my-8'><h1 className='text-3xl font-black tracking-tight text-white md:text-5xl'>{title}</h1>{subtitle && <p className='mt-3 max-w-3xl text-slate-300'>{subtitle}</p>}</div>{children}</main>;
}

function LandingPage() {
  return <Page title='HeaderRift' subtitle='A safety-constrained HTTP assessment control panel for authorized target profiles, header-focused request chains, backend preflight checks, controlled replay runs, response diffs, and sanitized trace exports.'><div className='grid gap-5 lg:grid-cols-3'><div className='card p-6 lg:col-span-2'><h2 className='text-2xl font-bold text-white'>Workflow</h2><div className='mt-5 grid gap-4 md:grid-cols-2'><div className='rounded-2xl border border-white/10 bg-white/5 p-4'><h3 className='font-semibold text-white'>1. Define scope</h3><p className='mt-2 text-sm text-slate-300'>Persist target profiles with hostname, allowed methods, allowed paths, pinned IP metadata, and authorization notes.</p></div><div className='rounded-2xl border border-white/10 bg-white/5 p-4'><h3 className='font-semibold text-white'>2. Build chains</h3><p className='mt-2 text-sm text-slate-300'>Compose ordered request steps with custom headers, cookies, body templates, encoding flags, duplicate header handling, and delays.</p></div><div className='rounded-2xl border border-white/10 bg-white/5 p-4'><h3 className='font-semibold text-white'>3. Run preflight</h3><p className='mt-2 text-sm text-slate-300'>Ask the backend to validate allowlist, path/method scope, public-range policy, rate limits, and confirmations before execution.</p></div><div className='rounded-2xl border border-white/10 bg-white/5 p-4'><h3 className='font-semibold text-white'>4. Inspect and export</h3><p className='mt-2 text-sm text-slate-300'>Review step responses, timing, safety events, response diffs, and generate redacted JSON or HAR-like traces.</p></div></div></div><div className='card p-6'><h2 className='text-xl font-bold text-white'>Backend status</h2><HealthCard /><a className='btn-primary mt-5 inline-block' href='#/targets'>Start with targets</a></div></div><div className='mt-5 grid gap-5 md:grid-cols-4'>{['Header smuggling probes', 'Header injection checks', 'Cache poisoning probes', 'Auth-header abuse scenarios'].map((item) => <div key={item} className='card p-5'><h3 className='font-semibold text-white'>{item}</h3><p className='mt-2 text-sm text-slate-400'>High-level backend module templates with safety notes and scoped request transformations.</p></div>)}</div></Page>;
}

function HealthCard() {
  const { data, loading, error, reload } = useLoad(() => api.health(), []);
  if (loading) return <div className='mt-4 text-sm text-slate-400'>Checking API...</div>;
  if (error) return <div className='mt-4'><ErrorState message={error} onRetry={reload} /></div>;
  return <div className='mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100'>Status: {data?.status} · Version: {data?.version} · {formatDate(data?.time)}</div>;
}

function TargetsPage() {
  const [search, setSearch] = useState('');
  const { data, loading, error, reload } = useLoad(() => api.listTargets({ search }), [search]);
  const archive = async (id: string) => { if (window.confirm('Archive this target and prevent new runs from using it?')) { await api.archiveTarget(id); reload(); } };
  return <Page title='Targets' subtitle='Create and review authorized target profiles. The backend revalidates target scope before saving and before every run.'><div className='grid gap-6 lg:grid-cols-[1fr_1.2fr]'><TargetProfileForm onSaved={reload} /><section className='space-y-4'><label className='label'>Search targets<input className='input mt-1' value={search} onChange={(e) => setSearch(e.target.value)} placeholder='hostname or name' /></label>{loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : <TargetListTable items={data?.items || []} onArchive={archive} />}</section></div></Page>;
}

function ProfilesPage() {
  const { data, loading, error, reload } = useLoad(() => api.listPayloadProfiles(), []);
  return <Page title='Payload profiles' subtitle='Describe parser and edge-behavior assumptions that the backend can apply during controlled replay runs.'><div className='grid gap-6 lg:grid-cols-[1fr_1.2fr]'><PayloadProfileEditor onSaved={reload} /><section>{loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.items.length ? <EmptyState title='No payload profiles' description='Create a parser and normalization profile before running a chain.' /> : <div className='grid gap-4'>{data.items.map((profile) => <div key={profile.id} className='card p-5'><h3 className='font-semibold text-white'>{profile.name}</h3><p className='mt-1 text-sm text-slate-300'>{profile.description || 'No description provided.'}</p><div className='mt-3 flex flex-wrap gap-2 text-xs text-slate-300'><Badge className='border-sky-400/20 bg-sky-500/10 text-sky-200'>{profile.parserFamily}</Badge><Badge className='border-white/10 bg-white/5 text-slate-200'>{profile.headerNormalizationMode}</Badge>{profile.cacheKeyAssumptions.map((item) => <Badge key={item} className='border-white/10 bg-white/5 text-slate-200'>{item}</Badge>)}</div></div>)}</div>}</section></div></Page>;
}

function ChainsPage() {
  const [search, setSearch] = useState('');
  const { data, loading, error, reload } = useLoad(() => api.listChains({ search }), [search]);
  return <Page title='Request chains' subtitle='Build, validate, and save ordered header-focused request chains. No browser-side replay occurs; saved chains are submitted to the backend.'><div className='mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between'><label className='label flex-1'>Search chains<input className='input mt-1' value={search} onChange={(e) => setSearch(e.target.value)} /></label><a className='btn-primary text-center' href='#/chains/new'>New chain</a></div>{loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.items.length ? <EmptyState title='No request chains' description='Create a chain with one or more request steps before running preflight.' action={<a className='btn-primary inline-block' href='#/chains/new'>Create chain</a>} /> : <div className='grid gap-4 md:grid-cols-2'>{data.items.map((chain) => <a key={chain.id} href={`#/chains/${chain.id}`} className='card block p-5 transition hover:border-rift-500/60'><div className='flex items-start justify-between gap-3'><h3 className='font-semibold text-white'>{chain.name}</h3><Badge className='border-white/10 bg-white/5 text-slate-200'>{moduleLabel(chain.moduleType)}</Badge></div><p className='mt-2 text-sm text-slate-300'>{chain.description || 'No description provided.'}</p><p className='mt-3 text-xs text-slate-400'>{chain.stepCount} steps · updated {formatDate(chain.updatedAt)}</p></a>)}</div>}</Page>;
}

function ChainEditorPage({ route }: { route: string }) {
  const id = route.split('/')[2];
  return <Page title={id === 'new' ? 'New request chain' : 'Edit request chain'} subtitle='Configure step ordering, headers, cookies, templates, encoding flags, delays, module assignment, and backend validation.'><ChainEditor chainId={id === 'new' ? undefined : id} /></Page>;
}

function RunSetupPage() {
  const [targetId, setTargetId] = useState('');
  const [chainId, setChainId] = useState('');
  const [payloadProfileId, setPayloadProfileId] = useState('');
  const [options, setOptions] = useState<RunOptionsInput>({ requestsPerSecond: 1, maxSteps: 10, timeoutMs: 10000, followRedirects: false, captureBodyPreview: true, bodyPreviewBytes: 4096 });
  const [ack, setAck] = useState<RunAcknowledgements>({ authorizationConfirmed: false, scopeConfirmed: false, publicTargetOverrideConfirmed: false });
  const [preflight, setPreflight] = useState<RunPreflightResult | null>(null);
  const [message, setMessage] = useState('');
  const targets = useLoad(() => api.listTargets(), []);
  const chains = useLoad(() => api.listChains(), []);
  const profiles = useLoad(() => api.listPayloadProfiles(), []);
  const request = { targetId, chainId, payloadProfileId, options, acknowledgements: ack };
  const canSubmit = targetId && chainId && payloadProfileId;
  async function runPreflight() { setMessage(''); try { setPreflight((await api.preflightRun(request)).preflight); } catch (err) { setMessage(err instanceof Error ? err.message : 'Preflight failed.'); } }
  async function start() { setMessage(''); try { const response = await api.startRun(request); window.location.hash = `/runs/${response.run.id}`; } catch (err) { setMessage(err instanceof Error ? err.message : 'Unable to start run.'); } }
  return <Page title='Run setup' subtitle='Select persisted scope, chain, and profile. The backend must allow preflight before controlled replay can begin.'><div className='grid gap-6 lg:grid-cols-[1fr_1fr]'><div className='card p-5'><div className='grid gap-4'><label className='label'>Target<select className='input mt-1' value={targetId} onChange={(e) => setTargetId(e.target.value)}><option value=''>Select target</option>{targets.data?.items.map((item: TargetProfileSummary) => <option key={item.id} value={item.id}>{item.name} ({item.hostname})</option>)}</select></label><label className='label'>Request chain<select className='input mt-1' value={chainId} onChange={(e) => setChainId(e.target.value)}><option value=''>Select chain</option>{chains.data?.items.map((item: RequestChainSummary) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className='label'>Payload profile<select className='input mt-1' value={payloadProfileId} onChange={(e) => setPayloadProfileId(e.target.value)}><option value=''>Select profile</option>{profiles.data?.items.map((item: PayloadProfile) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><div className='grid gap-4 md:grid-cols-2'><label className='label'>Requests per second<input className='input mt-1' type='number' min={0.1} step={0.1} value={options.requestsPerSecond} onChange={(e) => setOptions({ ...options, requestsPerSecond: Number(e.target.value) })} /></label><label className='label'>Max steps<input className='input mt-1' type='number' min={1} value={options.maxSteps} onChange={(e) => setOptions({ ...options, maxSteps: Number(e.target.value) })} /></label><label className='label'>Timeout ms<input className='input mt-1' type='number' min={1000} value={options.timeoutMs} onChange={(e) => setOptions({ ...options, timeoutMs: Number(e.target.value) })} /></label><label className='label'>Body preview bytes<input className='input mt-1' type='number' min={0} value={options.bodyPreviewBytes} onChange={(e) => setOptions({ ...options, bodyPreviewBytes: Number(e.target.value) })} /></label></div><label className='text-sm text-slate-200'><input type='checkbox' checked={options.followRedirects} onChange={(e) => setOptions({ ...options, followRedirects: e.target.checked })} /> Follow redirects</label><label className='text-sm text-slate-200'><input type='checkbox' checked={options.captureBodyPreview} onChange={(e) => setOptions({ ...options, captureBodyPreview: e.target.checked })} /> Capture body preview</label><div className='space-y-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4'><label className='block text-sm text-amber-50'><input type='checkbox' checked={ack.authorizationConfirmed} onChange={(e) => setAck({ ...ack, authorizationConfirmed: e.target.checked })} /> I confirm authorization for this execution.</label><label className='block text-sm text-amber-50'><input type='checkbox' checked={ack.scopeConfirmed} onChange={(e) => setAck({ ...ack, scopeConfirmed: e.target.checked })} /> I confirm the selected chain stays within approved scope.</label><label className='block text-sm text-amber-50'><input type='checkbox' checked={ack.publicTargetOverrideConfirmed} onChange={(e) => setAck({ ...ack, publicTargetOverrideConfirmed: e.target.checked })} /> I explicitly acknowledge public-range override if the backend requires it.</label></div><div className='flex flex-wrap gap-3'><button className='btn-secondary' type='button' disabled={!canSubmit} onClick={runPreflight}>Run preflight</button><button className='btn-primary' type='button' disabled={!canSubmit || !preflight?.allowed || !ack.authorizationConfirmed || !ack.scopeConfirmed} onClick={start}>Start controlled run</button></div>{message && <p className='rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100'>{message}</p>}</div></div><PreflightChecklist preflight={preflight} /></div></Page>;
}

function RunDetailPage({ route }: { route: string }) {
  const id = route.split('/')[2];
  const { data, loading, error, reload } = useLoad(() => api.getRun(id), [id]);
  const [events, setEvents] = useState<RunEvent[]>([]);
  useEffect(() => { setEvents(data?.run.events || []); }, [data]);
  useEffect(() => {
    if (!data?.run || data.run.summary.status !== 'running') return;
    const timer = window.setInterval(async () => {
      try { const latest = events.reduce((max, event) => Math.max(max, event.sequence), 0); const response = await api.getRunEvents(id, latest); setEvents((current) => [...current, ...response.events]); reload(); } catch { }
    }, 2500);
    return () => window.clearInterval(timer);
  }, [data?.run?.summary.status, events, id, reload]);
  async function cancel() { await api.cancelRun(id); reload(); }
  return <Page title='Run detail' subtitle='Inspect execution status, safety events, per-step responses, diffs, and export generation.'>{loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : data ? <div className='space-y-6'><RunConsole run={data.run as RunDetail} events={events} onCancel={cancel} /><DiffPanel diffs={data.run.diffs} /><ExportPanel runId={id} /></div> : null}</Page>;
}

function HistoryPage() {
  const [status, setStatus] = useState<RunStatus | ''>('');
  const { data, loading, error, reload } = useLoad(() => api.listRuns({ status, page: 1, pageSize: 50 }), [status]);
  return <Page title='Run history' subtitle='Browse recorded backend replay runs with outcomes and timestamps.'><label className='label mb-5 block max-w-sm'>Filter by status<select className='input mt-1' value={status} onChange={(e) => setStatus(e.target.value as RunStatus | '')}><option value=''>Any status</option>{['pending','preflight_failed','running','completed','cancelled','failed'].map((item) => <option key={item} value={item}>{item}</option>)}</select></label>{loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.items.length ? <EmptyState title='No run history' description='Runs started through the backend will be listed here with status and outcome summaries.' /> : <div className='card overflow-hidden'><table className='min-w-full divide-y divide-white/10 text-sm'><thead className='bg-white/5 text-left text-slate-300'><tr><th className='px-4 py-3'>Run</th><th className='px-4 py-3'>Status</th><th className='px-4 py-3'>Started</th><th className='px-4 py-3'>Steps</th><th className='px-4 py-3'>Outcome</th></tr></thead><tbody className='divide-y divide-white/10'>{data.items.map((run: RunSummary) => <tr key={run.id} className='text-slate-200'><td className='px-4 py-3'><a className='text-rift-100 hover:underline' href={`#/runs/${run.id}`}>{run.id}</a></td><td className='px-4 py-3'><Badge className={statusClass(run.status)}>{run.status}</Badge></td><td className='px-4 py-3'>{formatDate(run.startedAt)}</td><td className='px-4 py-3'>{run.stepCount}</td><td className='px-4 py-3'>{run.outcomeSummary}</td></tr>)}</tbody></table></div>}</Page>;
}

function ExportsPage() {
  const { data, loading, error, reload } = useLoad(() => api.listExports(), []);
  async function download(artifact: ExportArtifact) { const file = await api.downloadExport(artifact.id); const blob = new Blob([file.content], { type: file.mimeType }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = file.fileName; link.click(); URL.revokeObjectURL(url); }
  return <Page title='Exports' subtitle='Download sanitized JSON and HAR-like artifacts produced by backend export generation.'>{loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.items.length ? <EmptyState title='No exports generated' description='Generate an export from a run detail page or provide a run ID below.' /> : <div className='grid gap-4'>{data.items.map((artifact) => <div key={artifact.id} className='card flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between'><div><h3 className='font-semibold text-white'>{artifact.fileName}</h3><p className='text-sm text-slate-400'>{artifact.format} · run {artifact.runId} · {formatDate(artifact.createdAt)}</p></div><button className='btn-secondary' onClick={() => download(artifact)}>Download</button></div>)}</div>}<div className='mt-6'><ManualExport onGenerated={reload} /></div></Page>;
}

function ManualExport({ onGenerated }: { onGenerated: () => void }) {
  const [runId, setRunId] = useState('');
  return <div><label className='label mb-3 block max-w-xl'>Run ID for new export<input className='input mt-1' value={runId} onChange={(e) => setRunId(e.target.value)} placeholder='Paste a run id' /></label>{runId && <ExportPanel runId={runId} onGenerated={onGenerated} />}</div>;
}

function SettingsPage() {
  const { data, loading, error, reload } = useLoad(() => api.settings(), []);
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { if (data?.settings) setText(JSON.stringify(data.settings, null, 2)); }, [data]);
  async function save() { try { const parsed = JSON.parse(text) as AppSettings; const response = await api.updateSettings(parsed); setText(JSON.stringify(response.settings, null, 2)); setMessage('Settings saved by backend.'); } catch (err) { setMessage(err instanceof Error ? err.message : 'Invalid settings JSON.'); } }
  return <Page title='Settings' subtitle='View and update local backend settings exposed by the API. API base URL itself is controlled by VITE_API_BASE_URL at build/runtime.'>{loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : <div className='card p-5'><label className='label'>Backend settings JSON<textarea className='input mt-2 min-h-96 font-mono text-xs' value={text} onChange={(e) => setText(e.target.value)} /></label><button className='btn-primary mt-4' onClick={save}>Save settings</button>{message && <p className='mt-3 text-sm text-slate-300'>{message}</p>}</div>}</Page>;
}

function NotFoundPage() { return <Page title='Page not found'><EmptyState title='Unknown route' description='Use the navigation bar to return to a HeaderRift workflow.' action={<a className='btn-primary inline-block' href='#/'>Go to overview</a>} /></Page>; }

export default function App() {
  const route = useHashRoute();
  const content = useMemo(() => {
    if (route === '/') return <LandingPage />;
    if (route === '/targets') return <TargetsPage />;
    if (route === '/payload-profiles') return <ProfilesPage />;
    if (route === '/chains') return <ChainsPage />;
    if (route === '/chains/new' || route.startsWith('/chains/')) return <ChainEditorPage route={route} />;
    if (route === '/runs/new') return <RunSetupPage />;
    if (route.startsWith('/runs/')) return <RunDetailPage route={route} />;
    if (route === '/history') return <HistoryPage />;
    if (route === '/exports') return <ExportsPage />;
    if (route === '/settings') return <SettingsPage />;
    return <NotFoundPage />;
  }, [route]);
  return <div className='min-h-screen text-slate-100'><Header route={route} />{content}</div>;
}
