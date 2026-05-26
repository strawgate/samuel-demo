import { useState, useEffect } from 'react';
import Chat from './Chat';
import { getName } from './lib/api';
import { getStoredName, setStoredName, clearStorage } from './lib/storage';

export default function App() {
  const [name, setName] = useState<string | null>(getStoredName());
  const [loading, setLoading] = useState(!name);
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('piestore_dark') === 'true' ||
      (!localStorage.getItem('piestore_dark') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('piestore_dark', String(dark));
  }, [dark]);

  useEffect(() => {
    if (!name) {
      getName()
        .then((n) => {
          setStoredName(n);
          setName(n);
          setLoading(false);
        })
        .catch(() => {
          const fallback = `visitor-${Math.random().toString(36).slice(2, 8)}`;
          setStoredName(fallback);
          setName(fallback);
          setLoading(false);
        });
    }
  }, [name]);

  const handleRestart = () => {
    clearStorage();
    // Get a fresh name
    getName()
      .then((n) => {
        setStoredName(n);
        setName(n);
      })
      .catch(() => {
        const fallback = `visitor-${Math.random().toString(36).slice(2, 8)}`;
        setStoredName(fallback);
        setName(fallback);
      });
  };

  if (loading || !name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pie-warm dark:bg-gray-900">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">🥧</div>
          <p className="text-pie-crust-dark dark:text-pie-crust font-display text-xl">Loading PieStore...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Dark mode toggle */}
      <button
        onClick={() => setDark(!dark)}
        className="fixed top-3 right-3 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow-sm hover:scale-110 transition-transform"
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? '☀️' : '🌙'}
      </button>
      <Chat name={name} onRestart={handleRestart} />
    </div>
  );
}
