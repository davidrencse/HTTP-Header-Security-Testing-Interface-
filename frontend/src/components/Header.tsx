import { getApiBaseUrl } from '../api/client';

const nav = [
  ['/', 'Overview'],
  ['/targets', 'Targets'],
  ['/payload-profiles', 'Payload profiles'],
  ['/chains', 'Chains'],
  ['/runs/new', 'Run setup'],
  ['/history', 'History'],
  ['/exports', 'Exports'],
  ['/settings', 'Settings']
];

export function Header({ route }: { route: string }) {
  return <header className='sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur'><div className='mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between'><a href='#/' className='flex items-center gap-3'><span className='grid h-10 w-10 place-items-center rounded-2xl bg-rift-500 font-black text-white shadow-lg shadow-rift-500/25'>HR</span><span><span className='block text-lg font-bold text-white'>HeaderRift</span><span className='text-xs text-slate-400'>Authorized HTTP request-chain control panel</span></span></a><nav className='flex flex-wrap gap-2'>{nav.map(([href, label]) => <a key={href} href={`#${href}`} className={`rounded-xl px-3 py-2 text-sm font-medium transition ${route === href || (href !== '/' && route.startsWith(href)) ? 'bg-rift-500 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>{label}</a>)}</nav></div><div className='border-t border-white/10 bg-slate-900/80 px-4 py-2 text-center text-xs text-slate-400'>API endpoint: <span className='font-mono text-slate-200'>{getApiBaseUrl()}</span>. Live operations are executed only by the backend after allowlist and acknowledgement checks.</div></header>;
}
