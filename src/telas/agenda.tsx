import { useState, useEffect } from "react";
import {
  MapPin, Copy, Bell, Search, RefreshCw, CheckCircle2, Mail, Repeat, BookmarkPlus, Trash2, Plus, LocateFixed,
  Archive, ArchiveRestore, History, Download,
} from "lucide-react";
import { Geolocation, type Position } from "@capacitor/geolocation";
import { useTasks, isDone, deriveQuadrant, toLocalInput, FALLBACK_CATEGORY } from "./tarefas/context/TaskContext";
import { fuzzyMatch } from "./tarefas/utils/busca";
import { parseEmail } from "./tarefas/utils/email";
import {
  loadAlertConfig, saveAlertConfig, rescheduleAlerts, requestNotificationAccess, sendSummaryNow, summaryText, STEPS,
  type AlertConfig,
} from "../nativo/alertasPrazo";
import { TaskDetailModal } from "./tarefas";
import { distanceM, fmtDist } from "../nativo/lembretesLocal";
import {
  isNative, loadCalConfig, saveCalConfig, requestCalendarAccess, listWritableCalendars, syncTasks, removeAllEvents,
  listImportableEvents, markImported, type CalConfig, type CalEvent,
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
      <ImportEvents />
    </div>
  );
}

// Eventos do calendário (inclusive Google Calendar) viram tarefas: o caminho de volta da sincronização
function ImportEvents() {
  const { createTask } = useTasks();
  const [events, setEvents] = useState<CalEvent[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setBusy(true);
    setMsg("");
    try {
      if (!(await requestCalendarAccess())) setMsg("Permita o acesso ao calendário nas configurações do Android.");
      else setEvents(await listImportableEvents());
    } catch { setMsg("Não foi possível ler o calendário."); }
    setBusy(false);
  };

  const importOne = (e: CalEvent) => {
    const dueDate = toLocalInput(e.due);
    const h = Math.floor(e.minutes / 60), m = e.minutes % 60;
    createTask({
      title: e.title, description: e.description, project: FALLBACK_CATEGORY, priority: "Média", status: "Pendente",
      dueDate, effort: e.minutes ? `${h ? `${h}h` : ""}${m ? `${m}${h ? "" : "m"}` : ""}` : "", quadrant: deriveQuadrant("Média", dueDate),
      subtasks: [], tags: ["calendario"],
    });
    markImported(e.id);
    setEvents(prev => prev?.filter(x => x.id !== e.id) ?? null);
  };

  return (
    <div className={card} style={cardStyle}>
      <p className="text-[13px] font-semibold mb-0.5" style={{ color: "var(--text)" }}>Trazer eventos do calendário</p>
      <p className="text-[12px] mb-2" style={{ color: "var(--tertiary)" }}>Eventos dos próximos 30 dias, do calendário do Android e do Google Calendar, viram tarefas com prazo no início do evento.</p>
      {events === null ? (
        <button onClick={load} disabled={busy} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-medium disabled:opacity-50" style={smallBtnStyle}>
          <Download size={12} /> {busy ? "Lendo o calendário..." : "Ver eventos"}
        </button>
      ) : events.length === 0 ? (
        <p className="text-[12px] py-2" style={{ color: "var(--sub)" }}>Nenhum evento novo nos próximos 30 dias.</p>
      ) : events.map(e => (
        <div key={e.id} className="flex items-center gap-2 py-2.5 last:border-0" style={rowStyle}>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: "var(--text)" }}>{e.title}</p>
            <p className="text-[11px]" style={{ color: "var(--sub)" }}>
              {e.due.toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button onClick={() => importOne(e)} className={smallBtn} style={{ background: "var(--accent)", color: "#fff" }}>
            <Plus size={12} /> Tarefa
          </button>
        </div>
      ))}
      {msg && <p className="text-[12px] mt-2" style={{ color: "var(--sub)" }}>{msg}</p>}
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

  return (
    <div className="space-y-3">
      <AlertSettings />
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

    </div>
  );
}

