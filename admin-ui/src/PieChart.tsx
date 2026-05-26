import { PieChart as RechartsPie, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import type { CaptureStats } from './lib/api';

interface Props {
  stats: CaptureStats;
}

// Colors inspired by pie fillings
const COLORS = {
  github: '#4CAF50',  // apple green
  aws: '#FF9800',     // pumpkin orange
  cc: '#DC143C',      // cherry red
};

const MODE_COLORS = {
  mode1: '#EF4444',   // red for baseline
  mode2: '#F59E0B',   // amber for guardrails
  mode3: '#10B981',   // green for scoped
};

export default function PieChart({ stats }: Props) {
  const secretData = [
    { name: 'GitHub Token', value: stats.github_total, emoji: '🐙' },
    { name: 'AWS Keys', value: stats.aws_total, emoji: '☁️' },
    { name: 'Credit Card', value: stats.cc_total, emoji: '💳' },
  ].filter((d) => d.value > 0);

  const modeData = [
    { name: 'Baseline', value: stats.mode1_total },
    { name: 'Guardrails', value: stats.mode2_total },
    { name: 'Sandboxed', value: stats.mode3_total },
  ].filter((d) => d.value > 0);

  const hasData = stats.total > 0;

  if (!hasData) {
    return (
      <div className="stat-card">
        <h2 className="text-sm font-medium text-gray-400 mb-3">Secret Pie 🥧</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-5xl mb-2 opacity-30">🥧</div>
            <p className="text-gray-500 text-sm">No slices yet...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card pie-animate">
      <h2 className="text-sm font-medium text-gray-400 mb-3">Secret Pie 🥧</h2>

      {/* Main pie - by secret type */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPie>
            <Pie
              data={secretData}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={2}
              stroke="#1a1a2e"
            >
              {secretData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.name === 'GitHub Token' ? COLORS.github :
                    entry.name === 'AWS Keys' ? COLORS.aws : COLORS.cc
                  }
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#d1d5db' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend
              iconType="circle"
              formatter={(value) => <span className="text-gray-300 text-xs">{value}</span>}
            />
          </RechartsPie>
        </ResponsiveContainer>
      </div>

      {/* Mode breakdown bar */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-400 mb-2">By protection mode:</p>
        <div className="flex rounded-full overflow-hidden h-3 bg-gray-800">
          {modeData.map((d) => {
            const pct = (d.value / stats.total) * 100;
            const color = d.name === 'Baseline' ? MODE_COLORS.mode1 :
                         d.name === 'Guardrails' ? MODE_COLORS.mode2 : MODE_COLORS.mode3;
            return pct > 0 ? (
              <div
                key={d.name}
                className="transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
                title={`${d.name}: ${d.value} (${Math.round(pct)}%)`}
              />
            ) : null;
          })}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>🔓 {stats.mode1_total}</span>
          <span>🛡️ {stats.mode2_total}</span>
          <span>🔒 {stats.mode3_total}</span>
        </div>
      </div>
    </div>
  );
}
