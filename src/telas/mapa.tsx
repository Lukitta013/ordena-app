import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, LocateFixed, X, Navigation, MapPin, Plus } from "lucide-react";
import { Geolocation } from "@capacitor/geolocation";
import {
  useTasks, isDone, deriveQuadrant, toLocalInput, PROJECT_COLORS, FALLBACK_CATEGORY, type Priority,
} from "./tarefas/context/TaskContext";
import { TaskDetailModal } from "./tarefas";
import { distanceM, fmtDist } from "../nativo/lembretesLocal";

// Aba Mapa: as tarefas com local aparecem no mapa (OpenStreetMap, sem chave de API);
// tocar num ponto do mapa ou buscar um endereço cria uma tarefa com lembrete naquele lugar.
// O aviso ao chegar perto é o mesmo do lembrete por local (lembretesLocal.ts).

type Spot = { lat: number; lng: number; label: string };
type Place = { lat: string; lon: string; display_name: string; name?: string };

const NOMINATIM = "https://nominatim.openstreetmap.org";
const DEFAULT_CENTER: L.LatLngTuple = [-23.5505, -46.6333]; // São Paulo, até o GPS responder
const RADII = [100, 200, 500];
const PRIORITIES: Priority[] = ["Alta", "Média", "Baixa"];
const shortName = (p: Place) => p.name || p.display_name.split(",").slice(0, 2).join(",");
export const mapsRoute = (lat: number, lng: number) =>
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");

