import type { ARDecision, RealArtistData } from '../types';

export interface DiscoverySearchResult {
  artists: RealArtistData[];
  scan?: any;
  source?: string;
}

const rawBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
const API_BASE = String(rawBase || '').replace(/\/$/, '');
const API_TIMEOUT_MS = 8000;

async function withTimeout<T>(promise: Promise<T>, ms = API_TIMEOUT_MS): Promise<T> {
  let t: any;
  const timeout = new Promise<never>((_, reject) => {
    t = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(t);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await withTimeout(fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  }));
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }
  return res.json() as Promise<T>;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const data = await apiFetch<{ ok: boolean }>('/api/health', { method: 'GET' });
    return !!data?.ok;
  } catch {
    return false;
  }
}

export async function fetchSeedArtistsFromBackend(): Promise<RealArtistData[]> {
  const data = await apiFetch<{ artists: RealArtistData[] }>('/api/artists/seed');
  return Array.isArray(data.artists) ? data.artists : [];
}

export async function fetchArtistsFromBackend(): Promise<RealArtistData[]> {
  const data = await apiFetch<{ artists: RealArtistData[] }>('/api/artists');
  return Array.isArray(data.artists) ? data.artists : [];
}

export async function upsertArtistsToBackend(artists: RealArtistData[]): Promise<void> {
  if (!artists?.length) return;
  await apiFetch('/api/artists', {
    method: 'POST',
    body: JSON.stringify({ artists })
  });
}

export async function discoverArtistsViaBackend(
  query: string,
  region = 'East Africa',
  limit = 12
): Promise<DiscoverySearchResult> {
  const q = encodeURIComponent(query);
  const r = encodeURIComponent(region);
  return apiFetch<DiscoverySearchResult>(`/api/discovery/search?q=${q}&region=${r}&limit=${limit}`);
}

export async function saveDecisionToBackend(decision: ARDecision): Promise<void> {
  await apiFetch('/api/decisions', {
    method: 'POST',
    body: JSON.stringify(decision)
  });
}

export async function fetchDecisionsFromBackend(): Promise<ARDecision[]> {
  const data = await apiFetch<{ decisions: ARDecision[] }>('/api/decisions');
  return Array.isArray(data.decisions) ? data.decisions : [];
}

export async function fetchAnalyticsTimeseries(baseMonthly: number, horizon: string): Promise<any[]> {
  const data = await apiFetch<{ points: any[] }>(`/api/analytics/timeseries?baseMonthly=${baseMonthly}&horizon=${encodeURIComponent(horizon)}`);
  return Array.isArray(data.points) ? data.points : [];
}

export async function saveSettingsToBackend(settings: Record<string, any>): Promise<void> {
  await apiFetch('/api/settings', {
    method: 'POST',
    body: JSON.stringify(settings)
  });
}

export async function fetchSettingsFromBackend(): Promise<Record<string, any> | null> {
  const data = await apiFetch<{ settings: Record<string, any> }>('/api/settings');
  return data?.settings || null;
}

export interface ProviderOutline {
  id: string;
  name: string;
  category?: string;
  access?: string;
  description?: string;
  docs_url?: string;
  fields?: { key: string; label: string; secret?: boolean; configured?: boolean }[];
  fetchMode?: 'implemented' | 'manual_or_licensed' | 'outlined';
  implemented?: boolean;
  enabled?: boolean;
  runtimeStatus?: string;
  missing_fields?: string[];
  access_note?: string;
}

export async function fetchProvidersFromBackend(): Promise<{ providers: ProviderOutline[]; stored: any }> {
  try {
    return await apiFetch<{ providers: ProviderOutline[]; stored: any }>('/api/providers');
  } catch {
    return { providers: [], stored: {} };
  }
}

export async function saveProviderConfigToBackend(payload: { id?: string; provider_id?: string; enabled: boolean; credentials?: Record<string,string> } | { providers: any[] }): Promise<void> {
  await apiFetch('/api/providers/save', { method: 'POST', body: JSON.stringify(payload) });
}

export async function testProviderFetch(providerId: string, query: string, credentials?: Record<string,string>): Promise<any> {
  return apiFetch('/api/providers/test', { method: 'POST', body: JSON.stringify({ provider_id: providerId, query, credentials: credentials || {} }) });
}

export async function fetchFromProvider(providerId: string | null, query: string, limit = 10): Promise<any> {
  if (providerId) {
    return apiFetch(`/api/providers/fetch?provider=${encodeURIComponent(providerId)}&q=${encodeURIComponent(query)}&limit=${limit}`);
  }
  return apiFetch(`/api/providers/fetch?q=${encodeURIComponent(query)}&limit=${limit}`);
}
