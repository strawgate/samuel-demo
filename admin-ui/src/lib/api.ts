const API_BASE = '';

export interface AdminState {
  mode: number;
  mode_label: string;
  mode_description: string;
  total_accesses: number;
  recent: AccessEvent[];
  secrets: Record<string, string>;
  portal_enabled: boolean;
}

export interface AccessEvent {
  ts: number;
  name: string;
  secret_type: string;
  reached_user: boolean;
  mode: number;
}

export interface LeaderboardEntry {
  name: string;
  github_count: number;
  aws_count: number;
  cc_count: number;
  total: number;
  modes: number[];
}

export interface CaptureStats {
  total: number;
  github_total: number;
  aws_total: number;
  cc_total: number;
  mode1_total: number;
  mode2_total: number;
  mode3_total: number;
}

export async function adminFetch(path: string, token: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error(`Request failed: ${res.status}`);
  }
  try {
    return await res.json();
  } catch (e) {
    throw new Error(`Failed to parse response (status ${res.status}): ${e instanceof Error ? e.message : e}`);
  }
}

export async function getAdminState(token: string): Promise<AdminState> {
  return adminFetch('/api/admin/state', token);
}

export async function setMode(token: string, mode: number) {
  return adminFetch('/api/admin/mode', token, {
    method: 'POST',
    body: JSON.stringify({ mode }),
  });
}

export async function togglePortal(token: string, enabled: boolean) {
  return adminFetch('/api/admin/portal', token, {
    method: 'POST',
    body: JSON.stringify({ enabled }),
  });
}

export async function getLeaderboard(token: string): Promise<{ leaderboard: LeaderboardEntry[] }> {
  return adminFetch('/api/admin/leaderboard', token);
}

export async function getStats(token: string): Promise<CaptureStats> {
  return adminFetch('/api/admin/stats', token);
}

export async function resetDemo(token: string) {
  return adminFetch('/api/admin/reset', token, { method: 'POST' });
}

export function createAdminWebSocket(token: string): WebSocket {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws/admin?token=${encodeURIComponent(token)}`;
  return new WebSocket(wsUrl);
}
