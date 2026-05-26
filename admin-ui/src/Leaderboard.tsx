import type { LeaderboardEntry } from './lib/api';

interface Props {
  entries: LeaderboardEntry[];
}

export default function Leaderboard({ entries }: Props) {
  const modeColors: Record<number, string> = {
    1: 'bg-red-900/30 text-red-400 border-red-800',
    2: 'bg-amber-900/30 text-amber-400 border-amber-800',
    3: 'bg-green-900/30 text-green-400 border-green-800',
  };

  return (
    <div className="stat-card h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">🏆 Leaderboard</h2>
        <span className="text-sm text-gray-400">{entries.length} hacker{entries.length !== 1 ? 's' : ''}</span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-400">No captures yet. Waiting for the audience...</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[500px]">
          <table className="w-full">
            <thead className="text-xs text-gray-400 uppercase border-b border-gray-800">
              <tr>
                <th className="py-2 text-left">#</th>
                <th className="py-2 text-left">Hacker</th>
                <th className="py-2 text-center">🐙</th>
                <th className="py-2 text-center">☁️</th>
                <th className="py-2 text-center">💳</th>
                <th className="py-2 text-center">Total</th>
                <th className="py-2 text-right">Modes</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.name}
                  className="leaderboard-row border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <td className="py-3 text-gray-400 font-mono text-sm">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </td>
                  <td className="py-3">
                    <span className="text-pie-crust font-medium">{entry.name}</span>
                  </td>
                  <td className="py-3 text-center font-mono text-sm">
                    {entry.github_count > 0 ? <span className="text-white">{entry.github_count}</span> : <span className="text-gray-700">—</span>}
                  </td>
                  <td className="py-3 text-center font-mono text-sm">
                    {entry.aws_count > 0 ? <span className="text-white">{entry.aws_count}</span> : <span className="text-gray-700">—</span>}
                  </td>
                  <td className="py-3 text-center font-mono text-sm">
                    {entry.cc_count > 0 ? <span className="text-white">{entry.cc_count}</span> : <span className="text-gray-700">—</span>}
                  </td>
                  <td className="py-3 text-center">
                    <span className="bg-pie-crust/20 text-pie-crust px-2 py-0.5 rounded-full text-sm font-bold">
                      {entry.total}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {entry.modes?.map((m) => (
                        <span key={m} className={`text-xs px-1.5 py-0.5 rounded border ${modeColors[m] ?? ''}`}>
                          M{m}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
