import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Search, X, ChevronRight, ChevronDown, Calendar, Filter,
  Bookmark, FileText, CloudOff, Pencil, Trash2,
  CheckCircle2, Circle, Clock,
  GraduationCap, Briefcase, Wallet, HeartPulse, User, Gamepad2, Wrench, FolderKanban,
  type LucideIcon,
} from "lucide-react";
import {
  useTasks, deriveQuadrant, toLocalInput, PROJECT_COLORS,
  type AppTask, type Priority, type Status, type Project, type Quadrant,
} from "./context/TaskContext";
import { countLeaves, type AppSubtask } from "./utils/subtaskTree";

type Theme = "dark" | "light";

// ── Constants ─────────────────────────────────────────────────────

const PROJECTS: Project[] = [
  "Faculdade", "Trabalho", "Finanças", "Saúde",
  "Pessoal", "Lazer", "Manutenção", "Projetos",
];

const PROJECT_ICONS: Record<Project, LucideIcon> = {
  Faculdade:  GraduationCap,
  Trabalho:   Briefcase,
  Finanças:   Wallet,
  Saúde:      HeartPulse,
  Pessoal:    User,
  Lazer:      Gamepad2,
  Manutenção: Wrench,
  Projetos:   FolderKanban,
};

const PRIORITIES: Priority[] = ["Alta", "Média", "Baixa"];
const STATUSES: Status[] = ["Pendente", "Em Andamento", "Em Revisão", "Bloqueada", "Concluída"];

const PRIORITY_BORDER: Record<Priority, string> = {
  Alta:  "border-l-rose-500",
  Média: "border-l-amber-400",
  Baixa: "border-l-slate-400",
};

const PRIORITY_PILL: Record<Priority, string> = {
  Alta:  "text-rose-500 border-rose-500/40",
  Média: "text-amber-500 border-amber-500/40",
  Baixa: "text-slate-400 border-slate-500/30",
};

const STATUS_STYLE: Record<Status, string> = {
  Pendente: "bg-slate-500/10 text-slate-400",
  "Em Andamento": "bg-blue-500/10 text-blue-400",
  "Em Revisão": "bg-violet-500/10 text-violet-400",
  Bloqueada: "bg-rose-500/10 text-rose-400",
  Concluída: "bg-emerald-500/10 text-emerald-400",
};

const Q_META: Record<Quadrant, { label: string; border: string; desc: string }> = {
  Q1: { label: "Fazer Agora",   border: "border-l-rose-500",  desc: "Urgente & Importante" },
  Q2: { label: "Agendar",       border: "border-l-[#4F6BED]", desc: "Importante & Não Urgente" },
  Q3: { label: "Interrupções",  border: "border-l-amber-400", desc: "Urgente & Não Importante" },
  Q4: { label: "Baixo Impacto", border: "border-l-slate-400", desc: "Não Urgente & Não Importante" },
};

const Q_ACCENT: Record<Quadrant, string> = {
  Q1: "#EF4444",
  Q2: "#4F6BED",
  Q3: "#F59E0B",
  Q4: "#64748B",
};

// ── Shared project select ─────────────────────────────────────────

function ProjectSelect({
  value, onChange, className,
}: {
  value: Project;
  onChange: (p: Project) => void;
  className: string;
}) {
  return (
    <select
      className={className}
      value={value}
      onChange={e => onChange(e.target.value as Project)}
    >
      {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
    </select>
  );
}

function ProjectPill({ project }: { project: Project }) {
  const color = PROJECT_COLORS[project];
  const Icon = PROJECT_ICONS[project];
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border"
      style={{ color, borderColor: color + "60", background: "transparent" }}
    >
      <Icon size={10} />
      {project}
    </span>
  );
}

function fmtDue(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (d.getTime() - now.getTime()) / 36e5;
  if (diffH < 0) return "Atrasada";
  const timeStr = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const tomorrow = new Date(now.getTime() + 864e5);
  if (d.toDateString() === now.toDateString()) return `Hoje, ${timeStr}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Amanhã, ${timeStr}`;
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
}

// ── Toast ─────────────────────────────────────────────────────────

