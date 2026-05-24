import type { HttpMethod, RequestStepInput } from '../types';

export const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export const validateHostname = (hostname: string) => /^[a-zA-Z0-9.-]+$/.test(hostname.trim()) && hostname.includes('.');
export const validatePathList = (paths: string[]) => paths.length > 0 && paths.every((path) => path.startsWith('/'));

export const validateTargetDraft = (draft: { hostname: string; allowedMethods: HttpMethod[]; allowedPaths: string[]; authorizationConfirmed: boolean; authorizationNote: string }) => {
  const errors: string[] = [];
  if (!draft.hostname.trim() || !validateHostname(draft.hostname)) errors.push('Enter a valid hostname such as app.internal.test.');
  if (draft.allowedMethods.length === 0) errors.push('Select at least one allowed HTTP method.');
  if (!validatePathList(draft.allowedPaths)) errors.push('Allowed paths must contain at least one path and every path must start with /.');
  if (!draft.authorizationConfirmed) errors.push('Confirm ownership or explicit authorization before saving.');
  if (draft.authorizationNote.trim().length < 8) errors.push('Add an authorization note with enough context for audit history.');
  return errors;
};

export const validateSteps = (steps: RequestStepInput[]) => {
  const errors: string[] = [];
  if (steps.length === 0) errors.push('Add at least one request step.');
  steps.forEach((step, index) => {
    if (!step.path.startsWith('/')) errors.push(`Step ${index + 1}: path must start with /.`);
    if (step.delayMs < 0) errors.push(`Step ${index + 1}: delay cannot be negative.`);
    step.headers.forEach((header, headerIndex) => {
      if (header.enabled && !header.name.trim()) errors.push(`Step ${index + 1}, header ${headerIndex + 1}: enabled headers need a name.`);
    });
    step.cookies.forEach((cookie, cookieIndex) => {
      if (cookie.enabled && !cookie.name.trim()) errors.push(`Step ${index + 1}, cookie ${cookieIndex + 1}: enabled cookies need a name.`);
    });
  });
  return errors;
};
