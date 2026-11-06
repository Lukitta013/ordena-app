import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications, type LocalNotificationSchema } from "@capacitor/local-notifications";
import { useTasks, isDone, sameDay, type AppTask } from "../telas/tarefas/context/TaskContext";

// Alertas progressivos de prazo e resumo diário (US11), com notificações agendadas no Android.
// Ficam agendadas no sistema, então chegam mesmo com o app fechado.

export type AlertConfig = { enabled: boolean; summary: boolean; summaryHour: number };
const CFG_KEY = "ordena-alertas";
const IDS_KEY = "ordena-alertas-ids";

const read = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) ?? "") as T; } catch { return fallback; }
};
export const loadAlertConfig = () => read<AlertConfig>(CFG_KEY, { enabled: false, summary: true, summaryHour: 8 });
export const saveAlertConfig = (c: AlertConfig) => localStorage.setItem(CFG_KEY, JSON.stringify(c));

// Régua de avisos: quanto falta para o prazo em cada notificação
export const STEPS = [
  { h: 24, label: "Vence em 1 dia" },
  { h: 2, label: "Vence em 2 horas" },
  { h: 0.5, label: "Vence em 30 minutos" },
  { h: 0, label: "O prazo chegou" },
];

// id numérico estável (o Android exige int); "salt" separa os avisos da mesma tarefa
const hashId = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 11) & 0x7fffffff;

export function summaryText(tasks: AppTask[], day: Date) {
  const open = tasks.filter(t => !isDone(t));
  const dueToday = open.filter(t => sameDay(t.dueDate, day)).length;
  const late = open.filter(t => new Date(t.dueDate) < new Date(day.toDateString())).length;
  const parts = [`${dueToday} vence${dueToday === 1 ? "" : "m"} hoje`];
  if (late) parts.push(`${late} atrasada${late === 1 ? "" : "s"}`);
  parts.push(`${open.length} em aberto`);
  return parts.join(" · ");
}

function buildNotifications(tasks: AppTask[], cfg: AlertConfig): LocalNotificationSchema[] {
  const now = Date.now();
  const list: LocalNotificationSchema[] = [];
  for (const t of tasks) {
    if (isDone(t)) continue;
    const due = new Date(t.dueDate).getTime();
    for (const s of STEPS) {
      const at = due - s.h * 36e5;
      if (at <= now) continue;
      list.push({ id: hashId(`${t.id}:${s.h}`), title: s.label, body: t.title, schedule: { at: new Date(at), allowWhileIdle: true }, extra: { taskId: t.id } });
    }
  }
  // shortcut: o resumo é calculado ao agendar (7 dias à frente) e refeito sempre que as tarefas mudam ou o app abre
  if (cfg.summary) {
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setDate(day.getDate() + i);
      day.setHours(cfg.summaryHour, 0, 0, 0);
      if (day.getTime() <= now) continue;
      list.push({ id: hashId(`resumo:${i}`), title: "Resumo do dia", body: summaryText(tasks, day), schedule: { at: day, allowWhileIdle: true } });
    }
  }
  return list;
}

// Uma reprogramação por vez, para não cancelar o que a anterior acabou de agendar
let queue: Promise<unknown> = Promise.resolve();
export function rescheduleAlerts(tasks: AppTask[]) {
  const run = queue.then(async () => {
    const old = read<number[]>(IDS_KEY, []);
    if (old.length) await LocalNotifications.cancel({ notifications: old.map(id => ({ id })) });
    const cfg = loadAlertConfig();
    const list = cfg.enabled ? buildNotifications(tasks, cfg) : [];
    if (list.length) await LocalNotifications.schedule({ notifications: list });
    localStorage.setItem(IDS_KEY, JSON.stringify(list.map(n => n.id)));
    return list.length;
  });
  queue = run.catch(() => {});
  return run;
}

export async function requestNotificationAccess() {
  if (!Capacitor.isNativePlatform()) return false;
  return (await LocalNotifications.requestPermissions()).display === "granted";
}

// Resumo na hora (botão "Enviar resumo agora")
export async function sendSummaryNow(tasks: AppTask[]) {
  const body = summaryText(tasks, new Date());
  if (await requestNotificationAccess())
    await LocalNotifications.schedule({ notifications: [{ id: hashId("resumo:agora"), title: "Resumo do dia", body }] });
  return body;
}

// Com os alertas ligados, cada mudança nas tarefas reprograma as notificações alguns segundos depois
export function useDeadlineAlerts() {
  const { tasks } = useTasks();
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !loadAlertConfig().enabled) return;
    const timer = setTimeout(() => { rescheduleAlerts(tasks).catch(() => {}); }, 3000);
    return () => clearTimeout(timer);
  }, [tasks]);
}
