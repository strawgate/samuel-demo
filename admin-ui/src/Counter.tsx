import type { AccessEvent } from './lib/api';
import { useEffect, useState } from 'react';

interface Props {
  total: number;
  recent: AccessEvent[];
}

export default function Counter({ total, recent }: Props) {
  const [displayIndex, setDisplayIndex] = useState(0);

  // Clamp displayIndex when recent array shrinks
  useEffect(() => {
    if (recent.length === 0) {
      setDisplayIndex(0);
    } else if (displayIndex >= recent.length) {
      setDisplayIndex(Math.max(0, recent.length - 1));
    }
  }, [recent.length, displayIndex]);

  // Rotate through recent events
  useEffect(() => {
    if (recent.length === 0) return;
    const interval = setInterval(() => {
      setDisplayIndex((i) => (i + 1) % Math.min(recent.length, 5));
    }, 2500);
    return () => clearInterval(interval);
  }, [recent.length]);

  const secretEmoji: Record<string, string> = {
    github: '🐙',
    aws: '☁️',
    cc: '💳',
  };

  const secretLabel: Record<string, string> = {
    github: 'GitHub Token',
    aws: 'AWS Key',
    cc: 'Credit Card',
  };

  const timeAgo = (ts: number) => {
    const seconds = Math.floor(Date.now() / 1000 - ts);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const currentEvent = recent[displayIndex];

  return (
    <div className="stat-card counter-glow">
      <h2 className="text-sm font-medium text-gray-400 mb-3">Total Secrets Leaked</h2>
      <div className="text-7xl font-bold text-pie-crust font-display text-center py-4">
        {total}
      </div>

      {/* Rotating recent event ticker */}
      {currentEvent && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2 text-sm animate-fade-in" key={displayIndex}>
            <span>{secretEmoji[currentEvent.secret_type] ?? '🔑'}</span>
            <span className="text-pie-crust font-medium">{currentEvent.name}</span>
            <span className="text-gray-400">leaked</span>
            <span className="text-white">{secretLabel[currentEvent.secret_type] ?? currentEvent.secret_type}</span>
            <span className="text-gray-500 ml-auto text-xs">{timeAgo(currentEvent.ts)}</span>
          </div>
          <div className="flex gap-1 mt-2 justify-center">
            {recent.slice(0, 5).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === displayIndex ? 'bg-pie-crust' : 'bg-gray-700'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
