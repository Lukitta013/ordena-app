import { useState, useEffect, useMemo } from "react";
import {
  CheckSquare, Folder, Calendar, BarChart2, Settings, Sun, Moon, Monitor, Trash2, Pencil, ChevronLeft, ChevronRight, ArrowLeft, Plus, LogOut, MapPin, Repeat, AlertCircle, Link2, TrendingUp, Clock, Heart, Target, HardDrive, Wrench, Copy, Search, Moon as MoonIcon,
} from "lucide-react";
import TarefasHome, { TaskCard, TaskDetailModal } from "./telas/tarefas";
import {
  TaskProvider, useTasks, isDone, isOverdue, sameDay,
  FALLBACK_CATEGORY, FIXED_STATUSES, type Category, type StatusDef,
} from "./telas/tarefas/context/TaskContext";
import AuthFlow from "./telas/login";
import {
  GpsSection, DupSection, CalSection,
  AlertsSection, SearchSection, RecurSection,
} from "./telas/agenda";
import {
  BiSection, GanttSection, TelemetrySection, PredictSection,
  BurnoutSection, BackupSection, OkrSection,
  RulesSection, DailySection,
} from "./telas/analises";

// ── Types ─────────────────────────────────────────────────────────

type NavTab = "tarefas" | "projetos" | "agenda" | "analises" | "ajustes";
type ThemeMode = "light" | "dark" | "system";

// ── Theme hook ────────────────────────────────────────────────────

function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() =>
    (localStorage.getItem("ordena-theme-mode") as ThemeMode) ?? "system"
  );

  const media = useMemo(() => window.matchMedia("(prefers-color-scheme: dark)"), []);
  const [systemDark, setSystemDark] = useState(media.matches);
  useEffect(() => {
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [media]);

  const resolved: "light" | "dark" = mode === "system" ? (systemDark ? "dark" : "light") : mode;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
    localStorage.setItem("ordena-theme-mode", mode);
  }, [resolved, mode]);

  return { mode, setMode, isDark: resolved === "dark", theme: resolved };
}

// ── Section row (block link) ──────────────────────────────────────

function SectionRow({
  icon: Icon, label, sub, onPress,
}: {
  icon: React.ElementType;
  label: string;
  sub?: string;
  onPress: () => void;
}) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <Icon size={18} strokeWidth={1.5} style={{ color: "var(--sub)", flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium" style={{ color: "var(--text)" }}>{label}</p>
        {sub && <p className="text-[12px] mt-0.5" style={{ color: "var(--tertiary)" }}>{sub}</p>}
      </div>
      <ChevronRight size={16} strokeWidth={1.5} style={{ color: "var(--border)", flexShrink: 0 }} />
    </button>
  );
}

// ── Block container ───────────────────────────────────────────────

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p
        className="text-[11px] font-semibold uppercase tracking-widest px-4 mb-1"
        style={{ color: "var(--tertiary)" }}
      >
        {title}
      </p>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} className="mx-4 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ── Back header ───────────────────────────────────────────────────

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-3 sticky top-0 z-10 flex-none"
      style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
    >
      <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-lg" style={{ color: "var(--sub)" }}>
        <ArrowLeft size={20} strokeWidth={1.5} />
      </button>
      <p className="font-semibold text-[17px] flex-1" style={{ color: "var(--text)" }}>{title}</p>
    </div>
  );
}

// ── Sub-páginas: cada linha de menu abre exatamente uma seção ─────

