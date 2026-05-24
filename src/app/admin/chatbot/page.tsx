"use client";

import { useState, useEffect } from "react";
import { MessageSquare, ExternalLink, Clock, Search, ChevronDown } from "lucide-react";

interface ChatbotConversation {
  id: string;
  visitorId: string;
  messages: {
    role: "user" | "bot";
    text: string;
    timestamp: string;
  }[];
  startedAt: string;
  endedAt?: string;
  status: "active" | "closed" | "abandoned";
  page?: string;
  country?: string;
}

const defaultConversations: ChatbotConversation[] = [
  {
    id: "conv_001",
    visitorId: "vis_af3k",
    startedAt: "2026-05-24T10:15:00Z",
    endedAt: "2026-05-24T10:22:00Z",
    status: "closed",
    page: "/catalog",
    country: "Moldova",
    messages: [
      { role: "user", text: "Bună! Aveți laptopuri MacBook Pro?", timestamp: "2026-05-24T10:15:00Z" },
      { role: "bot", text: "Bună! Da, avem câteva modele MacBook Pro în stoc. Doriți să vedeți selecția?", timestamp: "2026-05-24T10:15:30Z" },
      { role: "user", text: "Da, mă interesează unul cu ecran de 14 inch", timestamp: "2026-05-24T10:16:00Z" },
      { role: "bot", text: "Am MacBook Pro 14\" M3 Pro cu 18GB RAM — 42,900 MDL. Doriți detalii?", timestamp: "2026-05-24T10:17:00Z" },
      { role: "user", text: "Care e diferența între M3 Pro și M3 Max?", timestamp: "2026-05-24T10:18:00Z" },
      { role: "bot", text: "M3 Max are CPU mai puternic și mai mult RAM (36GB vs 18GB). Este destinat pentru sarcini profesionale precum video editing 8K. Pentru uz general, M3 Pro este suficient și mai avantajos.", timestamp: "2026-05-24T10:19:00Z" },
      { role: "user", text: "Perfect, mulțumesc!", timestamp: "2026-05-24T10:22:00Z" },
    ],
  },
  {
    id: "conv_002",
    visitorId: "vis_bx92",
    startedAt: "2026-05-24T09:45:00Z",
    endedAt: "2026-05-24T09:51:00Z",
    status: "closed",
    page: "/",
    country: "România",
    messages: [
      { role: "user", text: "Cum pot plăti online?", timestamp: "2026-05-24T09:45:00Z" },
      { role: "bot", text: "Acceptăm Visa, MasterCard și transfer bancar. Plata online este securizată prin SSL.", timestamp: "2026-05-24T09:45:40Z" },
      { role: "user", text: "Livrare în România faceți?", timestamp: "2026-05-24T09:46:30Z" },
      { role: "bot", text: "Momentan livrăm doar pe teritoriul Republicii Moldova. În curând vom extinde livrările.", timestamp: "2026-05-24T09:47:00Z" },
    ],
  },
  {
    id: "conv_003",
    visitorId: "vis_cq11",
    startedAt: "2026-05-23T18:30:00Z",
    status: "active",
    page: "/warranty",
    country: "Moldova",
    messages: [
      { role: "user", text: "Ce garanție oferiți?", timestamp: "2026-05-23T18:30:00Z" },
      { role: "bot", text: "Produsele noi au 12 luni garanție, iar cele refurbished 6 luni. Garanția acoperă defectele de fabricație.", timestamp: "2026-05-23T18:30:40Z" },
    ],
  },
  {
    id: "conv_004",
    visitorId: "vis_dp44",
    startedAt: "2026-05-22T14:00:00Z",
    status: "abandoned",
    page: "/checkout",
    country: "Moldova",
    messages: [
      { role: "user", text: "Am o problemă cu cardul meu", timestamp: "2026-05-22T14:00:00Z" },
      { role: "bot", text: "Pentru probleme cu plata, contactați banca emitentă sau încercați altă metodă de plată.", timestamp: "2026-05-22T14:01:00Z" },
    ],
  },
];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400",
  abandoned: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const statusLabels: Record<string, string> = {
  active: "Activă",
  closed: "Închisă",
  abandoned: "Abandonată",
};

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("ro-MD", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatDuration(start: string, end?: string): string {
  if (!end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const min = Math.floor(ms / 60000);
  return `${min} min`;
}

function loadConversations(): ChatbotConversation[] {
  if (typeof window === "undefined") return defaultConversations;
  const s = localStorage.getItem("wi_chatbot_conversations");
  if (s) { try { return JSON.parse(s); } catch {} }
  localStorage.setItem("wi_chatbot_conversations", JSON.stringify(defaultConversations));
  return defaultConversations;
}

export default function AdminChatbotPage() {
  const [conversations, setConversations] = useState<ChatbotConversation[]>([]);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("toate");
  const [selected, setSelected] = useState<ChatbotConversation | null>(null);

  useEffect(() => {
    setConversations(loadConversations());
    setMounted(true);
  }, []);

  const filtered = conversations.filter((c) => {
    const matchSearch =
      !search ||
      c.visitorId.toLowerCase().includes(search.toLowerCase()) ||
      c.messages.some((m) => m.text.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "toate" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts: Record<string, number> = { toate: conversations.length };
  ["active", "closed", "abandoned"].forEach((s) => {
    counts[s] = conversations.filter((c) => c.status === s).length;
  });

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-primary" size={28} />
            Chatbot — Conversații
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Vizualizați istoricul conversațiilor chatbot Elfsight.{" "}
            <a
              href="https://elfsight.com/chatbot/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Deschisă platforma Elfsight <ExternalLink size={12} />
            </a>
          </p>
        </div>
        <div className="text-sm text-slate-500">
          Total: <strong>{conversations.length}</strong> conversații
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
          <MessageSquare size={16} className="text-blue-500" />
          Configurare Elfsight Chatbot
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
          Pentru a sincroniza conversațiile cu sistemul Western Import, adăugați în{" "}
          <strong>Settings → Widget → Custom Code</strong> din panelul Elfsight următorul webhook:
        </p>
        <code className="block bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3 text-xs font-mono text-blue-900 dark:text-blue-200 overflow-x-auto">
          {`// Western Import — Elfsight webhook\nwindow.WESTERN_CHATBOT_WEBHOOK = "${typeof window !== "undefined" ? window.location.origin : ""}/api/chatbot/webhook";`}
        </code>
        <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
          Sau contactați echipa Elfsight pentru exportarea periodică a conversațiilor în format CSV/JSON.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Caută în conversații..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          {["toate", "active", "closed", "abandoned"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === f
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {f === "toate" ? "Toate" : statusLabels[f]} ({counts[f] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Conversations list */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Vizitator</th>
                <th className="px-4 py-3 font-medium">Pagină</th>
                <th className="px-4 py-3 font-medium">Mesaje</th>
                <th className="px-4 py-3 font-medium">Durată</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Acțiune</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((conv) => (
                <tr
                  key={conv.id}
                  className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{conv.visitorId}</div>
                    <div className="text-xs text-slate-400">{conv.country}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{conv.page || "—"}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{conv.messages.length}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                    <Clock size={12} className="inline mr-1" />
                    {formatDuration(conv.startedAt, conv.endedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[conv.status]}`}>
                      {statusLabels[conv.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatTime(conv.startedAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(conv)}
                      className="text-primary hover:underline text-xs font-medium"
                    >
                      Vezi conversația
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Nicio conversație găsită
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversation modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelected(null)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="font-bold text-slate-800 dark:text-white">Conversație {selected.visitorId}</h2>
                <p className="text-xs text-slate-500">
                  {formatTime(selected.startedAt)} · {selected.page || "pagina principală"} · {selected.country}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {selected.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none"
                    }`}
                  >
                    <div className="font-medium text-xs opacity-60 mb-1">
                      {msg.role === "user" ? "Vizitator" : "Chatbot"}
                    </div>
                    {msg.text}
                    <div className={`text-xs mt-1 ${msg.role === "user" ? "text-white/60" : "text-slate-400"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString("ro-MD", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400 flex items-center gap-4">
              <span>Status: <strong className={selected.status === "active" ? "text-green-600" : selected.status === "abandoned" ? "text-amber-600" : "text-slate-500"}>{statusLabels[selected.status]}</strong></span>
              <span><Clock size={12} className="inline" /> Durată: <strong>{formatDuration(selected.startedAt, selected.endedAt)}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}