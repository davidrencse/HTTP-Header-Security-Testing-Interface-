import { apiFetch, jsonBody } from './client';
import type { AppSettings, ChainValidationResult, ExportArtifact, ExportRedactionOptions, HealthResponse, ModuleDescriptor, PayloadProfile, RequestChain, RequestChainSummary, RequestStepInput, RunAcknowledgements, RunDetail, RunEvent, RunOptionsInput, RunPreflightResult, RunStatus, RunSummary, SafetyValidationResult, TargetProfile, TargetProfileSummary } from '../types';

export const api = {
  health: () => apiFetch<HealthResponse>('/health'),
  modules: () => apiFetch<{ items: ModuleDescriptor[] }>('/modules'),
  settings: () => apiFetch<{ settings: AppSettings }>('/settings'),
  updateSettings: (settings: AppSettings) => apiFetch<{ settings: AppSettings }>('/settings', { method: 'PUT', body: jsonBody(settings) }),
  listTargets: (query?: { archived?: boolean; search?: string }) => apiFetch<{ items: TargetProfileSummary[] }>('/targets', { query }),
  createTarget: (body: Omit<TargetProfile, 'id' | 'isArchived' | 'createdAt' | 'updatedAt' | 'lastValidationStatus'>) => apiFetch<{ target: TargetProfile; validation: SafetyValidationResult }>('/targets', { method: 'POST', body: jsonBody(body) }),
  getTarget: (id: string) => apiFetch<{ target: TargetProfile }>(`/targets/${encodeURIComponent(id)}`),
  updateTarget: (id: string, body: Omit<TargetProfile, 'id' | 'isArchived' | 'createdAt' | 'updatedAt' | 'lastValidationStatus'>) => apiFetch<{ target: TargetProfile; validation: SafetyValidationResult }>(`/targets/${encodeURIComponent(id)}`, { method: 'PUT', body: jsonBody(body) }),
  archiveTarget: (id: string) => apiFetch<{ success: boolean }>(`/targets/${encodeURIComponent(id)}/archive`, { method: 'POST' }),
  listPayloadProfiles: () => apiFetch<{ items: PayloadProfile[] }>('/payload-profiles'),
  createPayloadProfile: (body: Omit<PayloadProfile, 'id' | 'createdAt' | 'updatedAt'>) => apiFetch<{ payloadProfile: PayloadProfile }>('/payload-profiles', { method: 'POST', body: jsonBody(body) }),
  updatePayloadProfile: (id: string, body: Omit<PayloadProfile, 'id' | 'createdAt' | 'updatedAt'>) => apiFetch<{ payloadProfile: PayloadProfile }>(`/payload-profiles/${encodeURIComponent(id)}`, { method: 'PUT', body: jsonBody(body) }),
  listChains: (query?: { search?: string }) => apiFetch<{ items: RequestChainSummary[] }>('/chains', { query }),
  createChain: (body: { name: string; description: string; moduleType: string; steps: RequestStepInput[]; tags: string[] }) => apiFetch<{ chain: RequestChain; validation: ChainValidationResult }>('/chains', { method: 'POST', body: jsonBody(body) }),
  getChain: (id: string) => apiFetch<{ chain: RequestChain }>(`/chains/${encodeURIComponent(id)}`),
  updateChain: (id: string, body: { name: string; description: string; moduleType: string; steps: RequestStepInput[]; tags: string[] }) => apiFetch<{ chain: RequestChain; validation: ChainValidationResult }>(`/chains/${encodeURIComponent(id)}`, { method: 'PUT', body: jsonBody(body) }),
  validateChain: (id: string) => apiFetch<{ validation: ChainValidationResult }>(`/chains/${encodeURIComponent(id)}/validate`, { method: 'POST' }),
  preflightRun: (body: { targetId: string; chainId: string; payloadProfileId: string; options: RunOptionsInput; acknowledgements: RunAcknowledgements }) => apiFetch<{ preflight: RunPreflightResult }>('/runs/preflight', { method: 'POST', body: jsonBody(body) }),
  startRun: (body: { targetId: string; chainId: string; payloadProfileId: string; options: RunOptionsInput; acknowledgements: RunAcknowledgements }) => apiFetch<{ run: RunSummary }>('/runs', { method: 'POST', body: jsonBody(body) }),
  listRuns: (query?: { targetId?: string; chainId?: string; status?: RunStatus | ''; page?: number; pageSize?: number }) => apiFetch<{ items: RunSummary[]; pagination: { page: number; pageSize: number; totalItems: number; totalPages: number } }>('/runs', { query }),
  getRun: (id: string) => apiFetch<{ run: RunDetail }>(`/runs/${encodeURIComponent(id)}`),
  cancelRun: (id: string) => apiFetch<{ success: boolean; runStatus: RunStatus }>(`/runs/${encodeURIComponent(id)}/cancel`, { method: 'POST' }),
  getRunEvents: (id: string, afterSequence?: number) => apiFetch<{ events: RunEvent[]; latestSequence: number }>(`/runs/${encodeURIComponent(id)}/events`, { query: { afterSequence } }),
  createExport: (body: { runId: string; format: 'json' | 'harLike'; redaction: ExportRedactionOptions }) => apiFetch<{ export: ExportArtifact }>('/exports', { method: 'POST', body: jsonBody(body) }),
  listExports: (query?: { runId?: string }) => apiFetch<{ items: ExportArtifact[] }>('/exports', { query }),
  getExport: (id: string) => apiFetch<{ export: ExportArtifact }>(`/exports/${encodeURIComponent(id)}`),
  downloadExport: (id: string) => apiFetch<{ fileName: string; mimeType: string; content: string }>(`/exports/${encodeURIComponent(id)}/download`)
};
