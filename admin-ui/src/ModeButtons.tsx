import { setMode } from './lib/api';

interface Props {
  currentMode: number;
  token: string;
}

const MODES = [
  { id: 1, label: 'Baseline', emoji: '🔓', color: 'from-red-600 to-red-800', borderColor: 'border-red-500', description: 'No protection — secrets leak freely' },
  { id: 2, label: 'Guardrails', emoji: '🛡️', color: 'from-amber-600 to-amber-800', borderColor: 'border-amber-500', description: 'DLP blocks secret output' },
  { id: 3, label: 'Sandboxed', emoji: '🔒', color: 'from-green-600 to-green-800', borderColor: 'border-green-500', description: 'Tool removed — nothing to leak' },
];

export default function ModeButtons({ currentMode, token }: Props) {
  const handleClick = async (mode: number) => {
    try {
      await setMode(token, mode);
    } catch (e) {
      console.error('Failed to set mode:', e);
    }
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Protection Mode</h2>
        <span className="text-sm text-gray-400">Click to switch</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODES.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => handleClick(mode.id)}
              className={`mode-btn bg-gradient-to-br ${mode.color} ${mode.borderColor} ${
                isActive ? 'mode-btn-active ring-2 ring-white/30' : 'opacity-60 hover:opacity-80 border-transparent'
              }`}
            >
              <div className="text-3xl mb-1">{mode.emoji}</div>
              <div className="text-white font-bold">{mode.label}</div>
              <div className="text-white/70 text-xs mt-1">{mode.description}</div>
              {isActive && (
                <div className="mt-2 text-xs bg-white/20 rounded-full px-2 py-0.5 inline-block">
                  ACTIVE
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
