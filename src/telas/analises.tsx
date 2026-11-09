import { useState, useEffect, useRef } from "react";
import { Zap, Code2, Moon, Download, Target, X, Play, Pause, CheckCircle2, RefreshCw, Coffee, Lock, Upload } from "lucide-react";
import { jsPDF } from "jspdf";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Area, AreaChart, CartesianGrid,
} from "recharts";
import { PRODUCTIVITY_DATA, MONTHLY_DATA, TASKS, JSON_RULES, OKRS } from "../mock/mockData";
import { useTasks, isDone, isOverdue, sameDay, parseEffort, PROJECT_COLORS, type AppTask } from "./tarefas/context/TaskContext";
import { TaskDetailModal } from "./tarefas";
import { openBlob } from "./tarefas/utils/anexos";

const card = "rounded-xl p-3";
const cardStyle = { background: "var(--surface)", border: "1px solid var(--border)" };



// ── BI Dashboard ──────────────────────────────────────────────────
export function BiSection({ isDark }: { isDark: boolean }) {
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const tooltipStyle = { backgroundColor: isDark ? "#1e293b" : "#fff", border: "1px solid #334155", borderRadius: 8, fontSize: 11 };

  const { tasks } = useTasks();
  const pct = (n: number) => (tasks.length ? `${Math.round((n / tasks.length) * 100)}%` : "—");
  const avgEffort = tasks.length ? tasks.reduce((h, t) => h + parseEffort(t.effort), 0) / tasks.length : 0;
  const kpis = [
    { label: "Taxa de Conclusão", value: pct(tasks.filter(isDone).length), color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Esforço Médio/Tarefa", value: `${avgEffort.toFixed(1)}h`, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Índice de Atraso", value: pct(tasks.filter(isOverdue).length), color: "text-rose-400", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {kpis.map(k => (
          <div key={k.label} className={`${card} border rounded-xl p-2.5 ${k.bg}`}>
            <p className={`text-base font-bold ${k.color}`}>{k.value}</p>
            <p className={`text-[9px] ${sub} leading-tight`}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-3`}>Tarefas Concluídas por Dia <span className={`font-normal ${sub}`}>(exemplo)</span></p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={PRODUCTIVITY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }} />
            <YAxis tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="concluidas" fill="#6366f1" radius={[4, 4, 0, 0]} name="Concluídas" />
            <Bar dataKey="atrasadas" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Atrasadas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-3`}>Produtividade: Mensal vs Trimestral <span className={`font-normal ${sub}`}>(exemplo)</span></p>
        <ResponsiveContainer width="100%" height={110}>
          <AreaChart data={MONTHLY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }} />
            <YAxis tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="mensal" stroke="#6366f1" fill="#6366f120" name="Mensal" />
            <Area type="monotone" dataKey="trimestral" stroke="#10b981" fill="#10b98120" name="Trimestral" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Cronograma Gantt (US17) ───────────────────────────────────────
// Cada tarefa aberta vira uma barra que começa quando ela pode começar (hoje, ou no prazo da dependência
// que termina por último) e vai até o prazo. Tocar na barra abre a tarefa.
const DAY_W = 34;
export function GanttSection({ isDark }: { isDark: boolean }) {
  const { tasks } = useTasks();
  const [openId, setOpenId] = useState<string | null>(null);
  const [project, setProject] = useState<string | null>(null);
  const today = new Date(new Date().toDateString());
  const dayIdx = (iso: string) => Math.floor((new Date(new Date(iso).toDateString()).getTime() - today.getTime()) / 864e5);

  const open = tasks.filter(t => !isDone(t) && (!project || t.project === project));
  const rows = open.map(t => {
    const deps = tasks.filter(d => t.dependsOn?.includes(d.id) && !isDone(d));
    const startDay = Math.max(0, ...deps.map(d => dayIdx(d.dueDate)));
    const endDay = dayIdx(t.dueDate);
    return { t, deps, start: Math.min(startDay, Math.max(endDay, 0)), end: endDay };
  }).sort((a, b) => a.start - b.start || a.end - b.end);
  const days = Math.min(60, Math.max(14, ...rows.map(r => r.end + 2)));
  const projects = [...new Set(tasks.filter(t => !isDone(t)).map(t => t.project))];
  const openTask = tasks.find(t => t.id === openId);
  const chipStyle = (on: boolean) => on ? { background: "var(--accent)", color: "#fff" } : { border: "1px solid var(--border)", color: "var(--sub)" };

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {[null, ...projects].map(p => (
          <button key={p ?? "todos"} onClick={() => setProject(p)} className="flex-none text-[11px] font-medium px-2.5 py-1 rounded-full" style={chipStyle(project === p)}>
            {p ?? "Todas"}
          </button>
        ))}
      </div>
      <div className={card} style={cardStyle}>
        {rows.length === 0 && <p className="text-[12px] py-2" style={{ color: "var(--sub)" }}>Nenhuma tarefa em aberto.</p>}
        {rows.length > 0 && (
          <div className="flex">
            <div className="w-28 flex-none pt-6">
              {rows.map(({ t }) => (
                <button key={t.id} onClick={() => setOpenId(t.id)} className="h-9 w-full text-left pr-2 flex items-center">
                  <span className="text-[11px] font-medium truncate" style={{ color: "var(--text)" }}>{t.title}</span>
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div style={{ width: days * DAY_W }} className="relative">
                <div className="flex h-6">
                  {Array.from({ length: days }, (_, i) => {
                    const d = new Date(today.getTime() + i * 864e5);
                    return (
                      <div key={i} style={{ width: DAY_W, color: i === 0 ? "var(--accent)" : "var(--tertiary)" }} className="flex-none text-center text-[9px] font-mono leading-tight">
                        {i === 0 ? "Hoje" : d.toLocaleDateString("pt-BR", { weekday: "narrow" })}<br />{d.getDate()}
                      </div>
                    );
                  })}
                </div>
                {rows.map(({ t, deps, start, end }) => {
                  const late = end < 0;
                  const left = start * DAY_W;
                  const width = Math.max(1, (late ? 1 : end - start + 1)) * DAY_W - 4;
                  return (
                    <div key={t.id} className="h-9 relative" style={{ borderTop: "1px solid var(--border)" }}>
                      <button onClick={() => setOpenId(t.id)} aria-label={`${t.title}: prazo ${new Date(t.dueDate).toLocaleDateString("pt-BR")}`}
                        className="absolute top-1.5 bottom-1.5 rounded-md flex items-center gap-1 px-1.5 text-white text-[10px] font-semibold overflow-hidden"
                        style={{ left: left + 2, width, background: PROJECT_COLORS[t.project] ?? "var(--accent)", opacity: deps.length ? 0.6 : 0.9, outline: late ? "2px solid var(--critical)" : undefined }}>
                        {deps.length > 0 && <Lock size={10} className="flex-none" />}
                        <span className="truncate">{late ? "Atrasada" : t.effort || ""}</span>
                      </button>
                    </div>
                  );
                })}
                <div className="absolute top-6 bottom-0 w-px" style={{ left: DAY_W / 2, background: "var(--accent)", opacity: 0.4 }} />
              </div>
            </div>
          </div>
        )}
      </div>
      {rows.some(r => r.deps.length) && (
        <div className={card} style={cardStyle}>
          <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--text)" }}>Dependências</p>
          {rows.filter(r => r.deps.length).map(({ t, deps }) => (
            <p key={t.id} className="text-[12px] py-1" style={{ color: "var(--sub)" }}>
              {deps.map(d => d.title).join(", ")} <span style={{ color: "var(--accent)" }}>→</span> <span style={{ color: "var(--text)" }}>{t.title}</span>
            </p>
          ))}
        </div>
      )}
      <p className="text-[11px] px-1" style={{ color: "var(--tertiary)" }}>
        A barra vai de quando a tarefa pode começar até o prazo. Barras com cadeado esperam outra tarefa terminar; as com contorno vermelho estão atrasadas. Arraste para o lado para ver mais dias.
      </p>
      {openTask && <TaskDetailModal task={openTask} isDark={isDark} onClose={() => setOpenId(null)} />}
    </div>
  );
}

// ── Telemetry ─────────────────────────────────────────────────────
export function TelemetrySection({ isDark }: { isDark: boolean }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";

  const toggle = () => {
    if (running) {
      setRunning(false);
      if (ref.current) clearInterval(ref.current);
    } else {
      setRunning(true);
      ref.current = setInterval(() => setElapsed(s => s + 1), 1000);
    }
  };
  useEffect(() => () => { if (ref.current) clearInterval(ref.current); }, []);

  const fmt = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60).toString().padStart(2, "0")}m`;

  const task = TASKS[0];
  const ci = task.complexityIndex;

  return (
    <div className="space-y-3">
      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-1`}>{task.title}</p>
        <p className={`text-[10px] ${sub} mb-3`}>{task.project}</p>

        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-indigo-400">{fmt(elapsed)}</p>
            <p className={`text-[10px] ${sub}`}>Tempo Real Gasto</p>
          </div>
          <div className={`w-px h-10 ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-amber-400">{task.estimatedTime}h 00m</p>
            <p className={`text-[10px] ${sub}`}>Estimado</p>
          </div>
        </div>

        <button onClick={toggle}
          className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${running ? "bg-rose-500/20 border border-rose-500/30 text-rose-400" : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"}`}>
          {running ? <><Pause size={14} /> Pausar Timer</> : <><Play size={14} /> Iniciar Timer</>}
        </button>
      </div>

      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2`}>Precisão Histórica de Estimativas</p>
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 flex-none">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="#6366f1" strokeWidth="3"
                strokeDasharray={`${85 * 0.942} ${100 * 0.942}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-400">85%</span>
            </div>
          </div>
          <div>
            <p className={`text-xs font-medium ${text}`}>85% de calibração histórica</p>
            <p className={`text-[10px] ${sub}`}>Baseado nas últimas 23 estimativas</p>
          </div>
        </div>
      </div>

      <div className={`${card} border border-amber-500/20 rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2 flex items-center gap-1.5`}>
          <Zap size={12} className="text-amber-400" /> Índice de Complexidade Multivariado
        </p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-amber-400">{ci.toFixed(1)}</span>
          <span className={`text-xs px-2 py-1 rounded-lg ${ci > 10 ? "bg-rose-500/20 text-rose-400" : ci > 5 ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
            {ci > 10 ? "Alta Complexidade" : ci > 5 ? "Média Complexidade" : "Baixa Complexidade"}
          </span>
        </div>
        <div className="space-y-1 text-[10px] text-slate-400 font-mono">
          <div className="flex justify-between"><span>Subtarefas × 1.5</span><span>{(task.subtasks.length * 1.5).toFixed(1)}</span></div>
          <div className="flex justify-between"><span>Dependências × 2.0</span><span>{(task.dependencies.length * 2.0).toFixed(1)}</span></div>
          <div className="flex justify-between"><span>Anexos × 0.5</span><span>{(task.attachments.length * 0.5).toFixed(1)}</span></div>
          <div className="flex justify-between"><span>Comentários × 0.3</span><span>{(task.comments.length * 0.3).toFixed(1)}</span></div>
          <div className={`flex justify-between pt-1 border-t border-slate-700 font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            <span>Total</span><span>{ci}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Predictive ────────────────────────────────────────────────────
export function PredictSection({ isDark }: { isDark: boolean }) {
  const { tasks } = useTasks();
  const velocity = 4.2; // ponytail: ritmo fixo de exemplo, calcular pelo histórico quando houver data de conclusão
  const remaining = tasks.filter(t => !isDone(t)).length;
  const donePct = tasks.length ? Math.round((tasks.filter(isDone).length / tasks.length) * 100) : 0;
  const eta = new Date(Date.now() + Math.ceil(remaining / velocity) * 86400000);
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";

  return (
    <div className="space-y-3">
      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-3`}>Burndown Preditivo — Semana</p>
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1">
            <p className={`text-[10px] ${sub} mb-0.5`}>Velocidade atual</p>
            <p className="text-lg font-bold text-indigo-400">4,2 tarefas/dia</p>
          </div>
          <div className="flex-1">
            <p className={`text-[10px] ${sub} mb-0.5`}>Tarefas restantes</p>
            <p className="text-lg font-bold text-amber-400">{remaining}</p>
          </div>
          <div className="flex-1">
            <p className={`text-[10px] ${sub} mb-0.5`}>Data prevista</p>
            <p className="text-sm font-bold text-emerald-400">{eta.toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div style={{ width: `${donePct}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full" />
        </div>
        <p className={`text-[10px] ${sub} mt-1`}>{donePct}% das tarefas concluídas</p>
      </div>
    </div>
  );
}


// ── Burnout ───────────────────────────────────────────────────────
export function BurnoutSection({ isDark }: { isDark: boolean }) {
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const [dismissed, setDismissed] = useState(false);

  const hoursToday = 8.3;
  const pct = Math.min(100, (hoursToday / 8) * 100);

  return (
    <div className="space-y-3">
      {!dismissed && (
        <div className="bg-orange-500/15 border border-orange-500/30 rounded-xl p-3 relative">
          <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 text-slate-400"><X size={14} /></button>
          <div className="flex items-start gap-2">
            <Coffee size={16} className="text-orange-400 flex-none mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-orange-400 mb-0.5">Alerta de Burnout Preditivo</p>
              <p className={`text-xs ${isDark ? "text-orange-200" : "text-orange-800"}`}>
                Você acumulou mais de <strong>8 horas</strong> de tarefas críticas hoje.
                Sugestão de Pausa de <strong>15 minutos</strong> recomendada.
              </p>
              <button className={`mt-2 text-[10px] bg-orange-500/30 ${isDark ? "text-orange-300" : "text-orange-800"} px-3 py-1 rounded-full`}>
                Iniciar Pausa Guiada
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2`}>Radar de Saúde Ocupacional</p>
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-16 h-16 flex-none">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none"
                stroke={pct > 90 ? "#f43f5e" : pct > 70 ? "#f97316" : "#22c55e"}
                strokeWidth="3"
                strokeDasharray={`${pct * 0.942} ${100 * 0.942}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${pct > 90 ? "text-rose-400" : pct > 70 ? "text-orange-400" : "text-emerald-400"}`}>{Math.round(pct)}%</span>
            </div>
          </div>
          <div>
            <p className={`text-sm font-bold ${pct > 90 ? "text-rose-400" : pct > 70 ? "text-orange-400" : "text-emerald-400"}`}>
              {pct > 90 ? "Zona Crítica" : pct > 70 ? "Atenção" : "Saudável"}
            </p>
            <p className={`text-[10px] ${sub}`}>{hoursToday}h trabalhadas hoje</p>
            <p className={`text-[10px] ${sub}`}>Meta diária: 8h</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Backup e relatório PDF (US23) ─────────────────────────────────
// O backup é um arquivo .json com tudo que o app guarda; o Android oferece onde salvar
// (Google Drive, Downloads, WhatsApp...), e restaurar lê esse arquivo de volta.
const BACKUP_KEYS = ["ordena-tasks", "ordena-categorias", "ordena-status", "ordena-modelos", "ordena-historico"];
const LAST_KEY = "ordena-ultimo-backup";
const stamp = () => new Date().toISOString().slice(0, 10);

function buildReport(tasks: AppTask[]) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = 20;
  const line = (txt: string, size = 10, bold = false, gap = 6) => {
    if (y > 280) { pdf.addPage(); y = 20; }
    pdf.setFont("helvetica", bold ? "bold" : "normal").setFontSize(size);
    const parts = pdf.splitTextToSize(txt, 180) as string[];
    pdf.text(parts, 15, y);
    y += gap * parts.length;
  };
  const fmt = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const open = tasks.filter(t => !isDone(t)).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const done = tasks.filter(isDone);
  const week = done.filter(t => Date.now() - new Date(t.updatedAt).getTime() < 7 * 864e5);
  const late = tasks.filter(isOverdue);

  line("Ordena — Relatório de tarefas", 18, true, 9);
  line(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 10, false, 10);
  line("Resumo", 13, true, 7);
  line(`Em aberto: ${open.length}   Concluídas: ${done.length}   Atrasadas: ${late.length}   Concluídas nos últimos 7 dias: ${week.length}`, 10, false, 10);
  if (late.length) {
    line("Atrasadas", 13, true, 7);
    late.forEach(t => line(`• ${t.title} — prazo ${fmt(t.dueDate)} (${t.project}, prioridade ${t.priority})`));
    y += 4;
  }
  line("Em aberto por categoria", 13, true, 7);
  for (const p of [...new Set(open.map(t => t.project))]) {
    line(p, 11, true, 6);
    open.filter(t => t.project === p).forEach(t => line(`• ${t.title} — prazo ${fmt(t.dueDate)}, ${t.priority}${t.effort ? `, ${t.effort}` : ""}`));
    y += 2;
  }
  if (week.length) {
    y += 2;
    line("Concluídas nos últimos 7 dias", 13, true, 7);
    week.forEach(t => line(`• ${t.title} (${t.project})`));
  }
  return pdf.output("blob");
}

export function BackupSection(_: { isDark: boolean }) {
  const { tasks, notify } = useTasks();
  const [last, setLast] = useState(() => localStorage.getItem(LAST_KEY));
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState<Record<string, unknown> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const btn = "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold";

  const exportBackup = async () => {
    const data: Record<string, unknown> = { app: "ordena", versao: 1, criadoEm: new Date().toISOString() };
    BACKUP_KEYS.forEach(k => { data[k] = JSON.parse(localStorage.getItem(k) ?? "null"); });
    try {
      await openBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `ordena-backup-${stamp()}.json`);
      const now = new Date().toISOString();
      localStorage.setItem(LAST_KEY, now);
      setLast(now);
    } catch { notify("Não foi possível gerar o backup."); }
  };

  const readFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (data?.app !== "ordena" || !Array.isArray(data["ordena-tasks"])) throw new Error();
      setPending(data);
      setMsg("");
    } catch { setMsg("Esse arquivo não é um backup do Ordena."); }
    if (fileRef.current) fileRef.current.value = "";
  };

  const restore = () => {
    if (!pending) return;
    BACKUP_KEYS.forEach(k => { if (pending[k] != null) localStorage.setItem(k, JSON.stringify(pending[k])); });
    location.reload();
  };

  const exportPdf = () => openBlob(buildReport(tasks), `ordena-relatorio-${stamp()}.pdf`).catch(() => notify("Não foi possível gerar o PDF."));

  return (
    <div className="space-y-3">
      <div className={card} style={cardStyle}>
        <p className="text-[13px] font-semibold mb-0.5" style={{ color: "var(--text)" }}>Backup</p>
        <p className="text-[12px] mb-3" style={{ color: "var(--tertiary)" }}>
          Gera um arquivo com suas tarefas, categorias, status, modelos e histórico. Salve no Google Drive para ter uma cópia na nuvem.
          {last && <><br />Último backup: {new Date(last).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</>}
        </p>
        <button onClick={exportBackup} className={btn} style={{ background: "var(--accent)", color: "#fff" }}>
          <Upload size={14} /> Fazer backup agora
        </button>
        <button onClick={() => fileRef.current?.click()} className={`${btn} mt-2`} style={{ background: "var(--sunken)", color: "var(--accent)", border: "1px solid var(--border)" }}>
          <RefreshCw size={14} /> Restaurar de um backup
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={e => readFile(e.target.files?.[0])} />
        {pending && (
          <div className="mt-3 p-3 rounded-xl text-[12px]" style={{ background: "var(--sunken)", border: "1px solid var(--border)", color: "var(--text)" }}>
            Backup de {new Date(String(pending.criadoEm)).toLocaleString("pt-BR")} com {(pending["ordena-tasks"] as unknown[]).length} tarefas.
            Restaurar substitui o que está no app agora.
            <div className="flex gap-2 mt-2">
              <button onClick={() => setPending(null)} className="px-3 py-1.5 rounded-lg" style={{ border: "1px solid var(--border)", color: "var(--sub)" }}>Cancelar</button>
              <button onClick={restore} className="flex-1 py-1.5 rounded-lg font-semibold text-white" style={{ background: "var(--critical)" }}>Restaurar</button>
            </div>
          </div>
        )}
        {msg && <p className="text-[12px] mt-2" style={{ color: "var(--critical)" }}>{msg}</p>}
        <p className="text-[11px] mt-2" style={{ color: "var(--tertiary)" }}>Os arquivos anexados (fotos, áudios) não vão no backup.</p>
      </div>

      <div className={card} style={cardStyle}>
        <p className="text-[13px] font-semibold mb-0.5" style={{ color: "var(--text)" }}>Relatório em PDF</p>
        <p className="text-[12px] mb-3" style={{ color: "var(--tertiary)" }}>Resumo, atrasadas, tarefas em aberto por categoria e o que você concluiu na semana.</p>
        <button onClick={exportPdf} className={btn} style={{ background: "var(--accent)", color: "#fff" }}>
          <Download size={14} /> Exportar relatório PDF
        </button>
      </div>
    </div>
  );
}

// ── OKRs ──────────────────────────────────────────────────────────
export function OkrSection({ isDark }: { isDark: boolean }) {
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";

  return (
    <div className="space-y-3">
      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-3 flex items-center gap-1.5`}>
          <Target size={12} className="text-emerald-400" /> Metas Pessoais (OKRs)
        </p>
        {OKRS.map(okr => {
          const pct = Math.round((okr.current / okr.target) * 100);
          return (
            <div key={okr.id} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <p className={`text-xs font-medium ${text} flex-1`}>{okr.goal}</p>
                <span className="text-xs font-mono font-bold text-indigo-400 ml-2">{pct}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
                <div className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                  style={{ width: `${pct}%` }} />
              </div>
              <p className={`text-[10px] ${sub}`}>{okr.current} / {okr.target} {okr.unit}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── JSON Rules ────────────────────────────────────────────────────
export function RulesSection({ isDark }: { isDark: boolean }) {
  const [rules, setRules] = useState(JSON_RULES);
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";

  return (
    <div className="space-y-3">
      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2 flex items-center gap-1.5`}>
          <Code2 size={12} className="text-teal-400" /> Regras Automáticas (Se → Então)
        </p>
        {rules.map(rule => (
          <div key={rule.id} className={`mb-3 rounded-xl border p-2.5 transition-all ${rule.active ? "border-teal-500/30 bg-teal-500/5" : "border-slate-700/50 bg-slate-700/20 opacity-60"}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-semibold ${rule.active ? "text-teal-400" : sub}`}>Regra #{rule.id.slice(-1)}</span>
              <button onClick={() => setRules(rs => rs.map(r => r.id === rule.id ? { ...r, active: !r.active } : r))}
                className={`w-8 h-4 rounded-full transition-colors ${rule.active ? "bg-teal-500" : "bg-slate-600"} relative`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${rule.active ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div className={`${isDark ? "bg-slate-900/60" : "bg-slate-50"} rounded-lg p-2 font-mono text-[10px]`}>
              <p className="text-amber-400">IF: <span className="text-slate-300">{rule.condition}</span></p>
              <p className="text-emerald-400 mt-0.5">THEN: <span className="text-slate-300">{rule.action}</span></p>
            </div>
          </div>
        ))}
        <button className="w-full py-2 rounded-xl border border-dashed border-teal-500/30 text-teal-400 text-xs hover:bg-teal-500/10 transition-colors flex items-center justify-center gap-1.5">
          <Code2 size={11} /> Adicionar Nova Regra
        </button>
      </div>
    </div>
  );
}

// ── Daily Close ───────────────────────────────────────────────────
export function DailySection({ isDark }: { isDark: boolean }) {
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const { tasks } = useTasks();
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 864e5);
  const doneToday = tasks.filter(t => isDone(t) && sameDay(t.updatedAt, now));
  const tomorrowTasks = tasks.filter(t => !isDone(t) && sameDay(t.dueDate, tomorrow));
  const quickest = tasks.filter(t => !isDone(t) && parseEffort(t.effort) > 0)
    .sort((a, b) => parseEffort(a.effort) - parseEffort(b.effort))[0];
  const checkpoints = [25, 50, 75, 100];

  return (
    <div className="space-y-3">
      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-3 flex items-center gap-1.5`}>
          <Moon size={12} className="text-indigo-400" /> Fechamento Diário — D+1
        </p>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 mb-3">
          <p className="text-xs font-semibold text-emerald-400 mb-1">Entregues Hoje</p>
          {doneToday.length === 0 && <p className="text-xs text-emerald-300">Nada concluído hoje ainda.</p>}
          {doneToday.map(t => (
            <p key={t.id} className="text-xs text-emerald-300">— {t.title}</p>
          ))}
        </div>
        <p className={`text-xs font-semibold ${text} mb-2`}>Planejamento D+1 — Amanhã</p>
        {tomorrowTasks.length === 0 && <p className={`text-xs ${sub}`}>Nenhuma tarefa com prazo amanhã.</p>}
        {tomorrowTasks.map(t => (
          <div key={t.id} className="flex items-center gap-2 py-1.5 border-b border-slate-700/30 last:border-0">
            <button onClick={() => setChecked(c => ({ ...c, [t.id]: !c[t.id] }))} className="flex-none">
              {checked[t.id] ? <CheckCircle2 size={14} className="text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600" />}
            </button>
            <span className={`text-xs flex-1 ${checked[t.id] ? "line-through text-slate-500" : text}`}>{t.title}</span>
            <span className="text-[10px] font-mono text-slate-500">{t.effort}</span>
          </div>
        ))}
      </div>

      <div className={`${card} border border-amber-500/20 rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2 flex items-center gap-1.5`}>
          <Zap size={12} className="text-amber-400" /> Anti-Procrastinação — Task do Momento
        </p>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
          <p className="text-xs font-bold text-amber-300 mb-0.5">
            {quickest ? `Iniciar agora: ${quickest.title}` : "Nenhuma tarefa pendente"}
          </p>
          {quickest && <p className={`text-[10px] ${sub}`}>A mais rápida da lista • {quickest.effort}</p>}
          <button className="mt-2 w-full py-1.5 rounded-lg bg-amber-500/30 text-amber-300 text-xs font-semibold">
            ▶ Iniciar Agora
          </button>
        </div>
      </div>

      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-2`}>Checkpoints — Entrega do TCC</p>
        <div className="flex gap-2">
          {checkpoints.map(cp => (
            <div key={cp} className="flex-1 text-center">
              <div className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold mb-1 ${checked[`cp${cp}`] ? "bg-indigo-500 text-white" : isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}
                onClick={() => setChecked(c => ({ ...c, [`cp${cp}`]: !c[`cp${cp}`] }))}>
                {cp}%
              </div>
              <p className={`text-[8px] ${sub}`}>{cp === 25 ? "2 dias" : cp === 50 ? "4 dias" : cp === 75 ? "6 dias" : "8 dias"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
