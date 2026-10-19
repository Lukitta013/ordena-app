import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Lock, Link2, X, CheckCircle2, Circle, StickyNote, Paperclip, Camera, Mic, Square, FileText, Trash2,
  MapPin, LocateFixed, CalendarPlus, Unlock,
} from "lucide-react";
import { Geolocation } from "@capacitor/geolocation";
import { useTasks, isDone, blockersOf, wouldCycle, type AppTask, type Attachment } from "./context/TaskContext";
import { genId } from "./utils/subtaskTree";
import { saveBlob, getBlob, deleteBlob, openBlob } from "./utils/anexos";
import { addToCalendarPrompt } from "../../nativo/calendario";

// Seções extras do detalhe da tarefa: dependências (US07), local (US06), calendário (US09), anotações e anexos (US10)

const field = "w-full text-sm px-3 py-2 rounded-xl outline-none";
const fieldStyle = { background: "var(--sunken)", border: "1px solid var(--border)", color: "var(--text)" };
const chip = "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl";

function Section({ icon: Icon, title, children }: { icon: typeof Lock; title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1" style={{ color: "var(--sub)" }}>
        <Icon size={11} /> {title}
      </p>
      {children}
    </div>
  );
}

const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${Math.round(b / 1024)} KB` : `${(b / 1048576).toFixed(1)} MB`;
const fmtWhen = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

// ── Dependências (US07) ───────────────────────────────────────────

export function DependenciesSection({ task }: { task: AppTask }) {
  const { tasks, updateTask } = useTasks();
  const deps = tasks.filter(x => task.dependsOn?.includes(x.id));
  const waiting = tasks.filter(x => x.dependsOn?.includes(task.id) && !isDone(x));
  const options = tasks.filter(x =>
    x.id !== task.id && !isDone(x) && !task.dependsOn?.includes(x.id) && !wouldCycle(tasks, task.id, x.id));
  const setDeps = (ids: string[]) => updateTask(task.id, { dependsOn: ids });

  return (
    <Section icon={Link2} title="Depende de">
      {deps.length === 0 && <p className="text-xs mb-1.5" style={{ color: "var(--tertiary)" }}>Nenhuma. Esta tarefa pode ser feita a qualquer momento.</p>}
      {deps.map(d => (
        <div key={d.id} className="flex items-center gap-2 py-1">
          {isDone(d) ? <CheckCircle2 size={14} style={{ color: "var(--success)" }} /> : <Lock size={14} style={{ color: "var(--warning)" }} />}
          <span className={`flex-1 text-sm min-w-0 truncate ${isDone(d) ? "line-through" : ""}`} style={{ color: isDone(d) ? "var(--tertiary)" : "var(--text)" }}>{d.title}</span>
          <button aria-label={`Remover dependência ${d.title}`} className="p-1.5" style={{ color: "var(--tertiary)" }}
            onClick={() => setDeps((task.dependsOn ?? []).filter(id => id !== d.id))}>
            <X size={14} />
          </button>
        </div>
      ))}
      {options.length > 0 && (
        <select className={`${field} mt-1`} style={fieldStyle} value=""
          onChange={e => e.target.value && setDeps([...(task.dependsOn ?? []), e.target.value])}>
          <option value="">+ Adicionar tarefa que precisa vir antes</option>
          {options.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
        </select>
      )}
      {waiting.length > 0 && (
        <p className="text-xs mt-2 flex items-start gap-1" style={{ color: "var(--sub)" }}>
          <Unlock size={12} className="flex-none mt-0.5" />
          Concluir esta libera: {waiting.map(w => w.title).join(", ")}
        </p>
      )}
    </Section>
  );
}

export function BlockedNotice({ task }: { task: AppTask }) {
  const { tasks } = useTasks();
  const blockers = blockersOf(task, tasks);
  if (!blockers.length || isDone(task)) return null;
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: "var(--sunken)", color: "var(--warning)", border: "1px solid var(--border)" }}>
      <Lock size={13} className="flex-none mt-0.5" />
      <span>Bloqueada. Conclua antes: <strong>{blockers.map(b => b.title).join(", ")}</strong></span>
    </div>
  );
}

// ── Lembrete por local (US06) ─────────────────────────────────────

const RADII = [100, 200, 500];

export function LocationSection({ task }: { task: AppTask }) {
  const { updateTask } = useTasks();
  const [label, setLabel] = useState(task.location?.label ?? "");
  const [radius, setRadius] = useState(task.location?.radius ?? 200);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const useHere = async () => {
    setBusy(true);
    setError("");
    try {
      const { coords } = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
      updateTask(task.id, { location: { label: label.trim() || "Local marcado", lat: coords.latitude, lng: coords.longitude, radius } });
      setEditing(false);
    } catch {
      setError("Não consegui pegar sua localização. Confira se o GPS está ligado e se o Ordena tem permissão de localização.");
    }
    setBusy(false);
  };

  if (task.location && !editing) {
    const loc = task.location;
    return (
      <Section icon={MapPin} title="Lembrete por local">
        <div className="flex items-center gap-2">
          <MapPin size={15} style={{ color: "var(--success)" }} className="flex-none" />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate" style={{ color: "var(--text)" }}>{loc.label}</p>
            <p className="text-[11px] font-mono" style={{ color: "var(--tertiary)" }}>Aviso num raio de {loc.radius} m</p>
          </div>
          <button className="text-xs font-medium px-2 py-1.5" style={{ color: "var(--accent)" }} onClick={() => setEditing(true)}>Alterar</button>
          <button aria-label="Remover lembrete por local" className="p-1.5" style={{ color: "var(--tertiary)" }}
            onClick={() => updateTask(task.id, { location: undefined })}>
            <X size={14} />
          </button>
        </div>
      </Section>
    );
  }

  return (
    <Section icon={MapPin} title="Lembrete por local">
      <p className="text-xs mb-2" style={{ color: "var(--tertiary)" }}>Vá até o lugar (ou esteja nele) e marque. O Ordena avisa quando você chegar perto de novo.</p>
      <input className={field} style={fieldStyle} placeholder="Nome do local, ex: Supermercado" value={label} onChange={e => setLabel(e.target.value)} />
      <div className="flex gap-1.5 mt-2">
        {RADII.map(r => (
          <button key={r} onClick={() => setRadius(r)} className="flex-1 text-xs py-1.5 rounded-xl"
            style={radius === r ? { background: "var(--accent)", color: "#fff" } : { border: "1px solid var(--border)", color: "var(--sub)" }}>
            {r} m
          </button>
        ))}
      </div>
      <button onClick={useHere} disabled={busy} className={`${chip} w-full justify-center mt-2 disabled:opacity-50`}
        style={{ background: "var(--sunken)", color: "var(--accent)", border: "1px solid var(--border)" }}>
        <LocateFixed size={14} /> {busy ? "Localizando..." : "Usar minha localização atual"}
      </button>
      {editing && <button onClick={() => setEditing(false)} className="w-full text-xs mt-1 py-1.5" style={{ color: "var(--sub)" }}>Cancelar</button>}
      {error && <p className="text-xs mt-1.5" style={{ color: "var(--critical)" }}>{error}</p>}
    </Section>
  );
}

// ── Calendário (US09) ─────────────────────────────────────────────

export function CalendarButton({ task }: { task: AppTask }) {
  const { notify } = useTasks();
  return (
    <button className={`${chip} w-full justify-center`} style={{ border: "1px solid var(--border)", color: "var(--sub)" }}
      onClick={() => addToCalendarPrompt(task).catch(() => notify("Nenhum app de calendário encontrado."))}>
      <CalendarPlus size={14} /> Adicionar ao calendário
    </button>
  );
}

// ── Anotações (US10) ──────────────────────────────────────────────

export function NotesSection({ task }: { task: AppTask }) {
  const { updateTask } = useTasks();
  const [text, setText] = useState("");
  const notes = task.notes ?? [];
  const add = () => {
    const t = text.trim();
    if (!t) return;
    updateTask(task.id, { notes: [...notes, { id: genId(), text: t, at: new Date().toISOString() }] });
    setText("");
  };

  return (
    <Section icon={StickyNote} title="Anotações">
      {[...notes].reverse().map(n => (
        <div key={n.id} className="group flex gap-2 py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex-1 min-w-0">
            <p className="text-sm whitespace-pre-wrap break-words" style={{ color: "var(--text)" }}>{n.text}</p>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: "var(--tertiary)" }}>{fmtWhen(n.at)}</p>
          </div>
          <button aria-label="Excluir anotação" className="p-1.5 self-start" style={{ color: "var(--tertiary)" }}
            onClick={() => updateTask(task.id, { notes: notes.filter(x => x.id !== n.id) })}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <div className="flex gap-2 mt-1.5">
        <textarea rows={2} className={`${field} resize-none`} style={fieldStyle} placeholder="Escreva uma anotação..."
          value={text} onChange={e => setText(e.target.value)} />
        <button onClick={add} disabled={!text.trim()} className="px-3 rounded-xl text-xs font-semibold text-white disabled:opacity-40"
          style={{ background: "var(--accent)" }}>
          Salvar
        </button>
      </div>
    </Section>
  );
}

// ── Anexos (US10) ─────────────────────────────────────────────────

const MAX_BYTES = 25 * 1048576;
const DOC_TYPES = "image/*,audio/*,application/pdf,.doc,.docx,.odt,.xls,.xlsx,.ods,.ppt,.pptx,.txt,.csv";

function AttachmentItem({ att, onRemove }: { att: Attachment; onRemove: () => void }) {
  const { notify } = useTasks();
  const [url, setUrl] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const isImage = att.type.startsWith("image/");
  const isAudio = att.type.startsWith("audio/");

  useEffect(() => {
    if (!isImage && !isAudio) return;
    let u: string | null = null;
    getBlob(att.id).then(b => { if (b) { u = URL.createObjectURL(b); setUrl(u); } });
    return () => { if (u) URL.revokeObjectURL(u); };
  }, [att.id, isImage, isAudio]);

  const open = async () => {
    const b = await getBlob(att.id);
    if (!b) { notify("Arquivo não encontrado neste aparelho."); return; }
    openBlob(b, att.name).catch(() => notify("Não foi possível abrir o arquivo."));
  };

  return (
    <div className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
      {isImage && url ? (
        <button onClick={open} className="flex-none"><img src={url} alt={att.name} className="w-12 h-12 rounded-lg object-cover" /></button>
      ) : (
        <button onClick={open} className="w-12 h-12 flex-none rounded-lg flex items-center justify-center" style={{ background: "var(--sunken)", color: "var(--accent)" }}>
          {isAudio ? <Mic size={18} /> : <FileText size={18} />}
        </button>
      )}
      <div className="flex-1 min-w-0">
        {isAudio && url ? <audio controls src={url} className="w-full h-8" /> : (
          <button onClick={open} className="text-sm text-left truncate w-full" style={{ color: "var(--text)" }}>{att.name}</button>
        )}
        <p className="text-[10px] font-mono" style={{ color: "var(--tertiary)" }}>{fmtSize(att.size)} · {fmtWhen(att.at)}</p>
      </div>
      {confirm ? (
        <button onClick={onRemove} className="text-xs font-semibold px-2 py-1.5" style={{ color: "var(--critical)" }}>Remover?</button>
      ) : (
        <button aria-label={`Remover anexo ${att.name}`} onClick={() => setConfirm(true)} className="p-1.5" style={{ color: "var(--tertiary)" }}>
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

export function AttachmentsSection({ task }: { task: AppTask }) {
  const { updateTask, notify } = useTasks();
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const [recSecs, setRecSecs] = useState<number | null>(null);
  const atts = task.attachments ?? [];

  const addFiles = async (files: { blob: Blob; name: string }[]) => {
    const added: Attachment[] = [];
    for (const { blob, name } of files) {
      if (blob.size > MAX_BYTES) { notify(`"${name}" passa de 25 MB e não foi anexado.`); continue; }
      const id = genId();
      try {
        await saveBlob(id, blob);
        added.push({ id, name, type: blob.type || "application/octet-stream", size: blob.size, at: new Date().toISOString() });
      } catch {
        notify("Sem espaço para guardar o anexo no aparelho.");
      }
    }
    if (added.length) updateTask(task.id, { attachments: [...atts, ...added] });
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])].map(f => ({ blob: f as Blob, name: f.name }));
    e.target.value = "";
    addFiles(files);
  };

  const remove = (att: Attachment) => {
    updateTask(task.id, { attachments: atts.filter(a => a.id !== att.id) });
    deleteBlob(att.id).catch(() => {});
  };

  useEffect(() => {
    if (recSecs === null) return;
    const t = setTimeout(() => setRecSecs(s => s === null ? null : s + 1), 1000);
    return () => clearTimeout(t);
  }, [recSecs]);
  useEffect(() => () => recorder.current?.stop(), []);

  const toggleRecording = async () => {
    if (recorder.current) { recorder.current.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = e => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        recorder.current = null;
        setRecSecs(null);
        const type = rec.mimeType || "audio/webm";
        const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
        const when = new Date().toLocaleString("pt-BR").replace(/[/:]/g, "-").replace(", ", "_");
        addFiles([{ blob: new Blob(chunks, { type }), name: `Audio_${when}.${ext}` }]);
      };
      rec.start();
      recorder.current = rec;
      setRecSecs(0);
    } catch {
      notify("Sem acesso ao microfone. Permita o uso do microfone para o Ordena.");
    }
  };

  const btn = { background: "var(--sunken)", color: "var(--accent)", border: "1px solid var(--border)" };
  return (
    <Section icon={Paperclip} title={`Anexos${atts.length ? ` (${atts.length})` : ""}`}>
      {atts.map(a => <AttachmentItem key={a.id} att={a} onRemove={() => remove(a)} />)}
      <div className="grid grid-cols-3 gap-1.5 mt-2">
        <button className={`${chip} justify-center`} style={btn} onClick={() => fileRef.current?.click()}>
          <Paperclip size={14} /> Arquivo
        </button>
        <button className={`${chip} justify-center`} style={btn} onClick={() => photoRef.current?.click()}>
          <Camera size={14} /> Foto
        </button>
        <button className={`${chip} justify-center`} onClick={toggleRecording}
          style={recSecs !== null ? { background: "var(--critical)", color: "#fff" } : btn}>
          {recSecs !== null ? <><Square size={12} /> {Math.floor(recSecs / 60)}:{String(recSecs % 60).padStart(2, "0")}</> : <><Mic size={14} /> Áudio</>}
        </button>
      </div>
      <input ref={fileRef} type="file" multiple accept={DOC_TYPES} className="hidden" onChange={onPick} />
      <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
    </Section>
  );
}

// Ícone de check reaproveitado no cartão: concluída / aberta
export const DoneIcon = ({ done, size = 20 }: { done: boolean; size?: number }) =>
  done ? <CheckCircle2 size={size} style={{ color: "var(--success)" }} /> : <Circle size={size} style={{ color: "var(--tertiary)" }} />;
