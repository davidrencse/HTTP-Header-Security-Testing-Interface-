export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
export type ModuleType = 'headerSmuggling' | 'headerInjection' | 'cachePoisoning' | 'authHeaderAbuse' | 'custom';
export type RunStatus = 'pending' | 'preflight_failed' | 'running' | 'completed' | 'cancelled' | 'failed';
export type IssueSeverity = 'info' | 'warning' | 'error';

export interface TargetProfile {
  id: string;
  name: string;
  protocol: 'http' | 'https';
  hostname: string;
  allowedMethods: HttpMethod[];
  allowedPaths: string[];
  pinnedIps: string[];
  authorizationConfirmed: boolean;
  authorizationNote: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  lastValidationStatus: 'allowed' | 'blocked' | 'warning';
}

export interface TargetProfileSummary {
  id: string;
  name: string;
  protocol: 'http' | 'https';
  hostname: string;
  isArchived: boolean;
  lastValidationStatus: 'allowed' | 'blocked' | 'warning';
  updatedAt: string;
}

export interface PayloadProfile {
  id: string;
  name: string;
  description: string;
  parserFamily: string;
  headerNormalizationMode: string;
  cacheKeyAssumptions: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestHeaderInput {
  name: string;
  value: string;
  enabled: boolean;
  allowDuplicateName: boolean;
  preserveCase: boolean;
}

export interface RequestCookieInput {
  name: string;
  value: string;
  enabled: boolean;
}

export interface RequestStepInput {
  sequence: number;
  method: HttpMethod;
  path: string;
  headers: RequestHeaderInput[];
  cookies: RequestCookieInput[];
  bodyTemplate: string;
  encodingFlags: string[];
  delayMs: number;
}

export interface RequestStep extends RequestStepInput {
  id: string;
}

export interface RequestChain {
  id: string;
  name: string;
  description: string;
  moduleType: ModuleType;
  tags: string[];
  steps: RequestStep[];
  createdAt: string;
  updatedAt: string;
}

export interface RequestChainSummary {
  id: string;
  name: string;
  description: string;
  moduleType: ModuleType;
  stepCount: number;
  updatedAt: string;
}

export interface SafetyValidationIssue {
  code: string;
  severity: IssueSeverity;
  message: string;
}

export interface SafetyValidationResult {
  allowed: boolean;
  requiresExplicitPublicOverride: boolean;
  resolvedIps: string[];
  issues: SafetyValidationIssue[];
}

export interface ChainValidationResult {
  valid: boolean;
  issues: SafetyValidationIssue[];
}

export interface RunOptionsInput {
  requestsPerSecond: number;
  maxSteps: number;
  timeoutMs: number;
  followRedirects: boolean;
  captureBodyPreview: boolean;
  bodyPreviewBytes: number;
}

export interface RunAcknowledgements {
  authorizationConfirmed: boolean;
  scopeConfirmed: boolean;
  publicTargetOverrideConfirmed: boolean;
}

export interface RunPreflightResult {
  allowed: boolean;
  targetValidation: SafetyValidationResult;
  chainValidation: ChainValidationResult;
  effectiveRateLimit: number;
  confirmationRequired: boolean;
  issues: SafetyValidationIssue[];
}

export interface RunSummary {
  id: string;
  targetId: string;
  chainId: string;
  payloadProfileId: string;
  status: RunStatus;
  startedAt: string;
  completedAt: string | null;
  stepCount: number;
  outcomeSummary: string;
}

export interface ResponseSnapshot {
  statusCode: number;
  headers: Record<string, string | string[]>;
  bodyPreview: string;
  bodyLength: number;
  redirectLocation: string | null;
  cacheIndicators: string[];
  timingMs: number;
}

export interface RunStepResult {
  id: string;
  stepId: string;
  attemptIndex: number;
  requestSnapshot: {
    method: HttpMethod;
    path: string;
    headers: RequestHeaderInput[];
    cookies: RequestCookieInput[];
    bodyPreview: string;
  };
  responseSnapshot: ResponseSnapshot | null;
  timingMs: number;
  outcome: 'success' | 'timeout' | 'blocked' | 'error';
  errorMessage: string | null;
}

export interface DiffSummary {
  baseAttemptIndex: number;
  compareAttemptIndex: number;
  statusChanged: boolean;
  headerChanges: string[];
  bodyLengthDelta: number;
  timingDeltaMs: number;
  cacheIndicatorChanged: boolean;
}

export interface RunEvent {
  sequence: number;
  type: 'info' | 'warning' | 'error' | 'step_started' | 'step_completed' | 'run_completed' | 'run_cancelled';
  message: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface RunDetail {
  summary: RunSummary;
  preflight: RunPreflightResult;
  stepResults: RunStepResult[];
  diffs: DiffSummary[];
  events: RunEvent[];
}

export interface ExportRedactionOptions {
  redactHeaderNames: string[];
  truncateBodyBytes: number;
  excludeBody: boolean;
}

export interface ExportArtifact {
  id: string;
  runId: string;
  format: 'json' | 'harLike';
  fileName: string;
  mimeType: string;
  createdAt: string;
}

export interface ModuleDescriptor {
  type: ModuleType;
  name: string;
  description: string;
  safetyNotes: string[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AppSettings {
  allowPublicTargets?: boolean;
  defaultRequestsPerSecond?: number;
  defaultBodyPreviewBytes?: number;
  defaultRedactHeaderNames?: string[];
  [key: string]: unknown;
}

export interface HealthResponse {
  status: string;
  version: string;
  time: string;
}

export interface ApiErrorBody {
  error?: string;
  message?: string;
  issues?: SafetyValidationIssue[];
}
