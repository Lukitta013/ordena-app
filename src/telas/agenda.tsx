import { useState, useEffect } from "react";
import { MapPin, Copy, Bell, Search, RefreshCw, CheckCircle2, Mail, Repeat, BookmarkPlus, Trash2, Plus, LocateFixed } from "lucide-react";
import { Geolocation, type Position } from "@capacitor/geolocation";
import { AUDIT_LOG } from "../mock/mockData";
import { useTasks, isDone, isOverdue } from "./tarefas/context/TaskContext";
import { TaskDetailModal } from "./tarefas";
import { distanceM, fmtDist } from "../nativo/lembretesLocal";
import {
  isNative, loadCalConfig, saveCalConfig, requestCalendarAccess, listWritableCalendars, syncTasks, removeAllEvents,
  type CalConfig,
} from "../nativo/calendario";

const card = "rounded-xl p-3";
const cardStyle = { background: "var(--surface)", border: "1px solid var(--border)" };
const rowStyle = { borderBottom: "1px solid var(--border)" };
const smallBtn = "flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg flex-none";
const smallBtnStyle = { background: "var(--sunken)", color: "var(--accent)", border: "1px solid var(--border)" };

// ── Lembretes por local (US06) ────────────────────────────────────
export function GpsSection({ isDark }: { isDark: boolean }) {
  const { tasks } = useTasks();
  const [pos, setPos] = useState<Position | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const withLoc = tasks.filter(t => t.location && !isDone(t));
  const open = tasks.find(t => t.id === openId);

  const locate = async () => {
    setBusy(true);
    setError("");
    try { setPos(await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })); }
    catch { setError("Não consegui pegar sua localização. Ligue o GPS e permita o acesso à localização."); }
    setBusy(false);
  };
  useEffect(() => { if (withLoc.length) locate(); }, []);

  return (
    <div className="space-y-3">
      <div className={card} style={cardStyle}>
        <p className="text-[13px]" style={{ color: "var(--text)" }}>
          Abra uma tarefa e, em <strong>Lembrete por local</strong>, marque o lugar onde ela deve ser feita.
          Quando você chegar perto, o Ordena avisa com uma notificação.
        </p>
        <p className="text-[12px] mt-1.5" style={{ color: "var(--tertiary)" }}>
          O aviso funciona enquanto o app está aberto ou em uso recente.
        </p>
      </div>

      <div className={card} style={cardStyle}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>Tarefas com local</p>
          {withLoc.length > 0 && (
            <button onClick={locate} disabled={busy} className={`${smallBtn} disabled:opacity-50`} style={smallBtnStyle}>
              <LocateFixed size={12} /> {busy ? "Localizando..." : "Atualizar"}
            </button>
          )}
        </div>
        {error && <p className="text-[12px] mb-1" style={{ color: "var(--critical)" }}>{error}</p>}
        {withLoc.length === 0 && <p className="text-[12px] py-2" style={{ color: "var(--sub)" }}>Nenhuma tarefa aberta tem local marcado.</p>}
        {withLoc.map(t => {
          const loc = t.location!;
          const d = pos ? distanceM(pos.coords, loc) : null;
          const near = d !== null && d <= loc.radius;
          return (
            <button key={t.id} onClick={() => setOpenId(t.id)} className="w-full flex items-center gap-2 py-2.5 text-left last:border-0" style={rowStyle}>
              <MapPin size={14} className="flex-none" style={{ color: near ? "var(--success)" : "var(--accent)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate" style={{ color: "var(--text)" }}>{loc.label}</p>
                <p className="text-[11px] truncate" style={{ color: "var(--sub)" }}>{t.title}</p>
              </div>
              <span className="text-[11px] font-mono flex-none" style={{ color: near ? "var(--success)" : "var(--tertiary)" }}>
                {d === null ? `${loc.radius} m` : near ? "Você está aqui" : fmtDist(d)}
              </span>
            </button>
          );
        })}
      </div>
      {open && <TaskDetailModal task={open} isDark={isDark} onClose={() => setOpenId(null)} />}
    </div>
  );
}

// ── Duplicação e modelos (US08) ───────────────────────────────────
export function DupSection(_: { isDark: boolean }) {
  const { tasks, templates, duplicateTask, saveTemplate, removeTemplate, createFromTemplate } = useTasks();
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const open = tasks.filter(t => !isDone(t));
  const countSubs = (n: { children: unknown[] }[]): number => n.reduce((s, x) => s + 1 + countSubs(x.children as { children: unknown[] }[]), 0);

  return (
    <div className="space-y-3">
      <div className={card} style={cardStyle}>
        <p className="text-[13px] font-semibold mb-0.5" style={{ color: "var(--text)" }}>Meus modelos</p>
        <p className="text-[12px] mb-1" style={{ color: "var(--tertiary)" }}>Use um modelo para criar a tarefa de novo, com as subtarefas, em um toque.</p>
        {templates.length === 0 && (
          <p className="text-[12px] py-2" style={{ color: "var(--sub)" }}>Nenhum modelo ainda. Salve uma tarefa como modelo na lista abaixo ou pelo detalhe da tarefa.</p>
        )}
        {templates.map(tpl => (
          <div key={tpl.id} className="flex items-center gap-2 py-2.5 last:border-0" style={rowStyle}>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: "var(--text)" }}>{tpl.name}</p>
              <p className="text-[11px]" style={{ color: "var(--sub)" }}>
                {tpl.data.project} · {countSubs(tpl.data.subtasks)} subtarefas{tpl.data.effort ? ` · ${tpl.data.effort}` : ""}
              </p>
            </div>
            <button onClick={() => createFromTemplate(tpl.id)} className={smallBtn} style={{ background: "var(--accent)", color: "#fff" }}>
              <Plus size={12} /> Usar
            </button>
            {confirmDel === tpl.id ? (
              <button onClick={() => { removeTemplate(tpl.id); setConfirmDel(null); }} className="text-[11px] font-semibold px-1.5" style={{ color: "var(--critical)" }}>Excluir?</button>
            ) : (
              <button aria-label={`Excluir modelo ${tpl.name}`} onClick={() => setConfirmDel(tpl.id)} className="p-1.5" style={{ color: "var(--tertiary)" }}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className={card} style={cardStyle}>
        <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--text)" }}>Tarefas em aberto</p>
        {open.length === 0 && <p className="text-[12px] py-2" style={{ color: "var(--sub)" }}>Nenhuma tarefa em aberto.</p>}
        {open.map(task => {
          const saved = templates.some(t => t.name === task.title);
          return (
            <div key={task.id} className="flex items-center gap-2 py-2.5 last:border-0" style={rowStyle}>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate" style={{ color: "var(--text)" }}>{task.title}</p>
                <p className="text-[11px]" style={{ color: "var(--sub)" }}>{countSubs(task.subtasks)} subtarefas{task.effort ? ` · ${task.effort}` : ""}</p>
              </div>
              <button onClick={() => duplicateTask(task.id)} className={smallBtn} style={smallBtnStyle}>
                <Copy size={12} /> Duplicar
              </button>
              <button onClick={() => saveTemplate(task, task.title)} disabled={saved} aria-label="Salvar como modelo"
                className={`${smallBtn} disabled:opacity-40`} style={smallBtnStyle}>
                {saved ? <CheckCircle2 size={12} /> : <BookmarkPlus size={12} />} Modelo
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Calendário do aparelho / Google Calendar (US09) ───────────────
export function CalSection(_: { isDark: boolean }) {
  const { tasks } = useTasks();
  const [cfg, setCfg] = useState<CalConfig>(loadCalConfig);
  const [calendars, setCalendars] = useState<{ id: string; title: string | null; accountName: string | null }[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const update = (c: CalConfig) => { setCfg(c); saveCalConfig(c); };

  const loadCalendars = async () => {
    if (!(await requestCalendarAccess())) { setMsg("Permita o acesso ao calendário nas configurações do Android para sincronizar."); return false; }
    setCalendars(await listWritableCalendars());
    return true;
  };
  useEffect(() => { if (isNative && cfg.enabled) loadCalendars(); }, []);

  const sync = async (c = cfg) => {
    setBusy(true);
    setMsg("");
    try {
      const r = await syncTasks(tasks, c.calendarId);
      setCfg(loadCalConfig());
      setMsg(`Pronto: ${r.created} criados, ${r.updated} atualizados, ${r.removed} removidos.`);
    } catch {
      setMsg("Não foi possível sincronizar. Confira a permissão de calendário.");
    }
    setBusy(false);
  };

  const toggle = async () => {
    if (cfg.enabled) {
      update({ ...cfg, enabled: false });
      await removeAllEvents();
      setMsg("Sincronização desligada. Os eventos criados pelo Ordena foram removidos do calendário.");
      return;
    }
    if (!(await loadCalendars())) return;
    const next = { ...cfg, enabled: true };
    update(next);
    sync(next);
  };

  if (!isNative) {
    return (
      <div className={card} style={cardStyle}>
        <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--text)" }}>Calendário</p>
        <p className="text-[12px]" style={{ color: "var(--sub)" }}>
          A sincronização com o calendário funciona no app Android. Aqui no navegador, use “Adicionar ao calendário”
          no detalhe da tarefa para baixar um arquivo .ics.
        </p>
      </div>
    );
  }

  const lastSync = cfg.lastSync ? new Date(cfg.lastSync).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : null;
  return (
    <div className="space-y-3">
      <div className={card} style={cardStyle}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>Sincronizar com o calendário</p>
            <p className="text-[11px]" style={{ color: "var(--sub)" }}>{lastSync ? `Última sincronização: ${lastSync}` : "Tarefas em aberto viram eventos no prazo"}</p>
          </div>
          <button role="switch" aria-checked={cfg.enabled} aria-label="Sincronizar com o calendário" onClick={toggle}
            className="relative w-11 h-6 rounded-full transition-colors flex-none" style={{ background: cfg.enabled ? "var(--success)" : "var(--border)" }}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${cfg.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        {cfg.enabled && (
          <>
            <label className="block text-[11px] mt-3 mb-1" style={{ color: "var(--sub)" }}>Calendário de destino</label>
            <select className="w-full text-[13px] px-3 py-2 rounded-lg outline-none" style={{ background: "var(--sunken)", border: "1px solid var(--border)", color: "var(--text)" }}
              value={cfg.calendarId ?? ""} onChange={e => update({ ...cfg, calendarId: e.target.value || undefined })}>
              <option value="">Calendário padrão</option>
              {calendars.map(c => <option key={c.id} value={c.id}>{c.title ?? "Sem nome"}{c.accountName ? ` (${c.accountName})` : ""}</option>)}
            </select>
            <p className="text-[11px] mt-1" style={{ color: "var(--tertiary)" }}>
              Escolha um calendário da sua conta Google para os eventos aparecerem também no Google Calendar.
            </p>
            <button onClick={() => sync()} disabled={busy}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-medium disabled:opacity-50" style={smallBtnStyle}>
              <RefreshCw size={12} className={busy ? "animate-spin" : ""} />
              {busy ? "Sincronizando..." : "Sincronizar agora"}
            </button>
          </>
        )}
        {msg && <p className="text-[12px] mt-2" style={{ color: "var(--sub)" }}>{msg}</p>}
      </div>
      <div className={card} style={cardStyle}>
        <p className="text-[12px]" style={{ color: "var(--sub)" }}>
          Com a sincronização ligada, criar, editar, concluir ou excluir uma tarefa atualiza o evento sozinho.
          Cada evento termina no prazo e dura o esforço estimado, com aviso 30 minutos antes.
        </p>
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
            <span className="text-[10px] font-medium text-blue-400">De: secretaria@faculdade.edu.br</span>
          </div>
          <p className={`text-[10px] font-semibold ${text} mb-0.5`}>Assunto: Entrega do trabalho de Estatística</p>
          <p className="text-[10px] text-slate-400">Lembrete: o trabalho deve ser enviado pelo portal até sexta às 23h59.</p>
        </div>
        {converted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-2 flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className="text-xs text-emerald-300">Tarefa criada: "Entrega do trabalho de Estatística"</span>
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