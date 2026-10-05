import { useState, useEffect } from "react";
import { MapPin, Copy, Bell, Search, RefreshCw, CheckCircle2, X, Mail, Repeat } from "lucide-react";
import { CALENDAR_EVENTS, AUDIT_LOG, TEMPLATES } from "../mock/mockData";
import { useTasks, isDone, isOverdue, toLocalInput } from "./tarefas/context/TaskContext";
import { genId, type AppSubtask } from "./tarefas/utils/subtaskTree";

const freshCopy = (nodes: AppSubtask[]): AppSubtask[] =>
  nodes.map(n => ({ ...n, id: genId(), completed: false, children: freshCopy(n.children) }));



// ── GPS & Geofencing ──────────────────────────────────────────────
export function GpsSection({ isDark }: { isDark: boolean }) {
  const [simulating, setSimulating] = useState(false);
  const [distance, setDistance] = useState(450);
  const [notif, setNotif] = useState(false);
  const [timerRef] = useState<{ id: ReturnType<typeof setInterval> | null }>({ id: null });
  useEffect(() => () => { if (timerRef.id) clearInterval(timerRef.id); }, [timerRef]);

  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";

  const simulate = () => {
    if (simulating) {
      setSimulating(false);
      if (timerRef.id) clearInterval(timerRef.id);
      setDistance(450);
      setNotif(false);
      return;
    }
    setSimulating(true);
    let d = 450;
    timerRef.id = setInterval(() => {
      d -= 25;
      setDistance(d);
      if (d <= 50) {
        setNotif(true);
        if (timerRef.id) clearInterval(timerRef.id);
        setSimulating(false);
      }
    }, 300);
  };

  const pct = Math.max(0, Math.min(100, ((450 - distance) / 450) * 100));

  return (
    <div className="space-y-3">
      {/* Notification */}
      {notif && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2 animate-pulse">
          <MapPin size={16} className="text-emerald-400 flex-none mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-emerald-400">Alerta de Proximidade</p>
            <p className="text-xs text-emerald-300 mt-0.5">Você está a 50m do Supermercado. Não se esqueça: <strong>"Comprar insumos para o laboratório"</strong></p>
            <div className="flex gap-2 mt-2">
              <button className="text-[10px] bg-emerald-500 text-white px-2 py-1 rounded-lg">Abrir Tarefa</button>
              <button className="text-[10px] border border-emerald-500/40 text-emerald-400 px-2 py-1 rounded-lg">Dispensar</button>
            </div>
          </div>
          <button onClick={() => setNotif(false)}><X size={14} className="text-slate-400" /></button>
        </div>
      )}

      {/* Mini-map */}
      <div className={`${card} border rounded-xl overflow-hidden`}>
        <div className="relative h-40 bg-gradient-to-br from-slate-700 to-slate-800">
          {/* Grid lines */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute top-0 bottom-0 border-l border-slate-600/30" style={{ left: `${i * 20}%` }} />
          ))}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute left-0 right-0 border-t border-slate-600/30" style={{ top: `${i * 25}%` }} />
          ))}
          {/* Roads */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-600/50 -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-slate-600/50 -translate-x-1/2" />
          {/* Geofence radius */}
          <div
            className="absolute rounded-full border-2 border-emerald-400/50 bg-emerald-400/10 transition-all duration-300"
            style={{ width: 80, height: 80, top: "50%", left: "70%", transform: "translate(-50%,-50%)" }}
          />
          {/* Destination */}
          <div className="absolute" style={{ top: "45%", left: "67%", transform: "translate(-50%,-50%)" }}>
            <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg" />
            <span className="text-[10px] text-emerald-300 font-medium whitespace-nowrap">Supermercado</span>
          </div>
          {/* User dot */}
          <div
            className="absolute transition-all duration-300"
            style={{ top: "50%", left: `${10 + pct * 0.57}%`, transform: "translate(-50%,-50%)" }}
          >
            <div className="w-5 h-5 rounded-full bg-indigo-500 border-2 border-white shadow-xl animate-pulse" />
            <span className="text-[10px] text-indigo-300 font-medium">Você</span>
          </div>
          {/* Distance badge */}
          <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="text-xs text-white font-mono">{Math.max(0, distance)}m restantes</span>
          </div>
        </div>
        <div className="px-3 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <p className={`text-xs font-medium ${text}`}>Raio de Geofencing: 200m</p>
            <span className="text-[10px] font-mono text-emerald-400">{Math.round(pct)}% percorrido</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2.5">
            <div className="h-full bg-[#4F6BED] rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }} />
          </div>
          <button
            onClick={simulate}
            className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
              simulating
                ? "bg-rose-500/20 border border-rose-500/30 text-rose-400"
                : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
            }`}
          >
            {simulating ? "⏹ Parar Simulação" : "▶ Simular Deslocamento para o Supermercado"}
          </button>
        </div>
      </div>

      {/* Registered locations */}
      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"} mb-2`}>Locais Cadastrados</p>
        {[
          { name: "Supermercado Extra", task: "Comprar insumos para o laboratório", dist: "0.45km" },
          { name: "Cartório 3º Ofício", task: "Reconhecer firma do contrato", dist: "1.2km" },
          { name: "Escritório TI", task: "Corrigir vazamento de memória no build", dist: "0.8km" },
        ].map((loc, i) => (
          <div key={i} className="flex items-center gap-2 py-2 border-b border-slate-700/30 last:border-0">
            <MapPin size={12} className="text-emerald-400 flex-none" />
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${text} truncate`}>{loc.name}</p>
              <p className={`text-[10px] ${sub} truncate`}>→ {loc.task}</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{loc.dist}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Duplication & Templates ───────────────────────────────────────
export function DupSection({ isDark }: { isDark: boolean }) {
  const [duplicated, setDuplicated] = useState<string | null>(null);
  const { tasks, createTask } = useTasks();
  const duplicate = (id: string) => {
    const t = tasks.find(x => x.id === id)!;
    const { id: _id, updatedAt: _u, syncPending: _s, ...data } = t;
    createTask({
      ...data,
      title: `${t.title} (cópia)`,
      status: "Pendente",
      dueDate: toLocalInput(new Date(Date.now() + 7 * 864e5)),
      subtasks: freshCopy(t.subtasks),
    });
    setDuplicated(t.title);
  };
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className="space-y-3">
      {duplicated && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <p className="text-xs text-emerald-300">Cópia de "{duplicated}" criada em Tarefas, com prazo daqui a 7 dias.</p>
        </div>
      )}
      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2`}>Duplicar Tarefa com Subtarefas</p>
        {tasks.filter(t => !isDone(t)).map(task => (
          <div key={task.id} className="flex items-center gap-2 py-2 border-b border-slate-700/30 last:border-0">
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${text} truncate`}>{task.title}</p>
              <p className={`text-[10px] ${sub}`}>{task.subtasks.length} subtarefas • {task.effort}</p>
            </div>
            <button
              onClick={() => duplicate(task.id)}
              className="flex items-center gap-1 text-[10px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 px-2 py-1 rounded-lg hover:bg-indigo-500/30 transition-colors flex-none"
            >
              <Copy size={10} /> Duplicar
            </button>
          </div>
        ))}
      </div>

      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2`}>Templates de Rotina</p>
        {TEMPLATES.map(tpl => (
          <div key={tpl.id} className="flex items-center gap-3 py-2 border-b border-slate-700/30 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-none">
              <Copy size={13} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${text}`}>{tpl.name}</p>
              <p className={`text-[10px] ${sub}`}>{tpl.description}</p>
              <p className="text-[10px] text-indigo-400">{tpl.tasks} tarefas pré-configuradas</p>
            </div>
            <button className="text-[10px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 px-2 py-1 rounded-lg flex-none">
              Usar
            </button>
          </div>
        ))}
        <button className="w-full mt-2 py-2 rounded-lg text-xs text-slate-400 border border-dashed border-slate-600 flex items-center justify-center gap-1.5 hover:border-indigo-500 hover:text-indigo-400 transition-colors">
          <Copy size={11} /> Salvar Seleção como Template
        </button>
      </div>
    </div>
  );
}

// ── Calendar ──────────────────────────────────────────────────────
export function CalSection({ isDark }: { isDark: boolean }) {
  const [syncing, setSyncing] = useState(false);
  const [syncActive, setSyncActive] = useState(true);
  const [lastSync] = useState("12/09/2025 às 08:34");
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";

  const forceSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className={`${card} border rounded-xl p-3`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className={`text-xs font-semibold ${text}`}>Google Calendar</p>
            <p className={`text-[10px] ${sub}`}>Último sync: {lastSync}</p>
          </div>
          <button
            onClick={() => setSyncActive(s => !s)}
            className={`relative w-10 h-5 rounded-full transition-colors ${syncActive ? "bg-emerald-500" : "bg-slate-600"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${syncActive ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
        <button
          onClick={forceSync}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-colors"
        >
          <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Sincronizando..." : "Forçar Sincronização Agora"}
        </button>
      </div>

      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2`}>Próximos Eventos Espelhados</p>
        {CALENDAR_EVENTS.map(ev => (
          <div key={ev.id} className="flex items-center gap-3 py-2 border-b border-slate-700/30 last:border-0">
            <div className={`w-2 h-8 rounded-full flex-none ${ev.synced ? "bg-blue-400" : "bg-slate-600"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${text} truncate`}>{ev.title}</p>
              <p className={`text-[10px] ${sub}`}>{ev.date} • {ev.time}</p>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-none ${ev.synced ? "bg-blue-500/20 text-blue-400" : "bg-slate-600/50 text-slate-400"}`}>
              {ev.synced ? "Sync" : "Pendente"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Deadline Alerts ───────────────────────────────────────────────
export function AlertsSection({ isDark }: { isDark: boolean }) {
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const { tasks } = useTasks();
  // Régua fixa de níveis; a lista abaixo usa o nível de cada tarefa real
  const urgencyLevels = [
    { label: "7 dias", maxH: 168, color: "bg-emerald-500", text: "text-emerald-400", pct: 20 },
    { label: "3 dias", maxH: 72, color: "bg-amber-400", text: "text-amber-400", pct: 40 },
    { label: "1 dia", maxH: 24, color: "bg-orange-500", text: "text-orange-400", pct: 60 },
    { label: "2 horas", maxH: 2, color: "bg-rose-500", text: "text-rose-400", pct: 80 },
    { label: "30 min", maxH: 0.5, color: "bg-rose-700 animate-pulse", text: "text-rose-500", pct: 100 },
  ];
  const levelOf = (h: number) => [...urgencyLevels].reverse().find(u => h <= u.maxH);
  const fmtLeft = (h: number) => h < 0 ? "Atrasada" : h < 1 ? `${Math.round(h * 60)} min` : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} dias`;
  const upcoming = tasks
    .filter(t => !isDone(t))
    .map(t => ({ t, h: (new Date(t.dueDate).getTime() - Date.now()) / 36e5 }))
    .filter(x => x.h <= 168)
    .sort((a, b) => a.h - b.h);
  const critical = upcoming.filter(x => x.h >= 0 && x.h <= 24).length;
  const late = tasks.filter(isOverdue).length;
  const atRisk = upcoming.filter(x => x.h > 24 && x.h <= 72).length;

  return (
    <div className="space-y-3">
      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-3 flex items-center gap-1.5`}>
          <Bell size={12} className="text-orange-400" /> Régua de Urgência de Prazos
        </p>
        <div className="space-y-2">
          {urgencyLevels.map((u, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-none ${u.color}`} />
              <div className="flex-1">
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${u.color}`} style={{ width: `${u.pct}%` }} />
                </div>
              </div>
              <span className={`text-[10px] font-mono ${u.text} w-12 text-right flex-none`}>{u.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {upcoming.length === 0 && <p className="text-xs text-slate-500 text-center py-2">Nenhuma tarefa vence nos próximos 7 dias.</p>}
        {upcoming.map(({ t, h }) => {
          const u = levelOf(h) ?? urgencyLevels[4];
          return (
            <div key={t.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${h <= 2 ? "border-rose-500/30 bg-rose-500/10" : h <= 24 ? "border-orange-500/20 bg-orange-500/5" : isDark ? "border-slate-700/50 bg-slate-800/40" : "border-slate-200 bg-white"}`}>
              <div className={`w-2 h-2 rounded-full flex-none ${u.color}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${text} truncate`}>{t.title}</p>
              </div>
              <span className={`text-[10px] font-mono ${u.text} flex-none whitespace-nowrap`}>{fmtLeft(h)}</span>
            </div>
          );
        })}
      </div>

      <div className={`${card} border border-rose-500/20 rounded-xl p-3`}>
        <p className="text-xs font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
          <Bell size={11} /> Resumo Diário — Pronto para Envio
        </p>
        <p className="text-xs text-slate-400 mb-2">{critical} vencem em 24h • {late} atrasada{late !== 1 ? "s" : ""} • {atRisk} em risco</p>
        <button className="w-full py-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium hover:bg-rose-500/30 transition-colors">
          📧 Disparar Alerta por E-mail / Push
        </button>
      </div>
    </div>
  );
}

// ── Search & Audit ────────────────────────────────────────────────
export function SearchSection({ isDark }: { isDark: boolean }) {
  const [q, setQ] = useState("");
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";

  const index: Record<string, string[]> = {
    "relatrio": ["Fechar o relatório semanal de horas", "Finalizar relatório de Estatística Aplicada"],
    "treino": ["Treino de perna — Leg day completo"],
    "prova": ["Estudar Árvores AVL para a prova de quarta"],
    "fatura": ["Pagar fatura do Nubank antes do vencimento"],
    "pastas": ["Organizar pastas antigas de downloads"],
  };

  const results = q.length > 2
    ? Object.entries(index)
        .filter(([k]) => k.includes(q.toLowerCase().replace("ó", "o").replace("ç", "c")))
        .flatMap(([, v]) => v)
    : [];

  return (
    <div className="space-y-3">
      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2 flex items-center gap-1.5`}>
          <Search size={12} className="text-cyan-400" /> Busca de Tarefas
        </p>
        <div className={`flex items-center gap-2 ${isDark ? "bg-slate-700/60" : "bg-slate-100"} border ${isDark ? "border-slate-600" : "border-slate-200"} rounded-lg px-3 py-2`}>
          <Search size={13} className={sub} />
          <input
            className={`flex-1 bg-transparent text-sm ${text} placeholder-slate-500 outline-none`}
            placeholder='Tente "relatrio" ou "treino"...'
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        {q.length > 2 && (
          <div className="mt-2 space-y-1">
            {results.length > 0 ? results.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 px-2 py-1.5 ${isDark ? "bg-slate-700/50" : "bg-slate-100"} rounded-lg`}>
                <CheckCircle2 size={11} className="text-cyan-400 flex-none" />
                <span className={`text-xs ${text}`}>{r}</span>
              </div>
            )) : (
              <p className="text-xs text-slate-500 text-center py-2">Nenhum resultado encontrado</p>
            )}
          </div>
        )}
      </div>

      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2`}>Feed de Auditoria Cronológica</p>
        <div className="space-y-2">
          {AUDIT_LOG.map(entry => (
            <div key={entry.id} className="flex gap-2">
              <div className="w-1 flex-none rounded-full bg-indigo-500/40 self-stretch" />
              <div className="flex-1">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className={`text-[10px] font-semibold ${text}`}>{entry.user}</span>
                  <span className="text-[10px] text-slate-500">{entry.action}</span>
                </div>
                <p className="text-[10px] text-slate-400">{entry.detail}</p>
                <p className="text-[9px] text-slate-600 font-mono">{entry.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Recurrence & Email ────────────────────────────────────────────
export function RecurSection({ isDark }: { isDark: boolean }) {
  const [period, setPeriod] = useState("Semanal");
  const [stopAfter, setStopAfter] = useState("12");
  const [converted, setConverted] = useState(false);
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const inputCls = `w-full bg-slate-700/50 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-indigo-500`;

  return (
    <div className="space-y-3">
      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-3 flex items-center gap-1.5`}>
          <Repeat size={12} className="text-indigo-400" /> Configurador de Tarefas Recorrentes
        </p>
        <div className="space-y-3">
          <div>
            <p className={`text-[10px] ${sub} mb-1`}>Periodicidade</p>
            <div className="grid grid-cols-3 gap-1.5">
              {["Diária", "Semanal", "Mensal"].map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`py-1.5 rounded-lg text-xs border transition-all ${period === p ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-600 text-slate-400"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className={`text-[10px] ${sub} mb-1`}>Encerrar após</p>
              <input className={inputCls} value={stopAfter} onChange={e => setStopAfter(e.target.value)} placeholder="12" />
            </div>
            <div>
              <p className={`text-[10px] ${sub} mb-1`}>Unidade</p>
              <select className={inputCls}><option>ocorrências</option><option>semanas</option></select>
            </div>
          </div>
          <button className="w-full py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium">
            Salvar Configuração de Recorrência
          </button>
        </div>
      </div>

      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2 flex items-center gap-1.5`}>
          <Mail size={12} className="text-blue-400" /> Captura de E-mail → Tarefa
        </p>
        <div className={`${isDark ? "bg-slate-700/40" : "bg-slate-100"} rounded-xl p-2.5 mb-3`}>
          <div className="flex items-center gap-1 mb-1">
            <Mail size={10} className="text-blue-400" />
            <span className="text-[10px] font-medium text-blue-400">De: cliente@empresa.com</span>
          </div>
          <p className={`text-[10px] font-semibold ${text} mb-0.5`}>Assunto: URGENTE — Ajuste no relatório Q3</p>
          <p className="text-[10px] text-slate-400">Preciso do relatório ajustado para apresentação amanhã às 9h. Pode confirmar entrega?</p>
        </div>
        {converted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-2 flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className="text-xs text-emerald-300">Tarefa criada: "URGENTE — Ajuste no relatório Q3"</span>
          </div>
        ) : (
          <button onClick={() => setConverted(true)} className="w-full py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-colors">
            Converter E-mail em Tarefa
          </button>
        )}
      </div>
    </div>
  );
}