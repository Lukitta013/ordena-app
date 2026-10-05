import { useState, useEffect, useMemo } from "react";
import {
  CheckSquare, Folder, Calendar, BarChart2, Settings, Sun, Moon, Monitor, ChevronRight, ArrowLeft, Plus, LogOut, MapPin, Repeat, AlertCircle, Link2, TrendingUp, Clock, Heart, Target, HardDrive, Wrench, Copy, Search, Moon as MoonIcon,
} from "lucide-react";
import TarefasHome, { TaskCard, TaskDetailModal } from "./telas/tarefas";
import { TaskProvider, useTasks, isDone, isOverdue, sameDay } from "./telas/tarefas/context/TaskContext";
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

const PROJETOS_LIST = [
  { id: "Faculdade",  desc: "Disciplinas e trabalhos",  color: "#6366F1" },
  { id: "Trabalho",   desc: "Projetos profissionais",   color: "#3B82F6" },
  { id: "Finanças",   desc: "Orçamento e contas",       color: "#10B981" },
  { id: "Saúde",      desc: "Rotina e bem-estar",       color: "#F43F5E" },
  { id: "Pessoal",    desc: "Metas pessoais",           color: "#F59E0B" },
  { id: "Lazer",      desc: "Entretenimento",           color: "#D946EF" },
  { id: "Manutenção", desc: "Casa e equipamentos",      color: "#0EA5E9" },
  { id: "Projetos",   desc: "Iniciativas diversas",     color: "#8B5CF6" },
];

function CategoriaView({ id, theme, onBack }: { id: string; theme: "dark" | "light"; onBack: () => void }) {
  const { tasks } = useTasks();
  const [detailId, setDetailId] = useState<string | null>(null);
  const list = tasks
    .filter(t => t.project === id)
    .sort((a, b) => Number(isDone(a)) - Number(isDone(b)) || a.dueDate.localeCompare(b.dueDate));
  const detail = tasks.find(t => t.id === detailId);
  const pending = list.filter(t => !isDone(t)).length;

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg)" }}>
      <BackHeader title={id} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
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
  const { tasks } = useTasks();

  const [categoria, setCategoria] = useState<string | null>(null);

  if (categoria) return <CategoriaView id={categoria} theme={theme} onBack={() => setCategoria(null)} />;
  if (subPage) return <SubPageView id={subPage} theme={theme} onBack={() => setSubPage(null)} />;

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-6" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-semibold text-[22px]" style={{ color: "var(--text)" }}>Projetos</h1>
        </div>
        <p className="text-[13px]" style={{ color: "var(--sub)" }}>8 categorias ativas</p>
      </div>

      {/* Project grid */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-2">
        {PROJETOS_LIST.map(p => (
          <button
            key={p.id}
            onClick={() => setCategoria(p.id)}
            className="rounded-xl p-4 text-left active:scale-[0.98] transition-transform"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: `3px solid ${p.color}` }}
          >
            <p className="font-semibold text-[14px] mb-0.5" style={{ color: "var(--text)" }}>{p.id}</p>
            <p className="text-[12px]" style={{ color: "var(--sub)" }}>{p.desc}</p>
            <p className="text-[11px] font-mono mt-1" style={{ color: "var(--tertiary)" }}>
              {tasks.filter(t => t.project === p.id && !isDone(t)).length} em aberto
            </p>
          </button>
        ))}
      </div>

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

function MiniCalendar({ taskDays, selected, onSelect }: { taskDays: Set<number>; selected: number; onSelect: (d: number) => void }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const DAYS = ["D","S","T","Q","Q","S","S"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <div className="px-4 py-4">
      <p className="font-semibold text-[15px] mb-3" style={{ color: "var(--text)" }}>
        {MONTHS[month]} {year}
      </p>
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
  const taskDays = new Set(
    tasks.map(t => new Date(t.dueDate))
      .filter(d => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear())
      .map(d => d.getDate()),
  );
  const [selDay, setSelDay] = useState(now.getDate());
  const selDate = new Date(now.getFullYear(), now.getMonth(), selDay);
  const isToday = selDay === now.getDate();
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
        <MiniCalendar taskDays={taskDays} selected={selDay} onSelect={setSelDay} />
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