const PAGES: Record<string, { title: string; C: React.ComponentType<{ isDark: boolean }> }> = {
  // Projetos
  gantt:       { title: "Cronograma Gantt", C: GanttSection },
  projecoes:   { title: "Projeções", C: PredictSection },
  templates:   { title: "Duplicação e Templates", C: DupSection },
  // Agenda
  recorrencia: { title: "Tarefas Recorrentes", C: RecurSection },
  geofencing:  { title: "Lembretes por Local", C: GpsSection },
  alertas:     { title: "Alertas de Prazo", C: AlertsSection },
  integracoes: { title: "Integrações", C: CalSection },
  busca:       { title: "Busca e Auditoria", C: SearchSection },
  // Análises
  avancado:    { title: "Painel de Produtividade", C: BiSection },
  tempo:       { title: "Tempo e Estimativas", C: TelemetrySection },
  "bem-estar": { title: "Bem-estar e Carga Diária", C: BurnoutSection },
  metas:       { title: "Metas Pessoais", C: OkrSection },
  fechamento:  { title: "Fechamento Diário (D+1)", C: DailySection },
  // Ajustes
  automacoes:  { title: "Automações", C: RulesSection },
  backup:      { title: "Backup e Exportação", C: BackupSection },
};

function SubPageView({ id, theme, onBack }: {
  id: string; theme: "dark" | "light"; onBack: () => void;
}) {
  const { title, C } = PAGES[id];
  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg)" }}>
      <BackHeader title={title} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <C isDark={theme === "dark"} />
      </div>
    </div>
  );
}

// ── ── SCREENS ── ────────────────────────────────────────────────

// ── TarefasScreen ─────────────────────────────────────────────────

function TarefasScreen({
  theme,
}: {
  theme: "dark" | "light";
}) {
  return (
    <div className="h-full">
      <TarefasHome theme={theme} />
    </div>
  );
}

// ── ProjetosScreen ────────────────────────────────────────────────

const fieldCls = "w-full text-[13px] px-3 py-2 rounded-lg outline-none";
const fieldStyle = { background: "var(--sunken)", border: "1px solid var(--border)", color: "var(--text)" };
const fmtDia = (d?: string) => d ? new Date(d + "T00:00").toLocaleDateString("pt-BR") : "";

function CategoryForm({ initial, onSave, onCancel }: { initial: Category; onSave: (c: Category) => void; onCancel: () => void }) {
  const { categories } = useTasks();
  const [c, setC] = useState(initial);
  const name = c.name.trim();
  const taken = name.toLowerCase() !== initial.name.toLowerCase()
    && categories.some(x => x.name.toLowerCase() === name.toLowerCase());
  const save = () => { if (name && !taken) onSave({ ...c, name, desc: c.desc.trim() }); };

  return (
    <div className="rounded-xl p-3 space-y-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <input autoFocus placeholder="Nome da categoria" value={c.name} onChange={e => setC({ ...c, name: e.target.value })}
        className={fieldCls} style={fieldStyle} />
      {taken && <p className="text-[12px]" style={{ color: "var(--critical)" }}>Já existe uma categoria com esse nome.</p>}
      <input placeholder="Descrição (opcional)" value={c.desc} onChange={e => setC({ ...c, desc: e.target.value })}
        className={fieldCls} style={fieldStyle} />
      <label className="flex items-center gap-2 text-[13px]" style={{ color: "var(--sub)" }}>
        Cor
        <input type="color" value={c.color} onChange={e => setC({ ...c, color: e.target.value })}
          className="w-8 h-8 rounded-lg bg-transparent border-0 p-0" />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-[12px]" style={{ color: "var(--sub)" }}>
          Início
          <input type="date" value={c.start ?? ""} onChange={e => setC({ ...c, start: e.target.value || undefined })}
            className={fieldCls} style={fieldStyle} />
        </label>
        <label className="text-[12px]" style={{ color: "var(--sub)" }}>
          Fim
          <input type="date" value={c.end ?? ""} min={c.start} onChange={e => setC({ ...c, end: e.target.value || undefined })}
            className={fieldCls} style={fieldStyle} />
        </label>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg text-[13px]" style={{ border: "1px solid var(--border)", color: "var(--sub)" }}>
          Cancelar
        </button>
        <button onClick={save} disabled={!name || taken} className="flex-1 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-40"
          style={{ background: "var(--accent)" }}>
          Salvar
        </button>
      </div>
    </div>
  );
}

