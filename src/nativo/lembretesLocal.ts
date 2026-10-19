import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useTasks, isDone, type AppTask } from "../telas/tarefas/context/TaskContext";

// Distância em metros entre dois pontos (fórmula de haversine)
export function distanceM(a: { latitude: number; longitude: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.latitude) * rad;
  const dLng = (b.lng - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371e3 * Math.asin(Math.sqrt(h));
}

export const fmtDist = (m: number) => m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;

// id numérico estável para a notificação (o Android exige int)
const notifId = (taskId: string) => [...taskId].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7) & 0x7fffffff;

async function notifyNative(t: AppTask) {
  if (!Capacitor.isNativePlatform()) return;
  if ((await LocalNotifications.requestPermissions()).display !== "granted") return;
  await LocalNotifications.schedule({
    notifications: [{ id: notifId(t.id), title: `Você está perto de ${t.location!.label}`, body: t.title, extra: { taskId: t.id } }],
  });
}

// shortcut: o monitoramento roda com o app aberto (primeiro plano); geofencing em segundo plano exigiria
// um plugin de localização em background e a permissão ACCESS_BACKGROUND_LOCATION
export function useLocationReminders(onOpenTask: (id: string) => void) {
  const { tasks, notify } = useTasks();
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const active = tasks.some(t => t.location && !isDone(t));

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const sub = LocalNotifications.addListener("localNotificationActionPerformed", e => {
      const id = e.notification.extra?.taskId;
      if (id) onOpenTask(id);
    });
    return () => { sub.then(s => s.remove()); };
  }, [onOpenTask]);

  useEffect(() => {
    if (!active) return;
    const inside = new Set<string>();
    let watchId: string | null = null;
    let cancelled = false;
    Geolocation.watchPosition({ enableHighAccuracy: true }, pos => {
      if (!pos) return;
      for (const t of tasksRef.current) {
        if (!t.location || isDone(t)) continue;
        const d = distanceM(pos.coords, t.location);
        if (d <= t.location.radius && !inside.has(t.id)) {
          inside.add(t.id);
          notify(`📍 Perto de ${t.location.label}: ${t.title}`);
          notifyNative(t).catch(() => {});
        } else if (d > t.location.radius * 1.5) {
          inside.delete(t.id); // saiu da área: avisa de novo na próxima vez que chegar
        }
      }
    }).then(id => { if (cancelled) Geolocation.clearWatch({ id }); else watchId = id; }).catch(() => {});
    return () => { cancelled = true; if (watchId) Geolocation.clearWatch({ id: watchId }); };
  }, [active, notify]);
}
