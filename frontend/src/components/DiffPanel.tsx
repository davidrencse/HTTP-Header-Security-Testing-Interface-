import type { DiffSummary } from '../types';
import { EmptyState } from './StatusView';

export function DiffPanel({ diffs }: { diffs: DiffSummary[] }) {
  if (!diffs.length) return <EmptyState title='No diffs available' description='Completed runs with comparable attempts will show status, header, body length, cache indicator, and timing deltas here.' />;
  return <div className='card p-5'><h3 className='text-lg font-semibold text-white'>Response diffs</h3><div className='mt-4 space-y-3'>{diffs.map((diff, index) => <div key={index} className='rounded-2xl border border-white/10 bg-white/5 p-4'><div className='flex flex-wrap gap-3 text-sm text-slate-300'><span>Base {diff.baseAttemptIndex} → Compare {diff.compareAttemptIndex}</span><span>Status changed: {diff.statusChanged ? 'yes' : 'no'}</span><span>Body delta: {diff.bodyLengthDelta}</span><span>Timing delta: {diff.timingDeltaMs}ms</span><span>Cache changed: {diff.cacheIndicatorChanged ? 'yes' : 'no'}</span></div><ul className='mt-3 list-disc pl-5 text-sm text-slate-300'>{diff.headerChanges.length ? diff.headerChanges.map((change) => <li key={change}>{change}</li>) : <li>No header changes reported.</li>}</ul></div>)}</div></div>;
}
