import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  type AppSubtask,
  addSubtask as treeAdd,
  updateSubtask as treeUpdate,
  removeSubtask as treeRemove,
  toggleSubtask as treeToggle,
  genId,
} from "../utils/subtaskTree";

// ── Types ─────────────────────────────────────────────────────────

export type Project =
  | "Faculdade"
  | "Trabalho"
  | "Finanças"
  | "Saúde"
  | "Pessoal"
  | "Lazer"
  | "Manutenção"
  | "Projetos";

export type Priority = "Alta" | "Média" | "Baixa";
export type Status =
  | "Pendente"
  | "Em Andamento"
  | "Em Revisão"
  | "Bloqueada"
  | "Concluída";
export type Quadrant = "Q1" | "Q2" | "Q3" | "Q4";

export type AppTask = {
  id: string;
  title: string;
  description: string;
  project: Project;
  priority: Priority;
  status: Status;
  dueDate: string;
  effort: string;
  quadrant: Quadrant;
  subtasks: AppSubtask[];
  updatedAt: string;
  syncPending: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────

export const PROJECT_COLORS: Record<Project, string> = {
  Faculdade: "#6366F1",
  Trabalho:  "#3B82F6",
  Finanças:  "#10B981",
  Saúde:     "#F43F5E",
  Pessoal:   "#F59E0B",
  Lazer:     "#D946EF",
  Manutenção:"#0EA5E9",
  Projetos:  "#8B5CF6",
};

export function deriveQuadrant(priority: Priority, dueDate: string): Quadrant {
  const now = new Date();
  const due = new Date(dueDate);
  const hoursUntil = (due.getTime() - now.getTime()) / 36e5;
  const important = priority !== "Baixa";
  const urgent = hoursUntil <= 24;
  if (important) return urgent ? "Q1" : "Q2";
  return urgent ? "Q3" : "Q4";
}

// ── Seed data ─────────────────────────────────────────────────────

// Formato do <input type="datetime-local"> no fuso local (toISOString usaria UTC)
export const toLocalInput = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);

const TODAY = new Date();
const fmt = toLocalInput;
const addH = (h: number) => fmt(new Date(TODAY.getTime() + h * 36e5));
const addD = (d: number) => fmt(new Date(TODAY.getTime() + d * 864e5));