// Liga as notificações de prazo e o resumo diário (US11)
function AlertSettings() {
  const { tasks, notify } = useTasks();
  const [cfg, setCfg] = useState<AlertConfig>(loadAlertConfig);
  const [msg, setMsg] = useState("");
  const native = isNative;

  const apply = async (next: AlertConfig) => {
    if (next.enabled && !(await requestNotificationAccess())) {
      setMsg("Permita as notificações do Ordena nas configurações do Android.");
      return;
    }
    setCfg(next);
    saveAlertConfig(next);
    const n = await rescheduleAlerts(tasks).catch(() => 0);
    setMsg(next.enabled ? `${n} aviso${n === 1 ? "" : "s"} agendado${n === 1 ? "" : "s"}.` : "Notificações de prazo desligadas.");
  };
  const sendNow = async () => {
    if (!native) { notify(`Resumo do dia: ${summaryText(tasks, new Date())}`); return; }
    await sendSummaryNow(tasks).catch(() => {});
  };

  const toggleRow = (label: string, sub: string, on: boolean, onClick: () => void) => (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{label}</p>
        <p className="text-[11px]" style={{ color: "var(--sub)" }}>{sub}</p>
      </div>
      <button role="switch" aria-checked={on} aria-label={label} onClick={onClick} disabled={!native}
        className="relative w-11 h-6 rounded-full transition-colors flex-none disabled:opacity-40" style={{ background: on ? "var(--success)" : "var(--border)" }}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );

  return (
    <div className={card} style={cardStyle}>
      <p className="text-[13px] font-semibold mb-1 flex items-center gap-1.5" style={{ color: "var(--text)" }}><Bell size={13} /> Notificações</p>
      {toggleRow("Avisos de prazo", STEPS.map(s => s.label.replace("Vence em ", "")).slice(0, 3).join(", ") + " antes e no prazo", cfg.enabled, () => apply({ ...cfg, enabled: !cfg.enabled }))}
      {cfg.enabled && toggleRow(`Resumo diário às ${cfg.summaryHour}h`, "Quantas vencem hoje, atrasadas e em aberto", cfg.summary, () => apply({ ...cfg, summary: !cfg.summary }))}
      {cfg.enabled && cfg.summary && (
        <select className="w-full text-[13px] px-3 py-2 mt-1 rounded-lg outline-none" style={{ background: "var(--sunken)", border: "1px solid var(--border)", color: "var(--text)" }}
          value={cfg.summaryHour} onChange={e => apply({ ...cfg, summaryHour: Number(e.target.value) })} aria-label="Hora do resumo diário">
          {[6, 7, 8, 9, 10, 12, 18, 20].map(h => <option key={h} value={h}>Resumo às {h}h</option>)}
        </select>
      )}
      {!native && <p className="text-[12px] mt-1" style={{ color: "var(--sub)" }}>As notificações funcionam no app Android.</p>}
      <button onClick={sendNow} className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-medium" style={smallBtnStyle}>
        <Bell size={12} /> Ver resumo agora
      </button>
      {msg && <p className="text-[12px] mt-2" style={{ color: "var(--sub)" }}>{msg}</p>}
    </div>
  );
}

