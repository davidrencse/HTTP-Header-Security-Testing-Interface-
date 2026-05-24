import type { IssueSeverity, ModuleType, RunStatus } from '../types';

export const formatDate = (value?: string | null) => {
  if (!value) return 'Not completed';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export const statusClass = (status: RunStatus | string) => {
  const map: Record<string, string> = {
    completed: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20',
    running: 'bg-sky-500/15 text-sky-200 border-sky-400/20',
    pending: 'bg-amber-500/15 text-amber-200 border-amber-400/20',
    failed: 'bg-rose-500/15 text-rose-200 border-rose-400/20',
    preflight_failed: 'bg-rose-500/15 text-rose-200 border-rose-400/20',
    cancelled: 'bg-slate-500/15 text-slate-200 border-slate-400/20',
    allowed: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20',
    warning: 'bg-amber-500/15 text-amber-200 border-amber-400/20',
    blocked: 'bg-rose-500/15 text-rose-200 border-rose-400/20'
  };
  return map[status] || 'bg-slate-500/15 text-slate-200 border-slate-400/20';
};

export const issueClass = (severity: IssueSeverity) => {
  if (severity === 'error') return 'border-rose-400/30 bg-rose-500/10 text-rose-100';
  if (severity === 'warning') return 'border-amber-400/30 bg-amber-500/10 text-amber-100';
  return 'border-sky-400/30 bg-sky-500/10 text-sky-100';
};

export const moduleLabel = (type: ModuleType | string) => ({
  headerSmuggling: 'Header smuggling probes',
  headerInjection: 'Header injection checks',
  cachePoisoning: 'Cache poisoning probes',
  authHeaderAbuse: 'Auth-header abuse scenarios',
  custom: 'Custom chain'
}[type] || type);

export const splitCsv = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
export const joinCsv = (value: string[] = []) => value.join(', ');