const SEED: AppTask[] = [
  {
    id: "t1",
    title: "Estudar Árvores AVL para a prova de quarta",
    description:
      "Revisar rotações e balanceamento. Resolver exercícios do Cormen capítulo 13.",
    project: "Faculdade",
    priority: "Alta",
    status: "Em Andamento",
    dueDate: addH(6),
    effort: "2h",
    quadrant: "Q1",
    updatedAt: new Date().toISOString(),
    syncPending: false,
    subtasks: [
      {
        id: "s1a",
        title: "Revisar conceito de fator de balanceamento",
        completed: true,
        children: [
          { id: "s1a1", title: "Entender os casos -1, 0 e +1", completed: true, children: [] },
          { id: "s1a2", title: "Anotar a fórmula de altura da subárvore", completed: true, children: [] },
        ],
      },
      {
        id: "s1b",
        title: "Implementar rotações no caderno",
        completed: true,
        children: [
          { id: "s1b1", title: "Rotação simples à esquerda (RR)", completed: true, children: [] },
          { id: "s1b2", title: "Rotação simples à direita (LL)", completed: true, children: [] },
          { id: "s1b3", title: "Rotação dupla LR e RL", completed: false, dueDate: addH(10), children: [] },
        ],
      },
      { id: "s1c", title: "Resolver 5 exercícios práticos da lista 4", completed: false, children: [] },
      { id: "s1d", title: "Refazer o exercício 3 da prova anterior como simulado", completed: false, children: [] },
    ],
  },
  {
    id: "t2",
    title: "Finalizar relatório de Estatística Aplicada",
    description:
      "Análise exploratória com Python/Pandas, gráficos com Matplotlib e conclusões.",
    project: "Faculdade",
    priority: "Média",
    status: "Em Revisão",
    dueDate: addD(1),
    effort: "3h",
    quadrant: "Q2",
    updatedAt: new Date().toISOString(),
    syncPending: false,
    subtasks: [
      { id: "s2a", title: "Coletar os dados da pesquisa no Google Forms", completed: true, children: [] },
      {
        id: "s2b",
        title: "Calcular as medidas descritivas",
        completed: true,
        children: [
          { id: "s2b1", title: "Média, mediana e moda", completed: true, children: [] },
          { id: "s2b2", title: "Desvio padrão e variância", completed: true, children: [] },
        ],
      },
      {
        id: "s2c",
        title: "Montar os gráficos no Excel",
        completed: false,
        children: [
          { id: "s2c1", title: "Gráfico de barras por faixa de idade", completed: false, children: [] },
          { id: "s2c2", title: "Boxplot comparativo", completed: false, dueDate: addD(1), children: [] },
        ],
      },
      { id: "s2d", title: "Redigir conclusão e formatar em ABNT", completed: false, children: [] },
      { id: "s2e", title: "Revisar ortografia e exportar o PDF final", completed: false, children: [] },
    ],
  },
  {
    id: "t3",
    title: "Pagar fatura do Nubank antes do vencimento",
    description: "Verificar o valor total e pagar via PIX ou débito automático.",
    project: "Finanças",
    priority: "Alta",
    status: "Pendente",
    dueDate: addH(18),
    effort: "10m",
    quadrant: "Q1",
    updatedAt: new Date().toISOString(),
    syncPending: false,
    subtasks: [
      { id: "s3a", title: "Abrir app Nubank e verificar fatura", completed: false, children: [] },
      { id: "s3b", title: "Conferir lançamentos desconhecidos", completed: false, children: [] },
      { id: "s3c", title: "Efetuar pagamento via PIX", completed: false, children: [] },
    ],
  },
  {
    id: "t4",
    title: "Comprar suplementos e vitaminas na farmácia",
    description: "Whey, vitamina D3+K2, ômega 3, creatina. Checar desconto do plano.",
    project: "Saúde",
    priority: "Alta",
    status: "Pendente",
    dueDate: addH(4),
    effort: "30m",
    quadrant: "Q1",
    updatedAt: new Date().toISOString(),
    syncPending: false,
    subtasks: [
      { id: "s4a", title: "Conferir lista de suplementos em falta", completed: false, children: [] },
      { id: "s4b", title: "Ir à Farmácia São João", completed: false, children: [] },
    ],
  },
  {
    id: "t5",
    title: "Treino de perna — Leg day completo",
    description: "Agachamento, leg press, cadeira extensora, flexão e panturrilha.",
    project: "Saúde",
    priority: "Média",
    status: "Pendente",
    dueDate: addH(8),
    effort: "1h30",
    quadrant: "Q2",
    updatedAt: new Date().toISOString(),
    syncPending: false,
    subtasks: [
      { id: "s5a", title: "Agachamento livre — 4x12", completed: false, children: [] },
      { id: "s5b", title: "Leg press 45° — 4x15", completed: false, children: [] },
      { id: "s5c", title: "Cadeira extensora — 3x15", completed: false, children: [] },
    ],
  },
  {
    id: "t6",
    title: "Agendar troca de óleo da moto na oficina",
    description: "Motor já com 4.000km desde a última troca. Verificar filtro de ar também.",
    project: "Manutenção",
    priority: "Baixa",
    status: "Pendente",
    dueDate: addD(5),
    effort: "20m",
    quadrant: "Q4",
    updatedAt: new Date().toISOString(),
    syncPending: false,
    subtasks: [],
  },
  {
    id: "t7",
    title: "Enviar relatório semanal para o coordenador",
    description: "Consolidar horas, resumo de entregas e anexar evidências antes das 9h.",
    project: "Trabalho",
    priority: "Alta",
    status: "Em Andamento",
    dueDate: addD(1),
    effort: "45m",
    quadrant: "Q1",
    updatedAt: new Date().toISOString(),
    syncPending: false,
    subtasks: [
      { id: "s7a", title: "Consolidar as horas trabalhadas da semana", completed: true,  children: [] },
      { id: "s7b", title: "Escrever o resumo das entregas",            completed: false, children: [] },
      { id: "s7c", title: "Anexar as evidências e enviar por e-mail",  completed: false, children: [] },
    ],
  },
  {
    id: "t8",
    title: "Sessão de cinema com os amigos no sábado",
    description: "Combinar o filme, confirmar presença e comprar ingressos com antecedência.",
    project: "Lazer",
    priority: "Baixa",
    status: "Pendente",
    dueDate: addD(6),
    effort: "3h",
    quadrant: "Q4",
    updatedAt: new Date().toISOString(),
    syncPending: false,
    subtasks: [
      { id: "s8a", title: "Confirmar presença no grupo do WhatsApp", completed: false, children: [] },
      { id: "s8b", title: "Comprar os ingressos pelo app do cinema",  completed: false, children: [] },
    ],
  },
];