// ── Busca, histórico e arquivo (US12) ─────────────────────────────
export function SearchSection({ isDark }: { isDark: boolean }) {
  const { tasks, archivedTasks, history, updateTask } = useTasks();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const all = [...tasks, ...archivedTasks];
  const results = q.trim().length >= 2
    ? all.filter(t => fuzzyMatch(q, [t.title, t.description, t.project, ...(t.tags ?? []), ...(t.notes ?? []).map(n => n.text)].join(" ")))
    : [];
  const doneActive = tasks.filter(isDone);
  const open = tasks.find(t => t.id === openId);
  const fmtWhen = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const shownHistory = showAll ? history : history.slice(0, 15);

  return (
    <div className="space-y-3">
      <div className={card} style={cardStyle}>
        <p className="text-[13px] font-semibold mb-0.5" style={{ color: "var(--text)" }}>Buscar em todas as tarefas</p>
        <p className="text-[12px] mb-2" style={{ color: "var(--tertiary)" }}>Procura no título, descrição, categoria, tags e anotações, inclusive nas arquivadas. Aceita erros de digitação e falta de acento.</p>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "var(--sunken)", border: "1px solid var(--border)" }}>
          <Search size={13} style={{ color: "var(--sub)" }} />
          <input className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: "var(--text)" }}
            placeholder='Ex: "relatrio", "fatra", "estatistica"' value={q} onChange={e => setQ(e.target.value)} />
        </div>
        {q.trim().length >= 2 && results.length === 0 && <p className="text-[12px] py-2" style={{ color: "var(--sub)" }}>Nada encontrado.</p>}
        {results.map(t => (
          <div key={t.id} className="flex items-center gap-2 py-2.5 last:border-0" style={rowStyle}>
            <button onClick={() => !t.archived && setOpenId(t.id)} className="flex-1 min-w-0 text-left">
              <p className={`text-[13px] font-medium truncate ${isDone(t) ? "line-through" : ""}`} style={{ color: "var(--text)" }}>{t.title}</p>
              <p className="text-[11px]" style={{ color: "var(--sub)" }}>{t.project} · {t.archived ? "Arquivada" : t.status}</p>
            </button>
            {t.archived && (
              <button onClick={() => updateTask(t.id, { archived: false })} className={smallBtn} style={smallBtnStyle}>
                <ArchiveRestore size={12} /> Desarquivar
              </button>
            )}
          </div>
        ))}
      </div>

      <div className={card} style={cardStyle}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>Arquivadas ({archivedTasks.length})</p>
          {doneActive.length > 0 && (
            <button onClick={() => doneActive.forEach(t => updateTask(t.id, { archived: true }))} className={smallBtn} style={smallBtnStyle}>
              <Archive size={12} /> Arquivar {doneActive.length} concluída{doneActive.length === 1 ? "" : "s"}
            </button>
          )}
        </div>
        <p className="text-[12px] mb-1" style={{ color: "var(--tertiary)" }}>Arquivar tira a tarefa da lista, da agenda e dos alertas sem apagar. Use o botão de arquivo no detalhe da tarefa.</p>
        {archivedTasks.length === 0 && <p className="text-[12px] py-2" style={{ color: "var(--sub)" }}>Nenhuma tarefa arquivada.</p>}
        {archivedTasks.map(t => (
          <div key={t.id} className="flex items-center gap-2 py-2.5 last:border-0" style={rowStyle}>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: "var(--text)" }}>{t.title}</p>
              <p className="text-[11px]" style={{ color: "var(--sub)" }}>{t.project} · {t.status}</p>
            </div>
            <button onClick={() => updateTask(t.id, { archived: false })} className={smallBtn} style={smallBtnStyle}>
              <ArchiveRestore size={12} /> Desarquivar
            </button>
          </div>
        ))}
      </div>

      <div className={card} style={cardStyle}>
        <p className="text-[13px] font-semibold mb-1 flex items-center gap-1.5" style={{ color: "var(--text)" }}>
          <History size={13} /> Histórico de atividades
        </p>
        {history.length === 0 && <p className="text-[12px] py-2" style={{ color: "var(--sub)" }}>Nada ainda. Crie, conclua ou edite uma tarefa e ela aparece aqui.</p>}
        {shownHistory.map(h => (
          <div key={h.id} className="flex items-start gap-2 py-2 last:border-0" style={rowStyle}>
            <span className="text-[11px] font-mono flex-none w-[84px]" style={{ color: "var(--tertiary)" }}>{fmtWhen(h.at)}</span>
            <p className="text-[12px] min-w-0" style={{ color: "var(--text)" }}>
              <strong>{h.action}</strong> <span style={{ color: "var(--sub)" }}>{h.title}</span>
            </p>
          </div>
        ))}
        {history.length > 15 && (
          <button onClick={() => setShowAll(s => !s)} className="w-full text-[12px] pt-2" style={{ color: "var(--accent)" }}>
            {showAll ? "Mostrar menos" : `Ver tudo (${history.length})`}
          </button>
        )}
      </div>
      {open && <TaskDetailModal task={open} isDark={isDark} onClose={() => setOpenId(null)} />}
    </div>
  );
}

