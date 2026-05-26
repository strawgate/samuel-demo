const API_BASE = '';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  reply: string;
  blocked: boolean;
  reason: string | null;
  captures: string[];
}

export async function sendMessage(
  name: string,
  message: string,
  messages: ChatMessage[],
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, message, messages }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  return res.json();
}

export async function getName(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/name`);
  if (!res.ok) throw new Error('Failed to get name');
  const data = await res.json();
  return data.name;
}

export async function getLeaderboard() {
  const res = await fetch(`${API_BASE}/api/leaderboard`);
  if (!res.ok) throw new Error('Failed to get leaderboard');
  return res.json();
}