// ── Context ───────────────────────────────────────────────────────

type ToastMsg = { id: string; text: string; undoTask?: AppTask };

type TaskCtx = {
  tasks: AppTask[];
  toast: ToastMsg | null;
  syncQueue: number;
  createTask: (data: Omit<AppTask, "id" | "updatedAt" | "syncPending">) => string;
  updateTask: (id: string, patch: Partial<AppTask>) => void;
  deleteTask: (id: string) => void;
  restoreTask: (task: AppTask) => void;
  addSubtaskFn: (taskId: string, parentId: string | null, title: string) => void;
  updateSubtaskFn: (taskId: string, stId: string, patch: Partial<Omit<AppSubtask, "children">>) => void;
  removeSubtaskFn: (taskId: string, stId: string) => void;
  toggleSubtaskFn: (taskId: string, stId: string) => void;
  simulateSync: () => void;
  dismissToast: () => void;
};

const Ctx = createContext<TaskCtx | null>(null);

export function useTasks() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTasks must be used inside TaskProvider");
  return ctx;
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<AppTask[]>(SEED);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncQueue = tasks.filter(t => t.syncPending).length;

  const showToast = useCallback((text: string, undoTask?: AppTask) => {
    const id = genId();
    setToast({ id, text, undoTask });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const markSync = (id: string) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, syncPending: true, updatedAt: new Date().toISOString() } : t));

  const createTask = useCallback((data: Omit<AppTask, "id" | "updatedAt" | "syncPending">) => {
    const id = `task-${genId()}`;
    const task: AppTask = { ...data, id, updatedAt: new Date().toISOString(), syncPending: true };
    setTasks(prev => [task, ...prev]);
    showToast("✓ Tarefa criada · salva no SQLite local");
    return id;
  }, [showToast]);

  const updateTask = useCallback((id: string, patch: Partial<AppTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch, syncPending: true, updatedAt: new Date().toISOString() } : t));
    showToast("✓ Alterações salvas · salvo no SQLite local");
  }, [showToast]);

  const deleteTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast("✓ Tarefa excluída · salvo no SQLite local", task);
  }, [tasks, showToast]);

  const restoreTask = useCallback((task: AppTask) => {
    setTasks(prev => [task, ...prev.filter(t => t.id !== task.id)]);
    dismissToast();
    showToast("✓ Tarefa restaurada");
  }, [showToast, dismissToast]);

  const withSubtrees = useCallback((
    taskId: string,
    fn: (tree: AppSubtask[]) => AppSubtask[],
  ) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, subtasks: fn(t.subtasks), syncPending: true, updatedAt: new Date().toISOString() }
        : t,
    ));
    showToast("✓ Subtarefa atualizada · salvo no SQLite local");
  }, [showToast]);

  const addSubtaskFn = useCallback((taskId: string, parentId: string | null, title: string) => {
    withSubtrees(taskId, tree => treeAdd(tree, parentId, title));
  }, [withSubtrees]);

  const updateSubtaskFn = useCallback((taskId: string, stId: string, patch: Partial<Omit<AppSubtask, "children">>) => {
    withSubtrees(taskId, tree => treeUpdate(tree, stId, patch));
  }, [withSubtrees]);

  const removeSubtaskFn = useCallback((taskId: string, stId: string) => {
    withSubtrees(taskId, tree => treeRemove(tree, stId));
  }, [withSubtrees]);

  const toggleSubtaskFn = useCallback((taskId: string, stId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, subtasks: treeToggle(t.subtasks, stId), syncPending: true, updatedAt: new Date().toISOString() }
        : t,
    ));
  }, []);

  const simulateSync = useCallback(() => {
    const ids = tasks.filter(t => t.syncPending).map(t => t.id);
    let i = 0;
    const tick = () => {
      if (i >= ids.length) {
        showToast(`✓ ${ids.length} alterações sincronizadas com o servidor Node.js`);
        return;
      }
      setTasks(prev => prev.map(t => t.id === ids[i] ? { ...t, syncPending: false } : t));
      i++;
      setTimeout(tick, 300);
    };
    tick();
  }, [tasks, showToast]);

  return (
    <Ctx.Provider value={{
      tasks, toast, syncQueue,
      createTask, updateTask, deleteTask, restoreTask,
      addSubtaskFn, updateSubtaskFn, removeSubtaskFn, toggleSubtaskFn,
      simulateSync, dismissToast,
    }}>
      {children}
    </Ctx.Provider>
  );
}