export default function MapaScreen({ isDark }: { isDark: boolean }) {
  const { tasks, createTask } = useTasks();
  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const taskLayer = useRef<L.LayerGroup | null>(null);
  const draftLayer = useRef<L.LayerGroup | null>(null);
  const meMarker = useRef<L.CircleMarker | null>(null);
  const [me, setMe] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Spot | null>(null);
  const [form, setForm] = useState({ title: "", radius: 200, priority: "Média" as Priority, dueDate: toLocalInput(new Date(Date.now() + 864e5)) });
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [msg, setMsg] = useState("");

  const withLoc = tasks.filter(t => t.location && !isDone(t));
  const selected = tasks.find(t => t.id === selectedId);
  const openTask = tasks.find(t => t.id === openId);

  const pick = async (lat: number, lng: number, label?: string) => {
    setSelectedId(null);
    setResults([]);
    setDraft({ lat, lng, label: label ?? "Buscando endereço..." });
    if (label) return;
    try {
      const r = await fetch(`${NOMINATIM}/reverse?format=json&zoom=18&accept-language=pt-BR&lat=${lat}&lon=${lng}`);
      const p = await r.json() as Place;
      setDraft(d => d && d.lat === lat ? { ...d, label: shortName(p) } : d);
    } catch {
      setDraft(d => d && d.lat === lat ? { ...d, label: "Local marcado" } : d);
    }
  };
  const pickRef = useRef(pick);
  pickRef.current = pick;

  // Cria o mapa uma vez
  useEffect(() => {
    if (!mapEl.current || map.current) return;
    const m = L.map(mapEl.current, { zoomControl: false }).setView(DEFAULT_CENTER, 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: "© OpenStreetMap",
    }).addTo(m);
    taskLayer.current = L.layerGroup().addTo(m);
    draftLayer.current = L.layerGroup().addTo(m);
    m.on("click", e => pickRef.current(e.latlng.lat, e.latlng.lng));
    map.current = m;
    locate(true);
    return () => { m.remove(); map.current = null; };
  }, []);

  const locate = async (first = false) => {
    try {
      const { coords } = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
      setMe(coords);
      const ll: L.LatLngTuple = [coords.latitude, coords.longitude];
      meMarker.current?.remove();
      meMarker.current = L.circleMarker(ll, { radius: 8, color: "#fff", weight: 3, fillColor: "#2563EB", fillOpacity: 1 }).addTo(map.current!);
      map.current?.setView(ll, first ? 15 : map.current.getZoom());
    } catch {
      if (!first) setMsg("Não consegui pegar sua localização. Ligue o GPS e permita o acesso.");
      const t = withLoc[0]?.location;
      if (first && t) map.current?.setView([t.lat, t.lng], 15);
    }
  };

  // Tarefas com local: ponto colorido pela categoria e o raio do aviso
  useEffect(() => {
    const layer = taskLayer.current;
    if (!layer) return;
    layer.clearLayers();
    for (const t of withLoc) {
      const { lat, lng, radius } = t.location!;
      const color = PROJECT_COLORS[t.project] ?? "#4F6BED";
      L.circle([lat, lng], { radius, color, weight: 1, fillOpacity: 0.12, interactive: false }).addTo(layer);
      L.circleMarker([lat, lng], { radius: 9, color: "#fff", weight: 2, fillColor: color, fillOpacity: 1 })
        .on("click", e => { L.DomEvent.stopPropagation(e); setDraft(null); setSelectedId(t.id); })
        .addTo(layer);
    }
  }, [tasks]);

  // Ponto escolhido para a nova tarefa
  useEffect(() => {
    const layer = draftLayer.current;
    if (!layer) return;
    layer.clearLayers();
    if (!draft) return;
    L.circle([draft.lat, draft.lng], { radius: form.radius, color: "#4F6BED", weight: 1, dashArray: "4", fillOpacity: 0.1, interactive: false }).addTo(layer);
    L.circleMarker([draft.lat, draft.lng], { radius: 9, color: "#fff", weight: 2, fillColor: "#4F6BED", fillOpacity: 1 }).addTo(layer);
  }, [draft, form.radius]);

  const search = async () => {
    if (!q.trim()) return;
    setMsg("");
    try {
      const c = map.current?.getCenter();
      const near = c ? `&viewbox=${c.lng - 0.5},${c.lat + 0.5},${c.lng + 0.5},${c.lat - 0.5}` : "";
      const r = await fetch(`${NOMINATIM}/search?format=json&limit=5&countrycodes=br&accept-language=pt-BR${near}&q=${encodeURIComponent(q)}`);
      const list = await r.json() as Place[];
      setResults(list);
      if (!list.length) setMsg("Nenhum lugar encontrado.");
    } catch { setMsg("Sem internet para buscar o lugar."); }
  };

  const choosePlace = (p: Place) => {
    const lat = Number(p.lat), lng = Number(p.lon);
    map.current?.setView([lat, lng], 16);
    pick(lat, lng, shortName(p));
    setQ("");
  };

  const create = () => {
    if (!draft || !form.title.trim()) return;
    if (form.dueDate < toLocalInput(new Date())) { setMsg("O prazo já passou. Escolha uma data a partir de agora."); return; }
    createTask({
      title: form.title.trim(), description: "", project: FALLBACK_CATEGORY, priority: form.priority, status: "Pendente",
      dueDate: form.dueDate, effort: "", quadrant: deriveQuadrant(form.priority, form.dueDate), subtasks: [],
      location: { label: draft.label, lat: draft.lat, lng: draft.lng, radius: form.radius },
    });
    setDraft(null);
    setMsg("");
    setForm(f => ({ ...f, title: "" }));
  };

  const sheet = "absolute left-3 right-3 bottom-3 z-[1000] rounded-2xl p-4 shadow-xl";
  const sheetStyle = { background: "var(--surface)", border: "1px solid var(--border)" };
  const field = "w-full text-sm px-3 py-2 rounded-xl outline-none";
  const fieldStyle = { background: "var(--sunken)", border: "1px solid var(--border)", color: "var(--text)" };
  const chip = (on: boolean) => on ? { background: "var(--accent)", color: "#fff" } : { border: "1px solid var(--border)", color: "var(--sub)" };

  return (
    <div className="relative h-full flex flex-col" style={{ minHeight: "calc(100dvh - 64px)" }}>
      {/* Busca */}
      <div className="flex-none px-3 pt-3 pb-2 relative z-[1001]" style={{ background: "var(--bg)" }}>
        <form onSubmit={e => { e.preventDefault(); search(); }} className="flex items-center gap-2 rounded-xl px-3 py-2" style={fieldStyle}>
          <Search size={15} style={{ color: "var(--sub)" }} />
          <input className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text)" }} value={q}
            onChange={e => setQ(e.target.value)} placeholder="Buscar lugar (ex: Mercado, Rua...)" aria-label="Buscar lugar" />
          {q && <button type="button" aria-label="Limpar busca" onClick={() => { setQ(""); setResults([]); }}><X size={14} style={{ color: "var(--sub)" }} /></button>}
        </form>
        {results.length > 0 && (
          <div className="absolute left-3 right-3 mt-1 rounded-xl overflow-hidden shadow-xl" style={sheetStyle}>
            {results.map(p => (
              <button key={`${p.lat},${p.lon}`} onClick={() => choosePlace(p)} className="w-full text-left px-3 py-2.5 flex gap-2 items-start"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <MapPin size={14} className="flex-none mt-0.5" style={{ color: "var(--accent)" }} />
                <span className="text-[12px] leading-snug" style={{ color: "var(--text)" }}>{p.display_name}</span>
              </button>
            ))}
          </div>
        )}
        {msg && <p className="text-[12px] mt-1.5" style={{ color: "var(--critical)" }}>{msg}</p>}
      </div>

      {/* Mapa; "relative z-0" mantém os painéis do Leaflet abaixo do detalhe da tarefa */}
      <div className="relative z-0 flex-1">
        <div ref={mapEl} className="absolute inset-0" />
        <button onClick={() => locate()} aria-label="Ir para minha localização"
          className="absolute right-3 top-3 z-[1000] p-2.5 rounded-full shadow-lg" style={{ background: "var(--surface)", color: "var(--accent)" }}>
          <LocateFixed size={18} />
        </button>
        {!draft && !selected && (
          <div className={`${sheet} py-3`} style={sheetStyle}>
            <p className="text-[12px]" style={{ color: "var(--sub)" }}>
              <strong style={{ color: "var(--text)" }}>{withLoc.length} tarefa{withLoc.length === 1 ? "" : "s"} com local.</strong>{" "}
              Toque no mapa ou busque um lugar para criar uma tarefa ali. O Ordena avisa quando você chegar perto.
            </p>
          </div>
        )}

        {selected && (
          <div className={sheet} style={sheetStyle}>
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>{selected.title}</p>
                <p className="text-[12px]" style={{ color: "var(--sub)" }}>
                  {selected.location!.label}{me ? ` · ${fmtDist(distanceM(me, selected.location!))} daqui` : ""} · aviso a {selected.location!.radius} m
                </p>
              </div>
              <button aria-label="Fechar" onClick={() => setSelectedId(null)} className="p-1" style={{ color: "var(--sub)" }}><X size={16} /></button>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setOpenId(selected.id)} className="flex-1 py-2 rounded-xl text-[13px] font-semibold" style={{ background: "var(--accent)", color: "#fff" }}>
                Abrir tarefa
              </button>
              <button onClick={() => mapsRoute(selected.location!.lat, selected.location!.lng)}
                className="flex-1 py-2 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5" style={fieldStyle}>
                <Navigation size={14} /> Rota no Google Maps
              </button>
            </div>
          </div>
        )}

        {draft && (
          <div className={sheet} style={sheetStyle}>
            <div className="flex items-start gap-2 mb-2">
              <MapPin size={16} className="flex-none mt-0.5" style={{ color: "var(--accent)" }} />
              <p className="flex-1 text-[13px] font-medium" style={{ color: "var(--text)" }}>{draft.label}</p>
              <button aria-label="Cancelar" onClick={() => setDraft(null)} className="p-1" style={{ color: "var(--sub)" }}><X size={16} /></button>
            </div>
            <input autoFocus className={field} style={fieldStyle} placeholder="O que fazer aqui? Ex: Comprar pão"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <div className="flex gap-1.5 mt-2">
              {RADII.map(r => (
                <button key={r} onClick={() => setForm({ ...form, radius: r })} className="flex-1 text-xs py-1.5 rounded-xl" style={chip(form.radius === r)}>
                  Avisar a {r} m
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 mt-2">
              {PRIORITIES.map(p => (
                <button key={p} onClick={() => setForm({ ...form, priority: p })} className="flex-1 text-xs py-1.5 rounded-xl" style={chip(form.priority === p)}>
                  {p}
                </button>
              ))}
            </div>
            <label className="block text-[11px] mt-2 mb-1" style={{ color: "var(--sub)" }}>Prazo</label>
            <input type="datetime-local" className={field} style={fieldStyle} value={form.dueDate} min={toLocalInput(new Date())}
              onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            <button onClick={create} disabled={!form.title.trim()}
              className="w-full mt-3 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40" style={{ background: "var(--accent)", color: "#fff" }}>
              <Plus size={15} /> Criar tarefa neste lugar
            </button>
          </div>
        )}
      </div>
      {openTask && <TaskDetailModal task={openTask} isDark={isDark} onClose={() => setOpenId(null)} />}
    </div>
  );
}
