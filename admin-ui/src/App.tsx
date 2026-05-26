import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

export default function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('piestore_admin_token'),
  );

  const handleLogin = (t: string) => {
    localStorage.setItem('piestore_admin_token', t);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem('piestore_admin_token');
    setToken(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard token={token} onLogout={handleLogout} />;
}
