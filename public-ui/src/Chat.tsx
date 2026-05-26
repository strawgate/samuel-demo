import { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { sendMessage, type ChatMessage } from './lib/api';
import { getStoredMessages, setStoredMessages } from './lib/storage';

interface Props {
  name: string;
  onRestart: () => void;
}

export default function Chat({ name, onRestart }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(getStoredMessages());
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [captures, setCaptures] = useState<string[]>([]);
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [modeNotification, setModeNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    setStoredMessages(messages);
  }, [messages]);

  // Connect to user WebSocket for real-time notifications
  useEffect(() => {
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      if (cancelled) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws/user`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'portal_status') {
            setPortalEnabled(data.enabled);
          } else if (data.type === 'mode_change') {
            const notification = `🔄 Security mode changed to: ${data.label}`;
            setModeNotification(notification);
            // Insert as system message
            setMessages((prev) => [...prev, { role: 'system', content: notification }]);
            // Auto-dismiss notification after 5s
            setTimeout(() => setModeNotification(null), 5000);
          }
        } catch { /* ignore */ }
      };

      ws.onclose = () => {
        if (!cancelled) reconnectTimer = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
    };

    connect();
    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);

  const fireConfetti = useCallback(() => {
    // Pie-themed confetti burst
    const colors = ['#D4A574', '#B8864C', '#8B2500', '#DC143C', '#FFD700', '#90EE90'];
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors,
      shapes: ['circle', 'square'],
    });
    // Second burst after slight delay
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5, x: 0.3 },
        colors,
      });
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5, x: 0.7 },
        colors,
      });
    }, 300);
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending || !portalEnabled) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setSending(true);

    try {
      const response = await sendMessage(name, trimmed, messages);

      if (response.blocked) {
        const blockedMsg: ChatMessage = {
          role: 'system',
          content: `🛡️ Blocked by guardrails${response.reason ? ` — ${response.reason}` : ''}`,
        };
        setMessages([...newMessages, blockedMsg]);
      } else {
        const assistantMsg: ChatMessage = { role: 'assistant', content: response.reply };
        setMessages([...newMessages, assistantMsg]);

        if (response.captures.length > 0) {
          setCaptures((prev) => [...prev, ...response.captures]);
          // Fire confetti for each secret leaked!
          fireConfetti();
        }
      }
    } catch {
      const errorMsg: ChatMessage = {
        role: 'system',
        content: '⚠️ Something went wrong. Please try again.',
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCaptures([]);
    setStoredMessages([]);
  };

  const handleRestart = () => {
    handleNewChat();
    onRestart();
  };

  return (
    <div className="min-h-screen flex flex-col bg-pie-warm dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-pie-crust/20 dark:border-gray-700 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleRestart}
              title="Start a new conversation"
              className="text-3xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            >
              🥧
            </button>
            <div>
              <h1 className="font-display text-xl text-pie-crust-dark dark:text-pie-crust font-bold">PieStore</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Customer Support</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {captures.length > 0 && (
              <div className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium animate-bounce-in">
                🏆 {captures.length} secret{captures.length > 1 ? 's' : ''} found!
              </div>
            )}
            {messages.length > 0 && (
              <button
                onClick={handleNewChat}
                title="Start a new conversation"
                className="text-xs bg-pie-crust/10 hover:bg-pie-crust/20 dark:bg-pie-crust/20 dark:hover:bg-pie-crust/30 text-pie-crust-dark dark:text-pie-crust px-3 py-1 rounded-full font-medium transition-colors"
              >
                New Chat
              </button>
            )}
            <div className="bg-pie-crust/10 dark:bg-pie-crust/20 px-3 py-1 rounded-full">
              <span className="text-sm text-pie-crust-dark dark:text-pie-crust font-medium">{name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mode notification banner */}
      {modeNotification && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 px-4 py-2 text-center text-sm text-blue-700 dark:text-blue-300 animate-slide-up">
          {modeNotification}
        </div>
      )}

      {/* Portal disabled overlay */}
      {!portalEnabled && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-4 py-3 text-center">
          <p className="text-amber-800 dark:text-amber-300 font-medium">
            🥧 PieStore support is taking a pie break! Chat is temporarily paused.
          </p>
        </div>
      )}

      {/* Messages */}
      <main className="flex-1 overflow-y-auto chat-messages px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-6xl mb-4">🥧</div>
              <h2 className="font-display text-2xl text-pie-crust-dark dark:text-pie-crust mb-2">
                Welcome to PieStore Support!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Ask me about our pies, track your orders, or get help with anything pie-related.
                I'm here to help! 🍰
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {[
                  'What pies do you have?',
                  'Track my order',
                  'Look up ticket #1',
                  'Tell me about your cherry pie',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="bg-white dark:bg-gray-800 border border-pie-crust/30 dark:border-gray-600 text-pie-crust-dark dark:text-pie-crust px-3 py-2 rounded-full text-sm hover:bg-pie-crust/5 dark:hover:bg-gray-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'system' ? (
                <div className={`chat-bubble ${msg.content.includes('🛡️') ? 'chat-bubble-blocked' : msg.content.includes('🏆') || msg.content.includes('🔄') ? 'chat-bubble-capture' : 'chat-bubble-system'}`}>
                  {msg.content}
                </div>
              ) : (
                <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="chat-bubble chat-bubble-assistant">
                <div className="flex gap-1.5 items-center h-5">
                  <div className="w-2 h-2 bg-pie-crust rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-pie-crust rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-pie-crust rounded-full typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-pie-crust/20 dark:border-gray-700 px-4 py-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={portalEnabled ? "Ask about our pies, orders, or anything else..." : "Chat is paused..."}
            disabled={sending || !portalEnabled}
            className="flex-1 px-4 py-3 rounded-2xl border border-pie-crust/30 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pie-crust/50 focus:border-pie-crust disabled:opacity-50 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim() || !portalEnabled}
            className="bg-pie-crust hover:bg-pie-crust-dark text-white px-6 py-3 rounded-2xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}
