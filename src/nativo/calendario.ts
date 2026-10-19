import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { CapacitorCalendar } from "@ebarooni/capacitor-calendar";
import { useTasks, isDone, parseEffort, type AppTask } from "../telas/tarefas/context/TaskContext";

// Integração com o calendário do Android (CalendarContract). Escolhendo um calendário da conta Google,
// o próprio Android sincroniza os eventos com o Google Calendar, sem precisar de login no app.

export const isNative = Capacitor.isNativePlatform();

export type CalConfig = { enabled: boolean; calendarId?: string; lastSync?: string };
const CFG_KEY = "ordena-calendario";
const MAP_KEY = "ordena-calendario-eventos";
type EventMap = Record<string, { eventId: string; updatedAt: string }>;

const read = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) ?? "") as T; } catch { return fallback; }
};
export const loadCalConfig = () => read<CalConfig>(CFG_KEY, { enabled: false });
export const saveCalConfig = (c: CalConfig) => localStorage.setItem(CFG_KEY, JSON.stringify(c));

export async function requestCalendarAccess() {
  const { result } = await CapacitorCalendar.requestFullCalendarAccess();
  return result === "granted";
}

export async function listWritableCalendars() {
  const { result } = await CapacitorCalendar.listCalendars();
  return result.filter(c => c.allowsContentModifications !== false);
}

// O evento termina no prazo e começa "esforço" antes dele (mínimo 30 min, 1h sem esforço informado)
function eventFor(t: AppTask) {
  const endDate = new Date(t.dueDate).getTime();
  const hours = Math.max(0.5, parseEffort(t.effort) || 1);
  return {
    title: t.title,
    description: [t.description, `${t.project} · Prioridade ${t.priority}`, "Criado pelo Ordena"].filter(Boolean).join("\n\n"),
    startDate: endDate - hours * 36e5,
    endDate,
    location: t.location?.label,
    alerts: [-30],
  };
}

// Abre a tela "novo evento" do app de calendário (ou baixa um .ics no navegador)
export const addToCalendarPrompt = (t: AppTask) => CapacitorCalendar.createEventWithPrompt(eventFor(t));

// Uma sincronização por vez: a automática e a do botão não podem criar o mesmo evento duas vezes
let queue: Promise<unknown> = Promise.resolve();
export function syncTasks(tasks: AppTask[], calendarId?: string) {
  const run = queue.then(() => doSync(tasks, calendarId));
  queue = run.catch(() => {});
  return run;
}

// Com a sincronização ligada, cada mudança nas tarefas vai para o calendário alguns segundos depois
export function useCalendarAutoSync() {
  const { tasks } = useTasks();
  useEffect(() => {
    const cfg = loadCalConfig();
    if (!isNative || !cfg.enabled) return;
    const timer = setTimeout(() => { syncTasks(tasks, cfg.calendarId).catch(() => {}); }, 3000);
    return () => clearTimeout(timer);
  }, [tasks]);
}

// Tarefas abertas viram eventos; tarefas concluídas ou excluídas têm o evento removido
async function doSync(tasks: AppTask[], calendarId?: string) {
  const map = read<EventMap>(MAP_KEY, {});
  let created = 0, updated = 0, removed = 0;
  const create = async (t: AppTask) => {
    const { id } = await CapacitorCalendar.createEvent({ ...eventFor(t), calendarId });
    if (id) map[t.id] = { eventId: id, updatedAt: t.updatedAt };
    created++;
  };
  for (const t of tasks.filter(x => !isDone(x))) {
    const known = map[t.id];
    if (!known) { await create(t); continue; }
    if (known.updatedAt === t.updatedAt) continue;
    try {
      await CapacitorCalendar.modifyEvent({ id: known.eventId, ...eventFor(t) });
      map[t.id] = { ...known, updatedAt: t.updatedAt };
      updated++;
    } catch {
      await create(t); // o evento foi apagado direto no calendário
    }
  }
  const open = new Set(tasks.filter(x => !isDone(x)).map(x => x.id));
  for (const [taskId, { eventId }] of Object.entries(map)) {
    if (open.has(taskId)) continue;
    await CapacitorCalendar.deleteEvent({ id: eventId }).catch(() => {});
    delete map[taskId];
    removed++;
  }
  localStorage.setItem(MAP_KEY, JSON.stringify(map));
  saveCalConfig({ ...loadCalConfig(), lastSync: new Date().toISOString() });
  return { created, updated, removed };
}

// Desligar a sincronização apaga do calendário os eventos que o Ordena criou
export async function removeAllEvents() {
  const map = read<EventMap>(MAP_KEY, {});
  for (const { eventId } of Object.values(map)) await CapacitorCalendar.deleteEvent({ id: eventId }).catch(() => {});
  localStorage.removeItem(MAP_KEY);
}
