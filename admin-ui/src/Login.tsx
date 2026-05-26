import { useState } from 'react';

interface Props {
  onLogin: (token: string) => void;
}

export default function Login({ onLogin }: Props) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/login?token=${encodeURIComponent(token)}`, {
        method: 'POST',
      });
      if (!res.ok) {
        setError('Invalid token');
        return;
      }
      onLogin(token);
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🥧</div>
          <h1 className="font-display text-3xl text-pie-crust font-bold">PieStore Admin</h1>
          <p className="text-gray-400 mt-2">Enter your admin token to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Admin token..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pie-crust/50 focus:border-pie-crust"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-pie-crust hover:bg-pie-crust-dark text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
