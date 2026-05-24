import React from 'react';

export function LoadingState({ label = 'Loading from backend...' }: { label?: string }) {
  return <div className='card p-6 text-slate-300'><div className='h-2 w-32 animate-pulse rounded bg-rift-500/70' /><p className='mt-4'>{label}</p></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className='card border-rose-500/30 bg-rose-950/30 p-6'><h3 className='font-semibold text-rose-100'>Backend request failed</h3><p className='mt-2 text-sm text-rose-100/80'>{message}</p>{onRetry && <button className='btn-secondary mt-4' onClick={onRetry}>Retry</button>}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className='card p-8 text-center'><h3 className='text-lg font-semibold text-white'>{title}</h3><p className='mx-auto mt-2 max-w-xl text-sm text-slate-400'>{description}</p>{action && <div className='mt-5'>{action}</div>}</div>;
}

export function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}
