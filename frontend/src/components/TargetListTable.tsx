import type { TargetProfileSummary } from '../types';
import { formatDate, statusClass } from '../utils/formatters';
import { Badge, EmptyState } from './StatusView';

export function TargetListTable({ items, onArchive }: { items: TargetProfileSummary[]; onArchive: (id: string) => void }) {
  if (!items.length) return <EmptyState title='No target profiles yet' description='Create an authorized target profile to make paths, methods, and authorization notes available for backend preflight checks.' />;
  return <div className='card overflow-hidden'><table className='min-w-full divide-y divide-white/10 text-sm'><thead className='bg-white/5 text-left text-slate-300'><tr><th className='px-4 py-3'>Name</th><th className='px-4 py-3'>Host</th><th className='px-4 py-3'>Validation</th><th className='px-4 py-3'>Updated</th><th className='px-4 py-3'>Actions</th></tr></thead><tbody className='divide-y divide-white/10'>{items.map((target) => <tr key={target.id} className='text-slate-200'><td className='px-4 py-3 font-medium'>{target.name}{target.isArchived && <span className='ml-2 text-xs text-slate-500'>(archived)</span>}</td><td className='px-4 py-3 font-mono text-xs'>{target.protocol}://{target.hostname}</td><td className='px-4 py-3'><Badge className={statusClass(target.lastValidationStatus)}>{target.lastValidationStatus}</Badge></td><td className='px-4 py-3'>{formatDate(target.updatedAt)}</td><td className='px-4 py-3'><button className='btn-secondary py-1 text-xs' disabled={target.isArchived} onClick={() => onArchive(target.id)}>Archive</button></td></tr>)}</tbody></table></div>;
}