function Toast() {
  const { toast, restoreTask, dismissToast } = useTasks();
  if (!toast) return null;
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-[#1E222B] border border-[#262B36] text-[#E8EAED] text-xs font-medium px-4 py-2.5 rounded-2xl shadow-xl max-w-[360px] w-[90vw]">
      <span className="flex-1">{toast.text}</span>
      {toast.undoTask && (
        <button
          onClick={() => restoreTask(toast.undoTask!)}
          className="text-[#4F6BED] hover:text-blue-300 font-semibold flex-none transition-colors"
        >
          Desfazer
        </button>
      )}
      <button onClick={dismissToast} className="text-[#9AA0AC] hover:text-[#E8EAED] flex-none transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

// ── SubtaskNode ───────────────────────────────────────────────────

function SubtaskNode({
  node, taskId, depth,
}: {
  node: AppSubtask;
  taskId: string;
  depth: number;
}) {
  const { toggleSubtaskFn, addSubtaskFn, updateSubtaskFn, removeSubtaskFn } = useTasks();
  const [expanded, setExpanded] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(node.title);
  const [addingChild, setAddingChild] = useState(false);
  const [childInput, setChildInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);
  const childRef = useRef<HTMLInputElement>(null);

  const { completed: doneSub, total: totalSub } = countLeaves(node.children);
  const MAX_DEPTH = 2;
  const canNest = depth < MAX_DEPTH;

  useEffect(() => { if (editingTitle) editRef.current?.focus(); }, [editingTitle]);
  useEffect(() => { if (addingChild) childRef.current?.focus(); }, [addingChild]);

  const saveEdit = () => {
    const t = draftTitle.trim();
    if (t) updateSubtaskFn(taskId, node.id, { title: t });
    else setDraftTitle(node.title);
    setEditingTitle(false);
  };

  const addChild = () => {
    const t = childInput.trim();
    if (t) { addSubtaskFn(taskId, node.id, t); setChildInput(""); }
    setAddingChild(false);
  };

  const handleDelete = () => {
    if (node.children.length > 0 && !confirmDelete) { setConfirmDelete(true); return; }
    removeSubtaskFn(taskId, node.id);
  };

  return (
    <div className={depth > 0 ? "pl-5 border-l border-slate-200 dark:border-[#262B36]" : ""}>
      {confirmDelete ? (
        <div className="flex items-center gap-2 py-1 text-xs text-rose-400">
          <span>Excluir e seus {node.children.length} subitens?</span>
          <button onClick={() => removeSubtaskFn(taskId, node.id)} className="font-semibold hover:text-rose-300">Sim</button>
          <button onClick={() => setConfirmDelete(false)} className="text-slate-400 hover:text-slate-300">Não</button>
        </div>
      ) : (
        <div className="group flex items-center gap-1.5 py-1 min-w-0">
          <button
            className={`flex-none w-4 text-slate-400 transition-transform ${node.children.length === 0 ? "opacity-0 pointer-events-none" : ""}`}
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>

          <button
            className="flex-none transition-colors"
            onClick={() => toggleSubtaskFn(taskId, node.id)}
          >
            {node.completed
              ? <CheckCircle2 size={15} className="text-[#4F6BED]" />
              : <Circle size={15} className="text-slate-400 group-hover:text-[#4F6BED] transition-colors" />}
          </button>

          {editingTitle ? (
            <input
              ref={editRef}
              value={draftTitle}
              onChange={e => setDraftTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") { setDraftTitle(node.title); setEditingTitle(false); } }}
              onBlur={saveEdit}
              className="flex-1 text-sm bg-transparent border-b border-[#4F6BED] outline-none min-w-0 text-slate-700 dark:text-slate-100"
            />
          ) : (
            <span
              onDoubleClick={() => { setDraftTitle(node.title); setEditingTitle(true); }}
              className={`flex-1 text-sm leading-snug cursor-default min-w-0 ${node.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-[#9AA0AC]"}`}
            >
              {node.title}
            </span>
          )}

          {node.dueDate && !editingTitle && (
            <span className={`flex items-center gap-0.5 text-[10px] font-mono flex-none ${new Date(node.dueDate) < new Date() ? "text-rose-400" : "text-slate-400"}`}>
              <Calendar size={9} /> {fmtDue(node.dueDate).split(",")[0]}
            </span>
          )}

          {!expanded && node.children.length > 0 && (
            <span className="text-[10px] text-slate-400 font-mono flex-none">({doneSub}/{totalSub})</span>
          )}

          {/* Em telas de toque não existe hover: os botões ficam sempre visíveis */}
          <div className="flex items-center gap-0.5 [@media(hover:hover)]:opacity-0 group-hover:opacity-100 transition-opacity flex-none">
            {canNest && (
              <button
                title="Adicionar subitem"
                onClick={() => setAddingChild(true)}
                className="p-1 rounded hover:bg-[#4F6BED]/10 text-slate-400 hover:text-[#4F6BED] transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
            <button
              title="Editar"
              onClick={() => { setDraftTitle(node.title); setEditingTitle(true); }}
              className="p-1 rounded hover:bg-[#4F6BED]/10 text-slate-400 hover:text-[#4F6BED] transition-colors"
            >
              <Pencil size={12} />
            </button>
            <button
              title="Excluir"
              onClick={handleDelete}
              className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      {expanded && node.children.map(child => (
        <SubtaskNode key={child.id} node={child} taskId={taskId} depth={depth + 1} />
      ))}

      {addingChild && (
        <div className={depth > 0 ? "pl-5 border-l border-[#262B36]" : ""}>
          <div className="flex items-center gap-1.5 py-1">
            <span className="w-4 flex-none" />
            <Circle size={15} className="text-slate-600 flex-none" />
            <input
              ref={childRef}
              value={childInput}
              onChange={e => setChildInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addChild(); if (e.key === "Escape") { setAddingChild(false); setChildInput(""); } }}
              onBlur={() => { if (!childInput.trim()) setAddingChild(false); else addChild(); }}
              placeholder="Nova subtarefa..."
              className="flex-1 text-sm bg-transparent border-b border-dashed border-slate-300 dark:border-[#262B36] focus:border-[#4F6BED] outline-none text-slate-700 dark:text-[#E8EAED] placeholder-[#9AA0AC]"
            />
            <button onClick={addChild} className="flex-none p-1 bg-[#4F6BED]/10 text-[#4F6BED] rounded-lg hover:bg-[#4F6BED]/20 transition-colors">
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Subtask root ──────────────────────────────────────────────────

function SubtaskTree({ task }: { task: AppTask }) {
  const { addSubtaskFn } = useTasks();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { completed, total } = countLeaves(task.subtasks);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const addRoot = () => {
    const t = input.trim();
    if (t) { addSubtaskFn(task.id, null, t); setInput(""); inputRef.current?.focus(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#9AA0AC]">
          {pct === 100
            ? <span className="flex items-center gap-1 text-[#3FB27F]"><CheckCircle2 size={11} /> Todas concluídas</span>
            : `${completed} de ${total} concluídas`}
        </span>
        <span className="text-xs font-mono font-bold text-[#4F6BED]">{pct}%</span>
      </div>
      <div className="h-1 bg-slate-200 dark:bg-[#262B36] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: pct === 100 ? "#3FB27F" : "#4F6BED" }}
        />
      </div>

      <div className="space-y-0">
        {task.subtasks.map(st => (
          <SubtaskNode key={st.id} node={st} taskId={task.id} depth={0} />
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-dashed border-[#262B36]/60">
        <Circle size={15} className="text-slate-600 flex-none" />
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") addRoot(); }}
          placeholder="Nova subtarefa..."
          className="flex-1 text-sm bg-transparent border-b border-dashed border-slate-300 dark:border-[#262B36] focus:border-[#4F6BED] outline-none text-slate-700 dark:text-[#E8EAED] placeholder-[#9AA0AC] py-0.5"
        />
        <button onClick={addRoot} className="flex-none p-1 bg-[#4F6BED]/10 text-[#4F6BED] rounded-lg hover:bg-[#4F6BED]/20 transition-colors">
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

// ── TaskCard ──────────────────────────────────────────────────────

export function TaskCard({
  task, isDark, highlighted, onClick,
}: {
  task: AppTask;
  isDark: boolean;
  highlighted: boolean;
  onClick: () => void;
}) {
  const { completed, total } = countLeaves(task.subtasks);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const projColor = PROJECT_COLORS[task.project];
  const overdue = fmtDue(task.dueDate) === "Atrasada";
  const done = task.status === "Concluída";
  const priorityBorder = PRIORITY_BORDER[task.priority];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex gap-3 p-3 rounded-xl border border-l-4 ${priorityBorder} transition-all duration-200 active:scale-[0.985]
        ${isDark ? "bg-[#171A21] hover:bg-[#1E222B] border-[#262B36]" : "bg-white hover:bg-slate-50 border-slate-200"}
        ${highlighted ? "ring-2 ring-[#4F6BED]" : ""}
      `}
    >
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p className={`text-[15px] font-medium leading-snug mb-2 ${done ? "line-through text-[#9AA0AC]" : isDark ? "text-[#E8EAED]" : "text-[#141821]"}`}
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {task.title}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <ProjectPill project={task.project} />
          <span className={`flex items-center gap-1 text-[11px] font-mono ${overdue ? "text-rose-400" : isDark ? "text-[#9AA0AC]" : "text-slate-500"}`}>
            <Calendar size={10} /> {fmtDue(task.dueDate)}
          </span>
          {task.effort && (
            <span className={`flex items-center gap-1 text-[11px] font-mono ${isDark ? "text-[#9AA0AC]" : "text-slate-400"}`}>
              <Clock size={10} /> {task.effort}
            </span>
          )}
          {task.syncPending && (
            <span title="Aguardando sincronização">
              <CloudOff size={10} className="text-[#9AA0AC]" />
            </span>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className={`flex-1 h-0.5 rounded-full overflow-hidden ${isDark ? "bg-[#262B36]" : "bg-slate-100"}`}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: pct === 100 ? "#3FB27F" : projColor }} />
            </div>
            <span className={`text-[10px] font-mono flex-none ${isDark ? "text-[#9AA0AC]" : "text-slate-400"}`}>{completed}/{total}</span>
          </div>
        )}
      </div>
    </button>
  );
}

// ── TaskFormModal ─────────────────────────────────────────────────

type FormState = {
  title: string;
  description: string;
  project: Project;
  priority: Priority;
  status: Status;
  dueDate: string;
  effort: string;
};

function TaskFormModal({ onClose, isDark, initial, onCreated }: {
  onClose: () => void; isDark: boolean; initial?: Partial<FormState>; onCreated?: () => void;
}) {
  const { createTask } = useTasks();
  const [form, setForm] = useState<FormState>({
    title: "", description: "", project: "Faculdade",
    priority: "Média", status: "Pendente",
    dueDate: "", effort: "",
    ...initial,
  });
  const [subtaskInput, setSubtaskInput] = useState("");
  const [initSubs, setInitSubs] = useState<AppSubtask[]>([]);
  const titleRef = useRef<HTMLInputElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);

  const previewQ: Quadrant = form.dueDate ? deriveQuadrant(form.priority, form.dueDate) : "Q2";
  const qMeta = Q_META[previewQ];

  const inp = `w-full text-sm px-3 py-2 rounded-xl border outline-none transition-colors ${isDark ? "bg-[#1E222B] border-[#262B36] text-[#E8EAED] focus:border-[#4F6BED] placeholder-[#9AA0AC]" : "bg-white border-slate-200 text-[#141821] focus:border-[#4F6BED] placeholder-slate-400"}`;
  const lbl = `text-xs font-medium mb-1 block ${isDark ? "text-[#9AA0AC]" : "text-slate-500"}`;

  const addInitSub = () => {
    const t = subtaskInput.trim();
    if (!t) return;
    setInitSubs(s => [...s, { id: `init-${Date.now()}`, title: t, completed: false, children: [] }]);
    setSubtaskInput("");
  };

  const submit = () => {
    if (!form.title.trim()) return;
    createTask({
      ...form,
      dueDate: form.dueDate || toLocalInput(new Date(Date.now() + 7 * 864e5)),
      quadrant: previewQ,
      subtasks: initSubs,
    });
    onCreated?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-[390px] rounded-t-3xl border-t shadow-2xl ${isDark ? "bg-[#171A21] border-[#262B36]" : "bg-white border-slate-200"}`}>
        <div className="w-10 h-1 bg-[#262B36] rounded-full mx-auto mt-3 mb-4" />
        <div className={`flex items-center justify-between px-5 pb-3 border-b ${isDark ? "border-[#262B36]" : "border-slate-100"}`}>
          <h2 className={`font-semibold text-base ${isDark ? "text-[#E8EAED]" : "text-[#141821]"}`}>Nova Tarefa</h2>
          <button onClick={onClose} className="text-[#9AA0AC] hover:text-[#E8EAED] transition-colors"><X size={20} /></button>
        </div>

        <div className="px-5 py-4 space-y-3 overflow-y-auto scrollbar-hide" style={{ maxHeight: "68vh" }}>
          <div>
            <label className={lbl}>Título *</label>
            <input ref={titleRef} className={inp} placeholder="O que precisa ser feito?" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className={lbl}>Descrição</label>
            <textarea className={`${inp} resize-none`} rows={2} placeholder="Contexto, links, detalhes..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={lbl}>Prazo</label>
              <input type="datetime-local" className={inp} value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className={lbl}>Esforço</label>
              <input className={inp} placeholder="ex: 2h" value={form.effort}
                onChange={e => setForm(f => ({ ...f, effort: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className={lbl}>Prioridade</label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => {
                const active = form.priority === p;
                return (
                  <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      active
                        ? p === "Alta" ? "border-rose-500 bg-rose-500/10 text-rose-500"
                          : p === "Média" ? "border-amber-400 bg-amber-400/10 text-amber-500"
                          : "border-slate-400 bg-slate-400/10 text-slate-400"
                        : isDark ? "border-[#262B36] text-[#9AA0AC]" : "border-slate-200 text-slate-500"
                    }`}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={lbl}>Projeto</label>
              <ProjectSelect value={form.project} onChange={p => setForm(f => ({ ...f, project: p }))} className={inp} />
              <div className="mt-1.5"><ProjectPill project={form.project} /></div>
            </div>
            <div>
              <label className={lbl}>Status</label>
              <select className={inp} value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Quadrant preview */}
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border-l-4 text-xs ${isDark ? "bg-[#1E222B]" : "bg-slate-50"}`}
            style={{ borderLeftColor: Q_ACCENT[previewQ] }}>
            <div className="flex-1">
              <span className={isDark ? "text-[#9AA0AC]" : "text-slate-500"}>Quadrante: </span>
              <strong className={isDark ? "text-[#E8EAED]" : "text-[#141821]"}>{qMeta.label}</strong>
              <span className={`ml-1 ${isDark ? "text-[#9AA0AC]" : "text-slate-400"}`}>— {qMeta.desc}</span>
            </div>
          </div>

          {/* Initial subtasks */}
          <div>
            <label className={lbl}>Subtarefas iniciais</label>
            {initSubs.map(s => (
              <div key={s.id} className="flex items-center gap-2 py-1">
                <Circle size={13} className="text-[#9AA0AC] flex-none" />
                <span className={`flex-1 text-sm ${isDark ? "text-[#E8EAED]" : "text-[#141821]"}`}>{s.title}</span>
                <button onClick={() => setInitSubs(p => p.filter(x => x.id !== s.id))}>
                  <X size={13} className="text-[#9AA0AC] hover:text-rose-400 transition-colors" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-1">
              <input
                className={`flex-1 ${inp} py-1.5`}
                placeholder="Adicionar subtarefa..."
                value={subtaskInput}
                onChange={e => setSubtaskInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addInitSub(); }}
              />
              <button onClick={addInitSub} className="flex-none p-1.5 bg-[#4F6BED]/10 text-[#4F6BED] rounded-lg hover:bg-[#4F6BED]/20 transition-colors">
                <Plus size={13} />
              </button>
            </div>
          </div>
        </div>

        <div className={`px-5 pb-7 pt-3 flex gap-3 border-t ${isDark ? "border-[#262B36]" : "border-slate-100"}`}>
          <button onClick={onClose} className={`flex-1 py-3 rounded-2xl border text-sm font-medium transition-colors ${isDark ? "border-[#262B36] text-[#9AA0AC] hover:bg-[#1E222B]" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            Cancelar
          </button>
          <button onClick={submit} disabled={!form.title.trim()}
            className="flex-1 py-3 rounded-2xl bg-[#4F6BED] hover:bg-[#3F5BD9] text-white text-sm font-semibold disabled:opacity-40 transition-all">
            Criar Tarefa
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TaskDetailModal ───────────────────────────────────────────────

export function TaskDetailModal({ task, isDark, onClose }: { task: AppTask; isDark: boolean; onClose: () => void }) {
  const { updateTask, deleteTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [draft, setDraft] = useState({ ...task });
  const [dirty, setDirty] = useState(false);

  const set = <K extends keyof typeof draft>(k: K, v: typeof draft[K]) => {
    setDraft(d => ({ ...d, [k]: v }));
    setDirty(true);
  };

  const save = () => {
    // Não regrava subtasks: elas podem ter mudado enquanto o modo de edição estava aberto
    const { subtasks: _ignored, ...fields } = draft;
    updateTask(task.id, { ...fields, quadrant: deriveQuadrant(draft.priority, draft.dueDate) });
    setIsEditing(false);
    setDirty(false);
  };

  const cancel = () => {
    if (dirty) {
      if (!window.confirm("Descartar alterações não salvas?")) return;
    }
    setDraft({ ...task });
    setDirty(false);
    setIsEditing(false);
  };

  const tryClose = () => {
    if (dirty) { if (!window.confirm("Descartar alterações não salvas?")) return; }
    onClose();
  };

  const confirmDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const inp = `w-full text-sm px-3 py-2 rounded-xl border outline-none transition-colors resize-none ${isDark ? "bg-[#1E222B] border-[#262B36] text-[#E8EAED] focus:border-[#4F6BED]" : "bg-slate-50 border-slate-200 text-[#141821] focus:border-[#4F6BED]"}`;

  if (confirmDel) {
    const { total } = countLeaves(task.subtasks);
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
        <div className={`w-full max-w-[390px] rounded-t-3xl border-t shadow-2xl p-6 text-center ${isDark ? "bg-[#171A21] border-[#262B36]" : "bg-white border-slate-200"}`}>
          <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isDark ? "bg-rose-500/10" : "bg-rose-50"}`}>
            <Trash2 size={22} className="text-rose-500" />
          </div>
          <p className={`font-semibold text-base mb-2 ${isDark ? "text-[#E8EAED]" : "text-[#141821]"}`}>Excluir tarefa?</p>
          <p className={`text-sm mb-1 ${isDark ? "text-[#9AA0AC]" : "text-slate-600"}`}>"{task.title}"</p>
          {total > 0 && <p className="text-xs text-[#9AA0AC] mb-1">{total} subtarefa{total !== 1 ? "s" : ""} também serão removidas.</p>}
          <p className="text-xs text-[#9AA0AC] mb-6">Esta ação não pode ser desfeita.</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDel(false)}
              className={`flex-1 py-3 rounded-2xl border text-sm font-medium ${isDark ? "border-[#262B36] text-[#9AA0AC]" : "border-slate-200 text-slate-600"}`}>
              Cancelar
            </button>
            <button onClick={confirmDelete}
              className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors">
              Excluir
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-[390px] rounded-t-3xl border-t shadow-2xl flex flex-col ${isDark ? "bg-[#171A21] border-[#262B36]" : "bg-white border-slate-200"}`}
        style={{ maxHeight: "88vh" }}>
        <div className="w-10 h-1 bg-[#262B36] rounded-full mx-auto mt-3 mb-3 flex-none" />

        {/* Header */}
        <div className={`flex items-center gap-2 px-4 pb-3 border-b flex-none ${isDark ? "border-[#262B36]" : "border-slate-100"}`}>
          {isEditing ? (
            <input
              autoFocus
              value={draft.title}
              onChange={e => set("title", e.target.value)}
              className={`flex-1 text-base font-semibold bg-transparent border-b-2 border-[#4F6BED] outline-none min-w-0 ${isDark ? "text-[#E8EAED]" : "text-[#141821]"}`}
            />
          ) : (
            <h2 className={`flex-1 font-semibold text-sm leading-snug min-w-0 ${isDark ? "text-[#E8EAED]" : "text-[#141821]"}`}>{task.title}</h2>
          )}
          <div className="flex items-center gap-1 flex-none">
            <button onClick={() => setIsEditing(e => !e)}
              className={`p-2 rounded-xl transition-colors ${isEditing ? "bg-[#4F6BED]/20 text-[#4F6BED]" : isDark ? "hover:bg-[#1E222B] text-[#9AA0AC] hover:text-[#4F6BED]" : "hover:bg-slate-100 text-slate-400 hover:text-[#4F6BED]"}`}>
              <Pencil size={16} />
            </button>
            <button onClick={() => setConfirmDel(true)}
              className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-rose-500/10 text-[#9AA0AC] hover:text-rose-500" : "hover:bg-rose-50 text-slate-400 hover:text-rose-500"}`}>
              <Trash2 size={16} />
            </button>
            <button onClick={tryClose} className="p-2 rounded-xl text-[#9AA0AC] hover:text-[#E8EAED] transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-4">
          {isEditing ? (
            <textarea rows={3} className={inp} value={draft.description}
              onChange={e => set("description", e.target.value)} placeholder="Descrição..." />
          ) : (
            task.description && <p className={`text-sm leading-relaxed ${isDark ? "text-[#9AA0AC]" : "text-slate-500"}`}>{task.description}</p>
          )}

          {/* Priority */}
          <div>
            <p className={`text-[10px] font-medium uppercase tracking-wide mb-1.5 ${isDark ? "text-[#9AA0AC]" : "text-slate-400"}`}>Prioridade</p>
            {isEditing ? (
              <div className="flex gap-2">
                {PRIORITIES.map(p => {
                  const active = draft.priority === p;
                  return (
                    <button key={p} onClick={() => set("priority", p)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        active
                          ? p === "Alta" ? "border-rose-500 bg-rose-500/10 text-rose-500"
                            : p === "Média" ? "border-amber-400 bg-amber-400/10 text-amber-500"
                            : "border-slate-400 bg-slate-400/10 text-slate-400"
                          : isDark ? "border-[#262B36] text-[#9AA0AC]" : "border-slate-200 text-slate-500"
                      }`}>
                      {p}
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${PRIORITY_PILL[task.priority]}`}>{task.priority}</span>
            )}
          </div>

          {/* Status */}
          <div>
            <p className={`text-[10px] font-medium uppercase tracking-wide mb-1.5 ${isDark ? "text-[#9AA0AC]" : "text-slate-400"}`}>Status</p>
            {isEditing ? (
              <select className={inp} value={draft.status} onChange={e => set("status", e.target.value as Status)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_STYLE[task.status]}`}>{task.status}</span>
            )}
          </div>

          {/* Project */}
          <div>
            <p className={`text-[10px] font-medium uppercase tracking-wide mb-1.5 ${isDark ? "text-[#9AA0AC]" : "text-slate-400"}`}>Projeto</p>
            {isEditing ? (
              <>
                <ProjectSelect value={draft.project} onChange={p => set("project", p)} className={inp} />
                <div className="mt-1.5"><ProjectPill project={draft.project} /></div>
              </>
            ) : (
              <ProjectPill project={task.project} />
            )}
          </div>

          {/* Deadline */}
          <div>
            <p className={`text-[10px] font-medium uppercase tracking-wide mb-1.5 ${isDark ? "text-[#9AA0AC]" : "text-slate-400"}`}>Prazo</p>
            {isEditing ? (
              <input type="datetime-local" className={inp} value={draft.dueDate}
                onChange={e => set("dueDate", e.target.value)} />
            ) : (
              <span className={`text-sm flex items-center gap-1.5 ${isDark ? "text-[#E8EAED]" : "text-[#141821]"}`}>
                <Calendar size={13} className="text-[#4F6BED]" /> {fmtDue(task.dueDate)}
              </span>
            )}
          </div>

          {/* Effort */}
          <div>
            <p className={`text-[10px] font-medium uppercase tracking-wide mb-1.5 ${isDark ? "text-[#9AA0AC]" : "text-slate-400"}`}>Esforço estimado</p>
            {isEditing ? (
              <input className={`${inp} w-24`} placeholder="ex: 2h" value={draft.effort}
                onChange={e => set("effort", e.target.value)} />
            ) : (
              <span className={`text-sm flex items-center gap-1.5 ${isDark ? "text-[#E8EAED]" : "text-[#141821]"}`}>
                <Clock size={13} className="text-[#4F6BED]" /> {task.effort}
              </span>
            )}
          </div>

          {/* Subtasks */}
          <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1E222B] border-[#262B36]" : "bg-slate-50 border-slate-100"}`}>
            <p className={`text-xs font-semibold mb-3 ${isDark ? "text-[#E8EAED]" : "text-[#141821]"}`}>Subtarefas</p>
            <SubtaskTree task={task} />
          </div>

          {task.syncPending && (
            <div className="flex items-center gap-1.5 text-xs text-[#9AA0AC]">
              <CloudOff size={12} /> Aguardando sincronização com o servidor
            </div>
          )}
        </div>

        {isEditing && (
          <div className={`flex-none px-5 py-3 flex gap-3 border-t sticky bottom-0 backdrop-blur-sm ${isDark ? "border-[#262B36] bg-[#171A21]/90" : "border-slate-100 bg-white/90"}`}>
            <button onClick={cancel}
              className={`px-5 py-2 rounded-xl border text-sm transition-colors ${isDark ? "border-[#262B36] text-[#9AA0AC]" : "border-slate-300 text-slate-600"}`}>
              Cancelar
            </button>
            <button onClick={save}
              className="flex-1 px-5 py-2 rounded-xl bg-[#4F6BED] hover:bg-[#3F5BD9] text-white text-sm font-semibold transition-colors">
              Salvar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── QuickNoteSheet ────────────────────────────────────────────────

const NOTE_KEY = "ordena-nota-rapida";

function QuickNoteSheet({ isDark, onClose, onConvert }: {
  isDark: boolean;
  onClose: () => void;
  onConvert: (title: string, description: string) => void;
}) {
  const [note, setNote] = useState(() => localStorage.getItem(NOTE_KEY) ?? "");
  useEffect(() => { localStorage.setItem(NOTE_KEY, note); }, [note]);

  const convert = () => {
    const [first, ...rest] = note.trim().split("\n");
    onConvert(first.trim(), rest.join("\n").trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className={`w-full max-w-[390px] rounded-t-3xl border-t shadow-2xl px-5 pb-7 ${isDark ? "bg-[#171A21] border-[#262B36]" : "bg-white border-slate-200"}`}>
        <div className="w-10 h-1 bg-[#262B36] rounded-full mx-auto mt-3 mb-4" />
        <div className="flex items-center justify-between mb-3">
          <h2 className={`font-semibold text-base ${isDark ? "text-[#E8EAED]" : "text-[#141821]"}`}>Nota rápida</h2>
          <button onClick={onClose} className="text-[#9AA0AC]"><X size={20} /></button>
        </div>
        <textarea
          autoFocus
          rows={5}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={"Anote uma ideia...\nA primeira linha vira o título da tarefa."}
          className={`w-full text-sm px-3 py-2 rounded-xl border outline-none resize-none ${isDark ? "bg-[#1E222B] border-[#262B36] text-[#E8EAED] placeholder-[#9AA0AC]" : "bg-slate-50 border-slate-200 text-[#141821] placeholder-slate-400"} focus:border-[#4F6BED]`}
        />
        <p className="text-[11px] text-[#9AA0AC] mt-1 mb-3">O rascunho fica salvo até a tarefa ser criada.</p>
        <button onClick={convert} disabled={!note.trim()}
          className="w-full py-3 rounded-2xl bg-[#4F6BED] hover:bg-[#3F5BD9] text-white text-sm font-semibold disabled:opacity-40">
          Converter em tarefa completa
        </button>
      </div>
    </div>
  );
}

// ── HomeScreen ────────────────────────────────────────────────────

const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"; };

function HomeScreen({ theme }: { theme: Theme }) {
  const { tasks } = useTasks();
  const [search, setSearch] = useState("");
  const [activeQ, setActiveQ] = useState<"ALL" | Quadrant>("ALL");
  const [filterProject, setFilterProject] = useState<"Todos" | Project>("Todos");
  const [showCreate, setShowCreate] = useState(false);
  const [createInitial, setCreateInitial] = useState<Partial<FormState> | undefined>();
  const [showNote, setShowNote] = useState(false);
  const [detailTask, setDetailTask] = useState<AppTask | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const isDark = theme === "dark";
  const bg = isDark ? "bg-[#0F1115]" : "bg-[#F7F8FA]";
  const sub = isDark ? "text-[#9AA0AC]" : "text-slate-500";
  const text = isDark ? "text-[#E8EAED]" : "text-[#141821]";

  useEffect(() => {
    if (detailTask) {
      const updated = tasks.find(t => t.id === detailTask.id);
      if (updated) setDetailTask(updated);
      else setDetailTask(null);
    }
  }, [tasks]);

  const filtered = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeQ !== "ALL" && t.quadrant !== activeQ) return false;
    if (filterProject !== "Todos" && t.project !== filterProject) return false;
    return true;
  });

  const grouped: Record<Quadrant, AppTask[]> = { Q1: [], Q2: [], Q3: [], Q4: [] };
  filtered.forEach(t => grouped[t.quadrant].push(t));

  const totalDone = tasks.filter(t => t.status === "Concluída").length;
  const totalToday = tasks.filter(t => fmtDue(t.dueDate).startsWith("Hoje")).length;

  const handleCreate = useCallback(() => { setCreateInitial(undefined); setShowCreate(true); }, []);

  const Q_TABS = [
    { key: "ALL" as const, label: "Todas" },
    { key: "Q1" as const, label: "Fazer Agora" },
    { key: "Q2" as const, label: "Agendar" },
    { key: "Q3" as const, label: "Interrupções" },
    { key: "Q4" as const, label: "Baixo Impacto" },
  ];

  return (
    <div className={`min-h-full ${bg} pb-24`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className={`text-xs ${sub}`}>{greeting()}, Lucas</p>
            <h1 className={`text-xl font-bold ${text}`}>Minhas Tarefas</h1>
          </div>
        </div>

        {/* KPI strip */}
        <div className="flex gap-2">
          {[
            { label: "Para hoje", value: totalToday, color: "text-rose-400" },
            { label: "Concluídas", value: totalDone, color: "text-[#3FB27F]" },
            { label: "Total", value: tasks.length, color: "text-[#4F6BED]" },
          ].map(k => (
            <div key={k.label} className={`flex-1 border rounded-xl px-2.5 py-2 text-center ${isDark ? "bg-[#171A21] border-[#262B36]" : "bg-white border-slate-200"}`}>
              <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
              <p className={`text-[10px] ${sub}`}>{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-2">
        <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 ${isDark ? "bg-[#171A21] border-[#262B36]" : "bg-white border-slate-200"}`}>
          <Search size={14} className={sub} />
          <input
            className={`flex-1 bg-transparent text-sm outline-none ${text} placeholder-[#9AA0AC]`}
            placeholder="Buscar tarefas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={() => setShowFilters(s => !s)}
            className={`transition-colors ${showFilters ? "text-[#4F6BED]" : sub}`}>
            <Filter size={14} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={`mx-4 mb-2 p-3 border rounded-xl ${isDark ? "bg-[#171A21] border-[#262B36]" : "bg-white border-slate-200"}`}>
          <p className={`text-[10px] font-medium uppercase tracking-wide mb-2 ${sub}`}>Filtrar por projeto</p>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setFilterProject("Todos")}
              className={`flex-none text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                filterProject === "Todos"
                  ? isDark ? "border-[#4F6BED] text-[#4F6BED]" : "border-[#4F6BED] text-[#4F6BED]"
                  : isDark ? "border-[#262B36] text-[#9AA0AC]" : "border-slate-200 text-slate-500"
              }`}
            >
              Todos
            </button>
            {PROJECTS.map(p => {
              const color = PROJECT_COLORS[p];
              const Icon = PROJECT_ICONS[p];
              const active = filterProject === p;
              return (
                <button
                  key={p}
                  onClick={() => setFilterProject(p)}
                  className="flex-none inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all"
                  style={active
                    ? { color, borderColor: color }
                    : { borderColor: isDark ? "#262B36" : "#e2e8f0", color: isDark ? "#9AA0AC" : "#64748b" }
                  }
                >
                  <Icon size={10} />
                  {p}
                </button>
              );
            })}
          </div>
          <button className={`w-full text-xs ${sub} flex items-center gap-1 justify-center pt-2 hover:text-[#4F6BED] transition-colors`}>
            <Bookmark size={11} /> Salvar visualização
          </button>
        </div>
      )}

      {/* Quadrant tabs */}
      <div className="px-4 mb-4 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {Q_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveQ(tab.key)}
            className={`flex-none text-[11px] px-3 py-1.5 rounded-full border transition-all whitespace-nowrap font-medium ${
              activeQ === tab.key
                ? "bg-[#4F6BED] border-[#4F6BED] text-white"
                : isDark ? "border-[#262B36] text-[#9AA0AC] hover:border-[#4F6BED]/40" : "border-slate-200 text-slate-500"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="px-4 space-y-4">
        {activeQ === "ALL" ? (
          (["Q1", "Q2", "Q3", "Q4"] as Quadrant[]).map(q => {
            const items = grouped[q];
            if (!items.length) return null;
            const meta = Q_META[q];
            return (
              <div key={q}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="w-2 h-2 rounded-full flex-none" style={{ background: Q_ACCENT[q] }} />
                  <span className={`text-xs font-semibold ${text}`}>{meta.label}</span>
                  <span className={`text-[10px] ${sub}`}>— {meta.desc}</span>
                  <span className={`ml-auto text-[10px] font-mono ${sub}`}>{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(t => (
                    <TaskCard key={t.id} task={t} isDark={isDark}
                      highlighted={highlighted === t.id}
                      onClick={() => setDetailTask(t)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="space-y-2">
            {filtered.length === 0 && <p className={`text-center ${sub} text-sm py-12`}>Nenhuma tarefa aqui.</p>}
            {filtered.map(t => (
              <TaskCard key={t.id} task={t} isDark={isDark}
                highlighted={highlighted === t.id}
                onClick={() => setDetailTask(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={handleCreate}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-[#4F6BED] hover:bg-[#3F5BD9] text-white shadow-xl flex items-center justify-center z-40 transition-all active:scale-95"
      >
        <Plus size={24} />
      </button>

      {/* Quick note FAB */}
      <button
        onClick={() => setShowNote(true)}
        title="Nota rápida"
        className={`fixed bottom-36 right-5 w-11 h-11 rounded-2xl flex items-center justify-center z-40 shadow-md transition-colors ${isDark ? "bg-[#1E222B] text-[#9AA0AC] hover:bg-[#262B36]" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
      >
        <FileText size={17} />
      </button>

      {showCreate && <TaskFormModal isDark={isDark} initial={createInitial} onClose={() => setShowCreate(false)}
        onCreated={createInitial ? () => localStorage.removeItem(NOTE_KEY) : undefined} />}
      {showNote && (
        <QuickNoteSheet
          isDark={isDark}
          onClose={() => setShowNote(false)}
          onConvert={(title, description) => {
            setShowNote(false);
            setCreateInitial({ title, description });
            setShowCreate(true);
          }}
        />
      )}
      {detailTask && (
        <TaskDetailModal task={detailTask} isDark={isDark} onClose={() => setDetailTask(null)} />
      )}

      <Toast />
    </div>
  );
}

export default HomeScreen;
