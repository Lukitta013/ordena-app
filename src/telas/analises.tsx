import { useState, useEffect, useRef } from "react";
import { Zap, Code2, Moon, Download, Target, X, Play, Pause, CheckCircle2, RefreshCw, Coffee } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Area, AreaChart, CartesianGrid,
} from "recharts";
import { PRODUCTIVITY_DATA, MONTHLY_DATA, GANTT_TASKS, TASKS, JSON_RULES, OKRS } from "../mock/mockData";
import { useTasks, isDone, isOverdue, sameDay, parseEffort } from "./tarefas/context/TaskContext";



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

// ── Gantt ─────────────────────────────────────────────────────────
export function GanttSection({ isDark }: { isDark: boolean }) {
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";
  const totalDays = 13;
  const dayLabels = Array.from({ length: totalDays }, (_, i) => `D${i + 1}`);

  return (
    <div className={`${card} border rounded-xl p-3`}>
      <p className={`text-xs font-semibold ${text} mb-3`}>Cronograma de Gantt Interativo</p>
      <div className="overflow-x-auto scrollbar-hide">
        <div style={{ minWidth: 520 }}>
          {/* Header */}
          <div className="flex mb-1">
            <div className="w-32 flex-none" />
            <div className="flex flex-1">
              {dayLabels.map(d => (
                <div key={d} className="flex-1 text-center text-[9px] text-slate-500 font-mono">{d}</div>
              ))}
            </div>
          </div>
          {/* Grid */}
          {GANTT_TASKS.map(task => (
            <div key={task.id} className="flex items-center mb-2 group">
              <div className="w-32 flex-none pr-2">
                <p className={`text-[10px] font-medium ${text} truncate`}>{task.title}</p>
              </div>
              <div className="flex flex-1 relative h-6">
                {/* Background grid */}
                {dayLabels.map((_, i) => (
                  <div key={i} className="flex-1 border-l border-slate-700/20" />
                ))}
                {/* Task bar */}
                <div
                  className="absolute top-0.5 bottom-0.5 rounded-md flex items-center px-2 cursor-pointer hover:brightness-110 transition-all shadow-lg"
                  style={{
                    left: `${(task.start / totalDays) * 100}%`,
                    width: `${(task.duration / totalDays) * 100}%`,
                    background: task.color,
                    opacity: 0.85,
                  }}
                >
                  <span className="text-white text-[9px] font-semibold truncate">{task.title}</span>
                </div>
              </div>
            </div>
          ))}
          {/* Dependency arrows hint */}
          <div className="mt-2 pt-2 border-t border-slate-700/30">
            <p className="text-[10px] text-slate-500 text-center">↔ Barras interativas • Setas de dependência: Pesquisa → Introdução → Slides → Entrega</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {GANTT_TASKS.map(t => (
          <div key={t.id} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: t.color }} />
            <span className="text-[9px] text-slate-500">{t.title}</span>
          </div>
        ))}
      </div>
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

// ── Backup & PDF ──────────────────────────────────────────────────
export function BackupSection({ isDark }: { isDark: boolean }) {
  const [backing, setBacking] = useState(false);
  const [backupOk, setBackupOk] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const { tasks } = useTasks();
  const done = tasks.filter(isDone);
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200";

  const runBackup = () => {
    setBacking(true);
    setTimeout(() => { setBacking(false); setBackupOk(true); }, 2500);
  };

  return (
    <div className="space-y-3">
      {showPdf && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-[390px] bg-slate-900 border border-slate-700 rounded-t-3xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-100 font-semibold text-sm">Relatório Analítico — Preview</p>
              <button onClick={() => setShowPdf(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="bg-white rounded-xl p-4 text-slate-900 space-y-3">
              <div className="border-b border-slate-200 pb-2">
                <p className="text-sm font-bold">ORDENA — Relatório Executivo</p>
                <p className="text-xs text-slate-500">Gerado em: {new Date().toLocaleDateString("pt-BR")}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">Resumo da Semana</p>
                <p className="text-xs text-slate-500">Tarefas: {tasks.length} | Concluídas: {done.length} | Atrasadas: {tasks.filter(isOverdue).length}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">Tarefas Concluídas</p>
                {done.length === 0 && <p className="text-xs text-slate-500">Nenhuma ainda.</p>}
                {done.slice(0, 5).map(t => (
                  <p key={t.id} className="text-xs text-slate-500">— {t.title}</p>
                ))}
              </div>
            </div>
            <button className="mt-3 w-full py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold">
              ⬇ Baixar PDF
            </button>
          </div>
        </div>
      )}

      <div className={`${card} border rounded-xl p-3`}>
        <p className={`text-xs font-semibold ${text} mb-3`}>Backup em Nuvem</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { name: "Google Drive", icon: "🔵", status: "Ativo", last: "Hoje, 07:00" },
            { name: "Dropbox", icon: "📦", status: "Ativo", last: "Hoje, 07:00" },
          ].map(b => (
            <div key={b.name} className={`${isDark ? "bg-slate-700/50" : "bg-slate-100"} rounded-xl p-2.5`}>
              <p className="text-sm mb-1">{b.icon}</p>
              <p className={`text-xs font-medium ${text}`}>{b.name}</p>
              <p className="text-[10px] text-emerald-400">{b.status}</p>
              <p className={`text-[9px] ${sub}`}>{b.last}</p>
            </div>
          ))}
        </div>
        {backupOk && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-2 mb-2 flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className="text-xs text-emerald-300">Backup concluído com sucesso! {tasks.length} tarefas, {new Set(tasks.map(t => t.project)).size} projetos.</span>
          </div>
        )}
        <button onClick={runBackup}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition-colors">
          <RefreshCw size={12} className={backing ? "animate-spin" : ""} />
          {backing ? "Executando backup..." : "Executar Backup Imediato"}
        </button>
      </div>

      <button onClick={() => setShowPdf(true)}
        className="w-full py-3 rounded-xl bg-[#4F6BED] hover:bg-[#3F5BD9] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
        <Download size={15} /> Exportar Relatório PDF
      </button>
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
