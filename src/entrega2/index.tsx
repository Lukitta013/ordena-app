import { useState, useEffect, useRef } from "react";
import {
  MapPin, Lock, Copy, Calendar, Mic, Bell, Search, RefreshCw,
  Play, Pause, Square, CheckCircle2, AlertTriangle, Clock,
  ChevronDown, ChevronRight, X, Mail, Repeat, Users, Check,
  XCircle, MessageSquare, Paperclip, Shield,
} from "lucide-react";
import { TASKS, CALENDAR_EVENTS, AUDIT_LOG, TEAM_MEMBERS, TEMPLATES } from "../mock/mockData";

type Theme = "dark" | "light";

const SECTIONS = [
  { id: "gps", label: "GPS & Geofencing", icon: MapPin, color: "text-emerald-400" },
  { id: "deps", label: "Dependências", icon: Lock, color: "text-rose-400" },
  { id: "dup", label: "Duplicação & Templates", icon: Copy, color: "text-amber-400" },
  { id: "cal", label: "Calendário", icon: Calendar, color: "text-blue-400" },
  { id: "audio", label: "Mídia & Áudio", icon: Mic, color: "text-violet-400" },
  { id: "alerts", label: "Alertas de Prazo", icon: Bell, color: "text-orange-400" },
  { id: "search", label: "Busca & Auditoria", icon: Search, color: "text-cyan-400" },
  { id: "recur", label: "Recorrência & E-mail", icon: Repeat, color: "text-indigo-400" },
  { id: "assign", label: "Atribuição & Conflitos", icon: Users, color: "text-pink-400" },
];