function StatusRow({ st }: { st: StatusDef }) {
  const { statuses, saveStatus, removeStatus } = useTasks();
  const fixed = FIXED_STATUSES.includes(st.name);
  const [name, setName] = useState(st.name);
  const commit = () => {
    const n = name.trim();
    if (!n || n === st.name || statuses.some(x => x.name.toLowerCase() === n.toLowerCase())) { setName(st.name); return; }
    saveStatus(st.name, { ...st, name: n });
  };
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={st.color} onChange={e => saveStatus(st.name, { ...st, color: e.target.value })}
        className="w-7 h-7 flex-none rounded-md bg-transparent border-0 p-0" />
      <input value={name} readOnly={fixed} onChange={e => setName(e.target.value)} onBlur={commit}
        onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
        className={fieldCls} style={{ ...fieldStyle, color: st.color }} />
      {fixed ? <span className="w-8 flex-none" /> : (
        <button aria-label={`Excluir status ${st.name}`} className="w-8 flex-none flex justify-center" style={{ color: "var(--tertiary)" }}
          onClick={() => { if (window.confirm(`Excluir o status "${st.name}"? As tarefas com ele voltam para Pendente.`)) removeStatus(st.name); }}>
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

function StatusManager() {
  const { statuses, saveStatus } = useTasks();
  const [novo, setNovo] = useState("");
  const add = () => {
    const n = novo.trim();
    if (!n || statuses.some(x => x.name.toLowerCase() === n.toLowerCase())) return;
    saveStatus(null, { name: n, color: "#4F6BED" });
    setNovo("");
  };
  return (
    <div className="px-4 py-3 space-y-2">
      {statuses.map(st => <StatusRow key={st.name} st={st} />)}
      <div className="flex items-center gap-2 pt-1">
        <input placeholder="Novo status" value={novo} onChange={e => setNovo(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") add(); }} className={fieldCls} style={fieldStyle} />
        <button onClick={add} aria-label="Adicionar status" className="w-8 h-8 flex-none rounded-lg flex items-center justify-center text-white"
          style={{ background: "var(--accent)" }}>
          <Plus size={16} />
        </button>
      </div>
      <p className="text-[11px]" style={{ color: "var(--tertiary)" }}>Pendente e Concluída são fixos.</p>
    </div>
  );
}

function CategoriaView({ id, theme, onBack, onRenamed }: { id: string; theme: "dark" | "light"; onBack: () => void; onRenamed: (name: string) => void }) {
  const { tasks, categories, saveCategory, removeCategory } = useTasks();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const cat = categories.find(c => c.name === id);
  const list = tasks
    .filter(t => t.project === id)
    .sort((a, b) => Number(isDone(a)) - Number(isDone(b)) || a.dueDate.localeCompare(b.dueDate));
  const detail = tasks.find(t => t.id === detailId);
  const pending = list.filter(t => !isDone(t)).length;
  if (!cat) return null;

  const remove = () => {
    const msg = list.length
      ? `Excluir a categoria "${id}"? As ${list.length} tarefas dela vão para ${FALLBACK_CATEGORY}.`
      : `Excluir a categoria "${id}"?`;
    if (!window.confirm(msg)) return;
    removeCategory(id);
    onBack();
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg)" }}>
      <BackHeader title={id} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {editing ? (
          <CategoryForm initial={cat} onCancel={() => setEditing(false)}
            onSave={c => { saveCategory(id, c); setEditing(false); if (c.name !== id) onRenamed(c.name); }} />
        ) : (
          <div className="rounded-xl p-3 mb-1" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: `3px solid ${cat.color}` }}>
            {cat.desc && <p className="text-[13px]" style={{ color: "var(--text)" }}>{cat.desc}</p>}
            {(cat.start || cat.end) && (
              <p className="text-[12px] font-mono mt-0.5" style={{ color: "var(--sub)" }}>
                {fmtDia(cat.start) || "…"} até {fmtDia(cat.end) || "…"}
              </p>
            )}
            <div className="flex gap-4 mt-2">
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-[13px] font-medium" style={{ color: "var(--accent)" }}>
                <Pencil size={13} /> Editar
              </button>
              {id !== FALLBACK_CATEGORY && (
                <button onClick={remove} className="flex items-center gap-1 text-[13px] font-medium" style={{ color: "var(--critical)" }}>
                  <Trash2 size={13} /> Excluir
                </button>
              )}
            </div>
          </div>
        )}
        <p className="text-[13px] mb-1" style={{ color: "var(--sub)" }}>
          {pending === 0 ? "Nada pendente aqui." : `${pending} ${pending === 1 ? "tarefa pendente" : "tarefas pendentes"}`}
        </p>
        {list.length === 0 && (
          <p className="text-[13px]" style={{ color: "var(--tertiary)" }}>Nenhuma tarefa nesta categoria ainda.</p>
        )}
        {list.map(t => (
          <TaskCard key={t.id} task={t} isDark={theme === "dark"} highlighted={false} onClick={() => setDetailId(t.id)} />
        ))}
      </div>
      {detail && <TaskDetailModal task={detail} isDark={theme === "dark"} onClose={() => setDetailId(null)} />}
    </div>
  );
}

function ProjetosScreen({
  theme,
}: {
  theme: "dark" | "light";
}) {
  const [subPage, setSubPage] = useState<string | null>(null);
  const { tasks, categories, saveCategory } = useTasks();

  const [categoria, setCategoria] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  if (categoria) return <CategoriaView id={categoria} theme={theme} onBack={() => setCategoria(null)} onRenamed={setCategoria} />;
  if (subPage) return <SubPageView id={subPage} theme={theme} onBack={() => setSubPage(null)} />;

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-6" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-semibold text-[22px]" style={{ color: "var(--text)" }}>Projetos</h1>
        </div>
        <p className="text-[13px]" style={{ color: "var(--sub)" }}>{categories.length} {categories.length === 1 ? "categoria" : "categorias"}</p>
      </div>

      {/* Project grid */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-2">
        {categories.map(p => (
          <button
            key={p.name}
            onClick={() => setCategoria(p.name)}
            className="rounded-xl p-4 text-left active:scale-[0.98] transition-transform"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: `3px solid ${p.color}` }}
          >
            <p className="font-semibold text-[14px] mb-0.5" style={{ color: "var(--text)" }}>{p.name}</p>
            <p className="text-[12px]" style={{ color: "var(--sub)" }}>{p.desc}</p>
            <p className="text-[11px] font-mono mt-1" style={{ color: "var(--tertiary)" }}>
              {tasks.filter(t => t.project === p.name && !isDone(t)).length} em aberto
            </p>
          </button>
        ))}
      </div>
      <div className="px-4 mb-2">
        {creating ? (
          <CategoryForm initial={{ name: "", desc: "", color: "#4F6BED" }} onCancel={() => setCreating(false)}
            onSave={c => { saveCategory(null, c); setCreating(false); }} />
        ) : (
          <button onClick={() => setCreating(true)} className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-[13px] font-medium"
            style={{ border: "1px dashed var(--border)", color: "var(--accent)" }}>
            <Plus size={15} /> Nova categoria
          </button>
        )}
      </div>

      <Block title="Status das tarefas">
        <StatusManager />
      </Block>

      {/* Planning block */}
      <Block title="Planejamento">
        <SectionRow icon={Calendar} label="Cronograma Gantt" sub="Linhas do tempo e dependências" onPress={() => setSubPage("gantt")} />
        <SectionRow icon={TrendingUp} label="Projeções" sub="Estimativas de conclusão" onPress={() => setSubPage("projecoes")} />
      </Block>

      <Block title="Organização">
        <SectionRow icon={Copy} label="Duplicação e Templates" sub="Rotinas reutilizáveis" onPress={() => setSubPage("templates")} />
      </Block>
    </div>
  );
}

