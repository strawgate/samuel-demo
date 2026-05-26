import { useState, useEffect, useRef, useCallback } from 'react';
import ModeButtons from './ModeButtons';
import Counter from './Counter';
import Leaderboard from './Leaderboard';
import PieChart from './PieChart';
import Architecture from './Architecture';
import {
  getAdminState,
  getLeaderboard,
  getStats,
  resetDemo,
  togglePortal,
  createAdminWebSocket,
  type AdminState,
  type LeaderboardEntry,
  type CaptureStats,
  type AccessEvent,
} from './lib/api';

interface Props {
  token: string;
  onLogout: () => void;
}

type Tab = 'dashboard' | 'architecture';

export default function Dashboard({ token, onLogout }: Props) {
  const [state, setState] = useState<AdminState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<CaptureStats | null>(null);
  const [recent, setRecent] = useState<AccessEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const wsRef = useRef<WebSocket | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [s, lb, st] = await Promise.all([
        getAdminState(token),
        getLeaderboard(token),
        getStats(token),
      ]);
      setState(s);
      setLeaderboard(lb.leaderboard);
      setStats(st);
      setRecent(s.recent);
      setError('');
    } catch (e) {
      if (e instanceof Error && e.message === 'Unauthorized') {
        onLogout();
      }
      setError('Failed to load state');
    }
  }, [token, onLogout]);

  // WebSocket connection
  useEffect(() => {
    const connect = () => {
      const ws = createAdminWebSocket(token);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        setTimeout(connect, 2000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'state') {
            setState((prev) => prev ? { ...prev, mode: data.mode, mode_label: data.mode_label, total_accesses: data.total_accesses, recent: data.recent } : prev);
            setRecent(data.recent || []);
          } else if (data.type === 'mode') {
            setState((prev) => prev ? { ...prev, mode: data.mode, mode_label: data.label } : prev);
          } else if (data.type === 'access') {
            setState((prev) => prev ? { ...prev, total_accesses: data.total } : prev);
            setRecent((prev) => [data.event, ...prev].slice(0, 10));
            getLeaderboard(token).then((lb) => setLeaderboard(lb.leaderboard)).catch(() => {});
            getStats(token).then((st) => setStats(st)).catch(() => {});
          } else if (data.type === 'reset') {
            refresh();
          } else if (data.type === 'portal') {
            setState((prev) => prev ? { ...prev, portal_enabled: data.enabled } : prev);
          }
        } catch { /* ignore parse errors */ }
      };
    };

    connect();
    return () => { wsRef.current?.close(); };
  }, [token, refresh]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleReset = async () => {
    if (confirm('Reset all captures? This cannot be undone.')) {
      await resetDemo(token);
      refresh();
    }
  };

  const handlePortalToggle = async () => {
    if (!state) return;
    const newEnabled = !state.portal_enabled;
    try {
      await togglePortal(token, newEnabled);
      setState((prev) => prev ? { ...prev, portal_enabled: newEnabled } : prev);
    } catch (e) {
      console.error('Failed to toggle portal:', e);
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🥧</div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🥧</span>
            <div>
              <h1 className="font-display text-3xl text-pie-crust font-bold">PieStore Admin</h1>
              <p className="text-gray-400 text-sm">Live Demo Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${connected ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
              {connected ? 'Live' : 'Disconnected'}
            </div>
            {/* Portal toggle */}
            <button
              onClick={handlePortalToggle}
              className={`text-sm px-3 py-1 rounded border transition-colors ${
                state.portal_enabled
                  ? 'bg-green-900/30 text-green-400 border-green-700 hover:bg-green-900/50'
                  : 'bg-red-900/30 text-red-400 border-red-700 hover:bg-red-900/50'
              }`}
              title={state.portal_enabled ? 'Click to disable user portal' : 'Click to enable user portal'}
            >
              {state.portal_enabled ? '🟢 Portal On' : '🔴 Portal Off'}
            </button>
            <button onClick={handleReset} className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded border border-gray-700 hover:border-gray-500 transition-colors">
              Reset Demo
            </button>
            <button onClick={onLogout} className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded border border-gray-700 hover:border-gray-500 transition-colors">
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'dashboard' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'architecture' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            🏗️ Architecture
          </button>
        </div>

        {activeTab === 'architecture' ? (
          <Architecture />
        ) : (
          <>
            {/* Mode Selector */}
            <ModeButtons currentMode={state.mode} token={token} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                <Counter total={state.total_accesses} recent={recent} />
                {stats && <PieChart stats={stats} />}
              </div>
              <div className="lg:col-span-2">
                <Leaderboard entries={leaderboard} />
              </div>
            </div>

            {/* Secrets reference */}
            <div className="stat-card">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Active Secrets (truncated)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(state.secrets).map(([key, val]) => (
                  <div key={key} className="font-mono text-xs">
                    <span className="text-gray-500">{key}:</span>{' '}
                    <span className="text-pie-crust">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
