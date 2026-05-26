export default function Architecture() {
  return (
    <div className="stat-card">
      <h2 className="text-lg font-bold text-white dark:text-white mb-4">🏗️ Architecture</h2>
      <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-6 overflow-x-auto">
        <pre className="text-xs text-gray-300 font-mono leading-relaxed whitespace-pre">
{`
┌─────────────────────────────────────────────────────────────────────┐
│                        Conference Audience                           │
│                    (phones/laptops at /chat)                         │
└─────────────┬───────────────────────────────────────┬───────────────┘
              │  POST /api/chat                        │ WS /ws/user
              ▼                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FastAPI Server (:8080)                        │
│                                                                      │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────┐ │
│  │  Chat Route  │   │ Admin Routes │   │   WebSocket Hub          │ │
│  │              │   │  /api/admin  │   │  /ws/admin  /ws/user     │ │
│  └──────┬───────┘   └──────┬───────┘   └──────────────────────────┘ │
│         │                   │                                        │
│  ┌──────▼──────────────────────────────────────────────────────────┐ │
│  │                    Pydantic AI Agent                             │ │
│  │                                                                  │ │
│  │   Mode 1 (Baseline)    Mode 2 (Guardrails)  Mode 3 (Sandboxed)  │ │
│  │   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐    │ │
│  │   │ get_env ✓   │      │ get_env ✓   │      │ get_env ✗   │    │ │
│  │   │ DLP off     │      │ DLP on      │      │ DLP on      │    │ │
│  │   └─────────────┘      └─────────────┘      └─────────────┘    │ │
│  │                                                                  │ │
│  │   Tools: search_products, get_product, lookup_ticket,            │ │
│  │          list_recent_orders, create_ticket, list_tickets         │ │
│  └──────┬───────────────────────────────────────────────────────────┘ │
│         │                                                            │
│  ┌──────▼───────────┐  ┌────────────────────┐  ┌─────────────────┐ │
│  │  Vertex AI        │  │  Secret Detection  │  │  App State      │ │
│  │  (Gemini 2.5)     │  │  (exact match +    │  │  (secrets,      │ │
│  │                   │  │   partial detect)   │  │   captures,     │ │
│  └───────────────────┘  └────────────────────┘  │   leaderboard)  │ │
│                                                   └─────────────────┘ │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │     PostgreSQL 16            │
                    │                              │
                    │  products │ tickets          │
                    │  customers │ orders          │
                    │  captures │ banned_names     │
                    └─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     Admin Dashboard (/admin)                          │
│                                                                      │
│  Mode Controls │ Live Counter │ Pie Chart │ Leaderboard │ Secrets   │
│  Portal Toggle │ Reset Demo   │ WS Live Updates                      │
└─────────────────────────────────────────────────────────────────────┘

Security Layers:
  Mode 1 → Agent has get_env, no output filtering → secrets leak freely
  Mode 2 → Agent has get_env, DLP scans output → blocked if secret detected
  Mode 3 → Agent lacks get_env entirely → no path to secrets even if jailbroken
`}
        </pre>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
          <div className="font-bold text-red-400 mb-1">Mode 1: Baseline</div>
          <p className="text-gray-400 text-xs">No protection. Agent freely leaks secrets when tricked.</p>
        </div>
        <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-3">
          <div className="font-bold text-amber-400 mb-1">Mode 2: Guardrails</div>
          <p className="text-gray-400 text-xs">DLP output scanning blocks responses containing secrets.</p>
        </div>
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
          <div className="font-bold text-green-400 mb-1">Mode 3: Sandboxed</div>
          <p className="text-gray-400 text-xs">Tool removed entirely. No path to secrets exists.</p>
        </div>
      </div>
    </div>
  );
}