// ── AgendaScreen ──────────────────────────────────────────────────

function MiniCalendar({ year, month, taskDays, selected, onSelect, onMonth }: {
  year: number; month: number; taskDays: Set<number>; selected: number;
  onSelect: (d: number) => void; onMonth: (delta: number) => void;
}) {
  const now = new Date();
  const today = now.getFullYear() === year && now.getMonth() === month ? now.getDate() : 0;
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const DAYS = ["D","S","T","Q","Q","S","S"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => onMonth(-1)} aria-label="Mês anterior" className="p-1.5 rounded-full" style={{ color: "var(--sub)" }}>
          <ChevronLeft size={18} />
        </button>
        <p className="font-semibold text-[15px]" style={{ color: "var(--text)" }}>
          {MONTHS[month]} {year}
        </p>
        <button onClick={() => onMonth(1)} aria-label="Próximo mês" className="p-1.5 rounded-full" style={{ color: "var(--sub)" }}>
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((d, i) => (
          <p key={i} className="text-center text-[11px] font-medium py-1" style={{ color: "var(--tertiary)" }}>{d}</p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => (
          <button
            key={i}
            disabled={!d}
            onClick={() => d && onSelect(d)}
            className="relative aspect-square flex items-center justify-center rounded-full"
          >
            {d && (
              <span
                className="w-7 h-7 flex items-center justify-center rounded-full text-[13px]"
                style={{
                  background: d === selected ? "var(--accent)" : "transparent",
                  color: d === selected ? "#fff" : d === today ? "var(--accent)" : "var(--text)",
                  fontWeight: d === today || d === selected ? 600 : 400,
                  border: d === today && d !== selected ? "1px solid var(--accent)" : "none",
                }}
              >
                {d}
              </span>
            )}
            {d && taskDays.has(d) && d !== selected && (
              <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ background: "var(--accent)" }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function AgendaScreen({ theme, onOpenTasks }: { theme: "dark" | "light"; onOpenTasks: () => void }) {
  const [subPage, setSubPage] = useState<string | null>(null);
  const { tasks } = useTasks();
  const now = new Date();
  const [selDate, setSelDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  const year = selDate.getFullYear();
  const month = selDate.getMonth();
  const taskDays = new Set(
    tasks.map(t => new Date(t.dueDate))
      .filter(d => d.getMonth() === month && d.getFullYear() === year)
      .map(d => d.getDate()),
  );
  const isToday = selDate.toDateString() === now.toDateString();
  // Ao trocar de mês, seleciona hoje se for o mês atual; senão, o dia 1
  const changeMonth = (delta: number) => {
    const first = new Date(year, month + delta, 1);
    const current = first.getFullYear() === now.getFullYear() && first.getMonth() === now.getMonth();
    setSelDate(current ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) : first);
  };
  const dayTasks = tasks
    .filter(t => sameDay(t.dueDate, selDate))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  if (subPage) return <SubPageView id={subPage} theme={theme} onBack={() => setSubPage(null)} />;

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-6" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-semibold text-[22px]" style={{ color: "var(--text)" }}>Agenda</h1>
        </div>
      </div>

      {/* Mini calendar */}
      <div
        className="mx-4 rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <MiniCalendar year={year} month={month} taskDays={taskDays} selected={selDate.getDate()}
          onSelect={d => setSelDate(new Date(year, month, d))} onMonth={changeMonth} />
      </div>

      {/* Today's tasks note */}
      <div className="mx-4 mt-3 px-4 py-3 rounded-xl" style={{ background: "var(--sunken)", border: "1px solid var(--border)" }}>
        <p className="text-[12px] font-mono uppercase" style={{ color: "var(--tertiary)" }}>
          {isToday ? "Hoje" : selDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          {dayTasks.length > 0 && ` · ${dayTasks.length} ${dayTasks.length === 1 ? "tarefa" : "tarefas"}`}
        </p>
        {dayTasks.length === 0 ? (
          <p className="text-[13px] mt-1" style={{ color: "var(--sub)" }}>
            Nenhuma tarefa com prazo {isToday ? "hoje" : "neste dia"}.
          </p>
        ) : dayTasks.map(t => (
          <button key={t.id} onClick={onOpenTasks} className="w-full flex items-center gap-2 mt-1.5 text-left">
            <span className="text-[12px] font-mono flex-none" style={{ color: "var(--accent)" }}>
              {new Date(t.dueDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span
              className="text-[13px] truncate"
              style={{ color: isDone(t) ? "var(--tertiary)" : "var(--text)", textDecoration: isDone(t) ? "line-through" : "none" }}
            >
              {t.title}
            </span>
          </button>
        ))}
      </div>

      {/* Lembretes block */}
      <Block title="Lembretes e Rotinas">
        <SectionRow icon={Repeat} label="Tarefas Recorrentes" sub="Diárias, semanais e mensais" onPress={() => setSubPage("recorrencia")} />
        <SectionRow icon={MapPin} label="Lembretes por Local" sub="Geofencing por proximidade" onPress={() => setSubPage("geofencing")} />
        <SectionRow icon={AlertCircle} label="Alertas de Prazo" sub="Notificações configuráveis" onPress={() => setSubPage("alertas")} />
        <SectionRow icon={Link2} label="Integrações" sub="Google Calendar" onPress={() => setSubPage("integracoes")} />
        <SectionRow icon={Search} label="Busca e Auditoria" sub="Busca tolerante a erros e histórico" onPress={() => setSubPage("busca")} />
      </Block>
    </div>
  );
}

// ── AnalisesScreen ────────────────────────────────────────────────

function AnalisesScreen({ theme }: { theme: "dark" | "light" }) {
  const [subPage, setSubPage] = useState<string | null>(null);
  const { tasks } = useTasks();

  if (subPage) return <SubPageView id={subPage} theme={theme} onBack={() => setSubPage(null)} />;

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-6" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-semibold text-[22px]" style={{ color: "var(--text)" }}>Análises</h1>
        </div>
        <p className="text-[13px]" style={{ color: "var(--sub)" }}>Todas as suas tarefas</p>
      </div>

      {/* KPI row */}
      <div className="px-4 grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Concluídas", value: tasks.filter(isDone).length, color: "var(--success)" },
          { label: "Em aberto", value: tasks.filter(t => !isDone(t) && !isOverdue(t)).length, color: "var(--accent)" },
          { label: "Atrasadas", value: tasks.filter(isOverdue).length, color: "var(--critical)" },
        ].map(k => (
          <div key={k.label} className="rounded-xl px-3 py-4 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-[22px] font-bold mb-0.5" style={{ color: k.color }}>{k.value}</p>
            <p className="text-[11px]" style={{ color: "var(--sub)" }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* BI section */}
      <div className="mx-4 rounded-xl overflow-hidden mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="font-semibold text-[14px]" style={{ color: "var(--text)" }}>Análises completas</p>
        </div>
        <button
          onClick={() => setSubPage("avancado")}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <p className="text-[13px]" style={{ color: "var(--sub)" }}>Conclusões por dia e comparação mensal</p>
          <ChevronRight size={16} style={{ color: "var(--border)" }} />
        </button>
      </div>

      {/* Aprofundar block */}
      <Block title="Aprofundar">
        <SectionRow icon={Clock} label="Tempo e Estimativas" sub="Calibração de esforço" onPress={() => setSubPage("tempo")} />
        <SectionRow icon={Heart} label="Bem-estar e Carga Diária" sub="Burnout e pausas" onPress={() => setSubPage("bem-estar")} />
        <SectionRow icon={Target} label="Metas Pessoais" sub="Progresso diário e semanal" onPress={() => setSubPage("metas")} />
        <SectionRow icon={MoonIcon} label="Fechamento Diário" sub="Resumo do dia e plano D+1" onPress={() => setSubPage("fechamento")} />
      </Block>
    </div>
  );
}

// ── AjustesScreen ─────────────────────────────────────────────────

function AjustesScreen({
  themeMode, setThemeMode, onLogout, isDark,
}: {
  themeMode: ThemeMode;
  setThemeMode: (t: ThemeMode) => void;
  onLogout: () => void;
  isDark: boolean;
}) {
  const THEME_OPTS: { key: ThemeMode; label: string; Icon: React.ElementType }[] = [
    { key: "light",  label: "Claro",   Icon: Sun },
    { key: "dark",   label: "Escuro",  Icon: Moon },
    { key: "system", label: "Sistema", Icon: Monitor },
  ];
  const [subPage, setSubPage] = useState<string | null>(null);
  if (subPage)
    return <SubPageView id={subPage} theme={isDark ? "dark" : "light"} onBack={() => setSubPage(null)} />;

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-8" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="font-semibold text-[22px]" style={{ color: "var(--text)" }}>Ajustes</h1>
      </div>

      {/* Profile card */}
      <div
        className="mx-4 rounded-xl p-4 flex items-center gap-4 mb-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-none"
          style={{ background: "var(--accent)" }}
        >
          <span className="text-white font-bold text-xl">L</span>
        </div>
        <div>
          <p className="font-semibold text-[16px]" style={{ color: "var(--text)" }}>Lucas Inacio de Carvalho</p>
          <p className="text-[13px]" style={{ color: "var(--sub)" }}>lucas@email.com</p>
          <span
            className="font-mono text-[11px] px-1.5 py-0.5 rounded border mt-1 inline-block"
            style={{ color: "var(--accent)", borderColor: "var(--accent)", opacity: 0.7 }}
          >
            Plano Gratuito
          </span>
        </div>
      </div>

      {/* Aparência */}
      <Block title="Aparência">
        <div className="p-4">
          <p className="text-[13px] font-medium mb-3" style={{ color: "var(--text)" }}>Tema</p>
          <div className="flex gap-2">
            {THEME_OPTS.map(({ key, label, Icon }) => {
              const active = themeMode === key;
              return (
                <button
                  key={key}
                  onClick={() => setThemeMode(key)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all"
                  style={{
                    background: active ? "var(--accent)" : "var(--sunken)",
                    borderColor: active ? "var(--accent)" : "var(--border)",
                  }}
                >
                  <Icon size={18} strokeWidth={1.5} style={{ color: active ? "#fff" : "var(--sub)" }} />
                  <span className="text-[12px] font-medium" style={{ color: active ? "#fff" : "var(--sub)" }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Block>

      {/* Aplicativo block */}
      <Block title="Aplicativo">
        <SectionRow icon={Wrench} label="Automações" sub="Regras e gatilhos" onPress={() => setSubPage("automacoes")} />
        <SectionRow icon={HardDrive} label="Backup e Exportação" sub="Nuvem e relatório PDF" onPress={() => setSubPage("backup")} />
      </Block>

      {/* Logout */}
      <div className="px-4 mt-6">
        <button
          onClick={onLogout}
          className="w-full h-[48px] rounded-xl font-medium text-[14px] flex items-center justify-center gap-2"
          style={{ border: "1px solid var(--critical)", color: "var(--critical)" }}
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sair da conta
        </button>
      </div>

      {/* App version */}
      <p className="text-center mt-4 font-mono text-[11px]" style={{ color: "var(--border)" }}>
        Ordena v1.0 · Lucas Inacio de Carvalho
      </p>
    </div>
  );
}

// ── Nav items ─────────────────────────────────────────────────────

const NAV_ITEMS: { key: NavTab; label: string; Icon: React.ElementType }[] = [
  { key: "tarefas",  label: "Tarefas",  Icon: CheckSquare },
  { key: "projetos", label: "Projetos", Icon: Folder },
  { key: "agenda",   label: "Agenda",   Icon: Calendar },
  { key: "analises", label: "Análises", Icon: BarChart2 },
  { key: "ajustes",  label: "Ajustes",  Icon: Settings },
];

// ── Sidebar (≥900px) ──────────────────────────────────────────────

function Sidebar({
  active, onChange, onNewTask,
}: {
  active: NavTab;
  onChange: (t: NavTab) => void;
  onNewTask: () => void;
}) {
  return (
    <aside
      className="hidden min-[900px]:flex flex-col flex-none"
      style={{ width: 224, borderRight: "1px solid var(--border)", background: "var(--surface)" }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <p className="font-serif text-[22px]" style={{ color: "var(--text)", letterSpacing: "-0.3px" }}>Ordena</p>
        <p className="text-[12px] mt-0.5" style={{ color: "var(--tertiary)" }}>Lucas Inacio de Carvalho</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const active_item = key === active;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2 transition-all"
              style={{
                width: "calc(100% - 16px)",
                background: active_item ? "var(--sunken)" : "transparent",
                color: active_item ? "var(--accent)" : "var(--sub)",
              }}
            >
              <Icon size={20} strokeWidth={active_item ? 2 : 1.5} />
              <span className="text-[14px] font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* New task button */}
      <div className="px-4 pb-6 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          onClick={onNewTask}
          className="w-full flex items-center justify-center gap-2 h-[40px] rounded-xl font-semibold text-[14px]"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <Plus size={16} /> Nova tarefa
        </button>
      </div>
    </aside>
  );
}

// ── Bottom nav (< 900px) ──────────────────────────────────────────

function BottomNav({ active, onChange }: { active: NavTab; onChange: (t: NavTab) => void }) {
  return (
    <nav
      className="min-[900px]:hidden flex-none flex"
      style={{ height: 64, borderTop: "1px solid var(--border)", background: "var(--surface)" }}
    >
      {NAV_ITEMS.map(({ key, label, Icon }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="flex-1 flex flex-col items-center justify-center gap-1"
          >
            <Icon size={22} strokeWidth={isActive ? 2 : 1.5} style={{ color: isActive ? "var(--accent)" : "var(--sub)" }} />
            <span className="text-[10px] font-medium" style={{ color: isActive ? "var(--accent)" : "var(--sub)" }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ── App ───────────────────────────────────────────────────────────

export default function App() {
  const { mode: themeMode, setMode: setThemeMode, isDark, theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem("ordena-auth") === "1");
  useEffect(() => { localStorage.setItem("ordena-auth", isAuthenticated ? "1" : "0"); }, [isAuthenticated]);
  const [navTab, setNavTab] = useState<NavTab>("tarefas");

  const handleNavChange = (tab: NavTab) => setNavTab(tab);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setNavTab("tarefas");
  };

  // Auth flow: full screen on mobile, centered card on desktop
  if (!isAuthenticated) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            width: "100%",
            maxWidth: 480,
            height: "100vh",
            background: "var(--bg)",
          }}
        >
          <AuthFlow onAuthenticated={() => setIsAuthenticated(true)} />
        </div>
      </div>
    );
  }

  // Main app: full screen, responsive sidebar/bottom nav
  const renderScreen = () => {
    switch (navTab) {
      case "tarefas":  return <TarefasScreen  theme={theme} />;
      case "projetos": return <ProjetosScreen  theme={theme} />;
      case "agenda":   return <AgendaScreen    theme={theme} onOpenTasks={() => setNavTab("tarefas")} />;
      case "analises": return <AnalisesScreen  theme={theme} />;
      case "ajustes":  return (
        <AjustesScreen
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          onLogout={handleLogout}
          isDark={isDark}
        />
      );
    }
  };

  return (
    // TaskProvider fica aqui (e não dentro da aba Tarefas) para as tarefas não sumirem ao trocar de aba
    <TaskProvider>
    <div
      className="flex h-screen"
      style={{ background: "var(--bg)" }}
    >
      {/* Desktop sidebar */}
      <Sidebar
        active={navTab}
        onChange={handleNavChange}
        onNewTask={() => setNavTab("tarefas")}
      />

      {/* Content + mobile nav */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {renderScreen()}
        </div>
        <BottomNav active={navTab} onChange={handleNavChange} />
      </div>
    </div>
    </TaskProvider>
  );
}