// ── GPS & Geofencing ──────────────────────────────────────────────
function GpsSection({ isDark }: { isDark: boolean }) {
  const [simulating, setSimulating] = useState(false);
  const [distance, setDistance] = useState(450);
  const [notif, setNotif] = useState(false);
  const [timerRef] = useState<{ id: ReturnType<typeof setInterval> | null }>({ id: null });

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

// ── Dependencies ──────────────────────────────────────────────────
function DepsSection({ isDark }: { isDark: boolean }) {
  const [blocked, setBlocked] = useState<string | null>(null);
  const [showBlock, setShowBlock] = useState(false);

  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";

  const blockedTasks = TASKS.filter(t => t.dependencies.length > 0);

  return (
    <div className="space-y-3">
      {showBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                <Lock size={18} className="text-rose-400" />
              </div>
              <div>
                <p className="text-rose-400 font-semibold text-sm">Ação Bloqueada</p>
                <p className="text-xs text-slate-400">Dependência não concluída</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Esta tarefa possui dependência não concluída. Conclua primeiro{" "}
              <strong className="text-rose-300">"{TASKS.find(t => t.id === blocked)?.title}"</strong> para desbloquear.
            </p>
            <button onClick={() => { setShowBlock(false); setBlocked(null); }}
              className="w-full py-2.5 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium">
              Entendido
            </button>
          </div>
        </div>
      )}

      {blockedTasks.map(task => {
        const depTask = TASKS.find(t => t.id === task.dependencies[0]);
        const isDepDone = depTask?.status === "Concluída";
        return (
          <div key={task.id} className={`${card} border rounded-xl p-3`}>
            <div className="flex items-start gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${isDepDone ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
                {isDepDone ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Lock size={14} className="text-rose-400" />}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-semibold ${text}`}>{task.title}</p>
                <p className={`text-[10px] ${sub}`}>{task.status}</p>
              </div>
            </div>
            <div className={`${isDark ? "bg-slate-700/40" : "bg-slate-100"} rounded-lg px-2.5 py-2 mb-2`}>
              <p className="text-[10px] text-slate-400 mb-1">Depende de:</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isDepDone ? "bg-emerald-400" : "bg-rose-400"}`} />
                <p className={`text-xs font-medium ${text}`}>{depTask?.title}</p>
              </div>
              <p className={`text-[10px] mt-0.5 ${isDepDone ? "text-emerald-400" : "text-rose-400"}`}>
                {isDepDone ? "Concluída — Tarefa desbloqueada" : "Pendente — Tarefa bloqueada"}
              </p>
            </div>
            <button
              onClick={() => { if (!isDepDone) { setBlocked(task.dependencies[0]); setShowBlock(true); } }}
              className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
                isDepDone
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30"
              }`}
            >
              {isDepDone ? "Avançar Status" : "Avançar Status (Bloqueado)"}
            </button>
          </div>
        );
      })}

      {/* External dependency */}
      <div className={`${card} border border-amber-500/20 rounded-xl p-3`}>
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} className="text-amber-400" />
          <p className="text-xs font-semibold text-amber-400">Dependência Externa — Fornecedor</p>
        </div>
        <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-700"} mb-2`}>Aguardando aprovação contratual da empresa parceira XYZ Tecnologia para iniciar integração da API.</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-amber-400" />
            <span className="text-[10px] text-amber-400 font-mono">Prazo crítico: 2 dias restantes</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ── Duplication & Templates ───────────────────────────────────────
function DupSection({ isDark }: { isDark: boolean }) {
  const [duplicated, setDuplicated] = useState<string | null>(null);
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className="space-y-3">
      {duplicated && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <p className="text-xs text-emerald-300">Tarefa duplicada com sucesso! Datas recalculadas: D+0, D+2, D+5</p>
        </div>
      )}
      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2`}>Duplicar Tarefa com Subtarefas</p>
        {TASKS.slice(0, 3).map(task => (
          <div key={task.id} className="flex items-center gap-2 py-2 border-b border-slate-700/30 last:border-0">
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${text} truncate`}>{task.title}</p>
              <p className={`text-[10px] ${sub}`}>{task.subtasks.length} subtarefas • {task.effort}h</p>
            </div>
            <button
              onClick={() => setDuplicated(task.id)}
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
function CalSection({ isDark }: { isDark: boolean }) {
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

// ── Audio & Media ─────────────────────────────────────────────────
function AudioSection({ isDark }: { isDark: boolean }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [saved, setSaved] = useState(false);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [waveKeys, setWaveKeys] = useState([...Array(20)].map(() => Math.random()));

  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const text = isDark ? "text-slate-100" : "text-slate-900";

  const startRec = () => {
    setRecording(true);
    setSaved(false);
    setSeconds(0);
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
      setWaveKeys([...Array(20)].map(() => Math.random()));
    }, 1000);
  };
  const stopRec = () => {
    setRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  const saveToMinio = () => { stopRec(); setSaved(true); };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-3">
      {/* Thread */}
      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2 flex items-center gap-1.5`}>
          <MessageSquare size={12} className="text-violet-400" /> Comentários da Tarefa
        </p>
        {[
          { avatar: "MS", author: "Mariana Silva", text: "Reproduzi o bug. Heap cresce 200MB por minuto.", time: "09:14" },
          { avatar: "LI", author: "Lucas Inacio", text: "Vou tentar SplitChunksPlugin primeiro.", time: "09:32" },
          { avatar: "CS", author: "Carlos Souza", text: "Rodei o profiler. Resultado no áudio abaixo 👇", time: "09:45" },
        ].map((c, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold flex-none">{c.avatar}</div>
            <div className={`flex-1 ${isDark ? "bg-slate-700/50" : "bg-slate-100"} rounded-xl px-2.5 py-2`}>
              <div className="flex justify-between mb-0.5">
                <span className={`text-[10px] font-semibold ${text}`}>{c.author}</span>
                <span className="text-[10px] text-slate-500">{c.time}</span>
              </div>
              <p className="text-xs text-slate-400">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recorder */}
      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-3 flex items-center gap-1.5`}>
          <Mic size={12} className="text-violet-400" /> Gravador de Áudio
        </p>
        {recording && (
          <div className="flex items-end gap-0.5 h-10 mb-3 px-2">
            {waveKeys.map((k, i) => (
              <div key={k}
                className="flex-1 bg-violet-500 rounded-t transition-all duration-150"
                style={{ height: `${20 + Math.random() * 80}%`, opacity: 0.7 + Math.random() * 0.3 }}
              />
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-mono text-slate-400">{fmt(seconds)}</span>
          {recording && <span className="flex items-center gap-1 text-xs text-rose-400"><div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />Gravando...</span>}
        </div>
        <div className="flex gap-2">
          {!recording ? (
            <button onClick={startRec} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-semibold hover:bg-violet-500/30 transition-colors">
              <Mic size={14} /> Gravar Áudio
            </button>
          ) : (
            <>
              <button onClick={stopRec} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs border border-slate-600">
                <Pause size={13} /> Pausar
              </button>
              <button onClick={saveToMinio} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-500 text-white text-xs font-semibold">
                <Square size={13} /> Salvar MinIO
              </button>
            </>
          )}
        </div>
        {saved && (
          <div className="mt-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-indigo-300">s3://minio-ordena/audios/task_10_note.mp3 (240 KB)</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPlaying(p => !p)} className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center">
                {playing ? <Pause size={12} className="text-white" /> : <Play size={12} className="text-white" />}
              </button>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full bg-indigo-500 rounded-full transition-all ${playing ? "w-1/3" : "w-0"}`} />
              </div>
              <span className="text-[10px] text-slate-500 font-mono">1:42</span>
            </div>
          </div>
        )}
      </div>

      {/* Attachments */}
      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2 flex items-center gap-1.5`}>
          <Paperclip size={12} className="text-amber-400" /> Anexos
        </p>
        {[
          { name: "coverage_report.png", size: "380 KB", type: "img", url: "https://images.unsplash.com/photo-1555066931-4365d14431b9?w=60&h=40&fit=crop" },
          { name: "diagnostico_memoria.pdf", size: "1.2 MB", type: "pdf" },
        ].map((att, i) => (
          <div key={i} className="flex items-center gap-2 py-2 border-b border-slate-700/30 last:border-0">
            {att.type === "img" && <img src={att.url} alt="" className="w-10 h-8 rounded object-cover flex-none" />}
            {att.type === "pdf" && <div className="w-10 h-8 rounded bg-rose-500/20 flex items-center justify-center flex-none text-rose-400 text-[10px] font-bold">PDF</div>}
            <div className="flex-1">
              <p className={`text-xs ${text} truncate`}>{att.name}</p>
              <p className="text-[10px] text-slate-500">{att.size}</p>
            </div>
          </div>
        ))}
        <button className="mt-2 w-full py-2 rounded-lg border border-dashed border-slate-600 text-xs text-slate-400 flex items-center justify-center gap-1.5 hover:border-amber-500 hover:text-amber-400 transition-colors">
          <Paperclip size={11} /> Adicionar Anexo
        </button>
      </div>
    </div>
  );
}

// ── Deadline Alerts ───────────────────────────────────────────────
function AlertsSection({ isDark }: { isDark: boolean }) {
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const urgencyLevels = [
    { label: "7 dias", color: "bg-emerald-500", text: "text-emerald-400", task: "Criar componentes do Design System", pct: 20 },
    { label: "3 dias", color: "bg-amber-400", text: "text-amber-400", task: "Implementar OAuth2 + JWT", pct: 40 },
    { label: "1 dia", color: "bg-orange-500", text: "text-orange-400", task: "Refatorar camada MinIO", pct: 60 },
    { label: "2 horas", color: "bg-rose-500", text: "text-rose-400", task: "Aprovação dos Testes E2E", pct: 80 },
    { label: "30 min", color: "bg-rose-700 animate-pulse", text: "text-rose-500", task: "Deploy em Produção", pct: 100 },
  ];

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
        {urgencyLevels.map((u, i) => (
          <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${i === 4 ? "border-rose-500/30 bg-rose-500/10" : i === 3 ? "border-orange-500/20 bg-orange-500/5" : "border-slate-700/50 bg-slate-800/40"}`}>
            <div className={`w-2 h-2 rounded-full flex-none ${u.color}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${text} truncate`}>{u.task}</p>
            </div>
            <span className={`text-[10px] font-mono ${u.text} flex-none whitespace-nowrap`}>{u.label}</span>
          </div>
        ))}
      </div>

      <div className={`${card} border border-rose-500/20 rounded-xl p-3`}>
        <p className="text-xs font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
          <Bell size={11} /> Resumo Diário — Pronto para Envio
        </p>
        <p className="text-xs text-slate-400 mb-2">3 tarefas críticas para hoje • 1 atrasada • 2 em risco</p>
        <button className="w-full py-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium hover:bg-rose-500/30 transition-colors">
          📧 Disparar Alerta por E-mail / Push
        </button>
      </div>
    </div>
  );
}

// ── Search & Audit ────────────────────────────────────────────────
function SearchSection({ isDark }: { isDark: boolean }) {
  const [q, setQ] = useState("");
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";

  const index: Record<string, string[]> = {
    "minio": ["Refatorar camada de dados MinIO", "Organizar pastas antigas"],
    "relatrio": ["Relatório Trimestral — Q3 2025"],
    "auth": ["Implementar autenticação OAuth2 + JWT"],
    "deploy": ["Deploy em Produção (AWS EC2)"],
    "teste": ["Aprovação dos Testes E2E (Cypress)"],
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
          <Search size={12} className="text-cyan-400" /> Busca Semântica com Índice Invertido
        </p>
        <div className={`flex items-center gap-2 ${isDark ? "bg-slate-700/60" : "bg-slate-100"} border ${isDark ? "border-slate-600" : "border-slate-200"} rounded-lg px-3 py-2`}>
          <Search size={13} className={sub} />
          <input
            className={`flex-1 bg-transparent text-sm ${text} placeholder-slate-500 outline-none`}
            placeholder='Tente "relatrio" ou "minio"...'
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
function RecurSection({ isDark }: { isDark: boolean }) {
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

// ── Assignment & Conflicts ────────────────────────────────────────
function AssignSection({ isDark }: { isDark: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [response, setResponse] = useState<Record<string, string>>({});
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className="space-y-3">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
        <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-1.5">
          <AlertTriangle size={12} /> Conflito Detectado
        </p>
        <p className="text-xs text-amber-200">
          <strong>Lucas Inacio</strong> já possui 7h de tarefas nesta quarta-feira.
        </p>
        <p className="text-xs text-amber-300 mt-0.5">Sugestão: Quinta-feira às 10h (disponível)</p>
      </div>

      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2 flex items-center gap-1.5`}>
          <Users size={12} className="text-pink-400" /> Painel de Colaboradores
        </p>
        <p className={`text-xs ${sub} mb-3`}>Tarefa: <strong className={text}>"Refatorar camada de dados MinIO"</strong></p>
        {TEAM_MEMBERS.slice(0, 3).map(m => (
          <div key={m.id} className={`flex items-center gap-3 py-2.5 px-2.5 rounded-xl mb-2 border transition-all ${selected === m.id ? "border-indigo-500/40 bg-indigo-500/10" : "border-slate-700/40 bg-slate-700/20"}`}>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-none">
              {m.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${text}`}>{m.name}</p>
              <p className={`text-[10px] ${sub}`}>{m.role} • {m.capacity}% de capacidade</p>
              <div className="h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                <div className={`h-full rounded-full ${m.capacity > 85 ? "bg-rose-500" : m.capacity > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${m.capacity}%` }} />
              </div>
            </div>
            <button onClick={() => setSelected(m.id)} className={`text-[10px] px-2 py-1 rounded-lg border transition-all flex-none ${selected === m.id ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-600 text-slate-400"}`}>
              {selected === m.id ? "OK" : "Selecionar"}
            </button>
          </div>
        ))}
        {selected && !response[selected] && (
          <div className="space-y-2 mt-3">
            <p className={`text-[10px] ${sub} text-center`}>Aguardando resposta de <strong>{TEAM_MEMBERS.find(m => m.id === selected)?.name}</strong></p>
            <div className="flex gap-2">
              <button onClick={() => setResponse(r => ({ ...r, [selected]: "accepted" }))}
                className="flex-1 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center justify-center gap-1">
                <Check size={12} /> Aceitar
              </button>
              <button onClick={() => setResponse(r => ({ ...r, [selected]: "refused" }))}
                className="flex-1 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center justify-center gap-1">
                <XCircle size={12} /> Recusar
              </button>
              <button onClick={() => setResponse(r => ({ ...r, [selected]: "reschedule" }))}
                className="flex-1 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium flex items-center justify-center gap-1">
                <Clock size={12} /> Reagendar
              </button>
            </div>
          </div>
        )}
        {selected && response[selected] && (
          <div className={`mt-2 p-2 rounded-xl border text-xs text-center ${response[selected] === "accepted" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : response[selected] === "refused" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}>
            {response[selected] === "accepted" ? "Tarefa aceita pelo colaborador." : response[selected] === "refused" ? "Tarefa recusada — motivo: sobrecarga." : "Solicitação de reagendamento enviada."}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Entrega2({ theme }: { theme: Theme }) {
  const [activeSection, setActiveSection] = useState("gps");
  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-slate-50";
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";

  const current = SECTIONS.find(s => s.id === activeSection)!;

  return (
    <div className={`min-h-full ${bg} pb-6`}>
      {/* Header */}
      <div className="px-4 pt-3 pb-3">
        <p className={`text-xs ${sub}`}>Entrega 2 • AV2: 20%</p>
        <h1 className={`text-lg font-bold ${text}`}>Hardware & Integrações</h1>
        <p className={`text-xs ${sub} mt-0.5`}>US06 – US14 • 17 Itens do Backlog</p>
      </div>

      {/* Section picker */}
      <div className="px-4 mb-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-1">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex-none flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs transition-all ${
                  activeSection === s.id
                    ? "bg-indigo-500 border-indigo-500 text-white"
                    : isDark ? `border-slate-700 ${s.color} hover:border-slate-600` : `border-slate-200 ${s.color}`
                }`}
              >
                <Icon size={11} />
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 mb-3">
        <div className={`${card} border rounded-xl px-3 py-2 flex items-center gap-2`}>
          {(() => { const Icon = current.icon; return <Icon size={14} className={current.color} />; })()}
          <span className={`text-xs font-semibold ${text}`}>{current.label}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {activeSection === "gps" && <GpsSection isDark={isDark} />}
        {activeSection === "deps" && <DepsSection isDark={isDark} />}
        {activeSection === "dup" && <DupSection isDark={isDark} />}
        {activeSection === "cal" && <CalSection isDark={isDark} />}
        {activeSection === "audio" && <AudioSection isDark={isDark} />}
        {activeSection === "alerts" && <AlertsSection isDark={isDark} />}
        {activeSection === "search" && <SearchSection isDark={isDark} />}
        {activeSection === "recur" && <RecurSection isDark={isDark} />}
        {activeSection === "assign" && <AssignSection isDark={isDark} />}
      </div>
    </div>
  );
}