// ── Recorrentes e e-mail → tarefa (US13) ──────────────────────────
export function RecurSection({ isDark }: { isDark: boolean }) {
  const { tasks, createTask } = useTasks();
  const [openId, setOpenId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState<{ title: string; dueDate: string; body: string } | null>(null);
  const recurring = tasks.filter(t => t.recurrence && !isDone(t));
  const open = tasks.find(t => t.id === openId);
  const inp = "w-full text-[13px] px-3 py-2 rounded-lg outline-none";
  const inpStyle = { background: "var(--sunken)", border: "1px solid var(--border)", color: "var(--text)" };

  const create = () => {
    if (!draft || !draft.title.trim()) return;
    const id = createTask({
      title: draft.title.trim(), description: draft.body, project: FALLBACK_CATEGORY, priority: "Média", status: "Pendente",
      dueDate: draft.dueDate, effort: "", quadrant: deriveQuadrant("Média", draft.dueDate), subtasks: [], tags: ["email"],
    });
    setDraft(null);
    setEmail("");
    setOpenId(id);
  };

  return (
    <div className="space-y-3">
      <div className={card} style={cardStyle}>
        <p className="text-[13px] font-semibold mb-0.5 flex items-center gap-1.5" style={{ color: "var(--text)" }}><Repeat size={13} /> Tarefas recorrentes</p>
        <p className="text-[12px] mb-1" style={{ color: "var(--tertiary)" }}>No detalhe da tarefa, em "Repetir", escolha diária, semanal ou mensal. Ao concluir, a próxima é criada sozinha.</p>
        {recurring.length === 0 && <p className="text-[12px] py-2" style={{ color: "var(--sub)" }}>Nenhuma tarefa em aberto se repete.</p>}
        {recurring.map(t => (
          <button key={t.id} onClick={() => setOpenId(t.id)} className="w-full flex items-center gap-2 py-2.5 text-left last:border-0" style={rowStyle}>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: "var(--text)" }}>{t.title}</p>
              <p className="text-[11px]" style={{ color: "var(--sub)" }}>
                {t.recurrence!.freq}{t.recurrence!.left !== undefined ? ` · mais ${t.recurrence!.left} vez${t.recurrence!.left === 1 ? "" : "es"}` : ""}
              </p>
            </div>
            <span className="text-[11px] font-mono flex-none" style={{ color: "var(--tertiary)" }}>
              {new Date(t.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
            </span>
          </button>
        ))}
      </div>

      <div className={card} style={cardStyle}>
        <p className="text-[13px] font-semibold mb-0.5 flex items-center gap-1.5" style={{ color: "var(--text)" }}><Mail size={13} /> E-mail → tarefa</p>
        <p className="text-[12px] mb-2" style={{ color: "var(--tertiary)" }}>Copie o e-mail (assunto e texto) e cole aqui. O Ordena usa o assunto como título e procura o prazo no texto.</p>
        {!draft ? (
          <>
            <textarea rows={5} className={inp} style={inpStyle} value={email} onChange={e => setEmail(e.target.value)}
              placeholder={"Assunto: Entrega do trabalho de Estatística\n\nO trabalho deve ser enviado pelo portal até sexta às 23h59."} />
            <button onClick={() => setDraft({ ...parseEmail(email), body: email.trim() })} disabled={!email.trim()}
              className="w-full mt-2 py-2 rounded-xl text-[12px] font-semibold disabled:opacity-40" style={{ background: "var(--accent)", color: "#fff" }}>
              Ler e-mail
            </button>
          </>
        ) : (
          <>
            <label className="block text-[11px] mb-1" style={{ color: "var(--sub)" }}>Título</label>
            <input className={inp} style={inpStyle} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
            <label className="block text-[11px] mt-2 mb-1" style={{ color: "var(--sub)" }}>Prazo</label>
            <input type="datetime-local" className={inp} style={inpStyle} value={draft.dueDate} min={toLocalInput(new Date())}
              onChange={e => setDraft({ ...draft, dueDate: e.target.value })} />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setDraft(null)} className="px-4 py-2 rounded-xl text-[12px]" style={{ border: "1px solid var(--border)", color: "var(--sub)" }}>Voltar</button>
              <button onClick={create} disabled={!draft.title.trim()} className="flex-1 py-2 rounded-xl text-[12px] font-semibold disabled:opacity-40" style={{ background: "var(--accent)", color: "#fff" }}>
                Criar tarefa
              </button>
            </div>
          </>
        )}
      </div>
      {open && <TaskDetailModal task={open} isDark={isDark} onClose={() => setOpenId(null)} />}
    </div>
  );
}
