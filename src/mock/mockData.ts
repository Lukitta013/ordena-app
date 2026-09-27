export type Priority = "ALTA" | "MEDIA" | "BAIXA";
export type Status = "Pendente" | "Em Andamento" | "Em Revisão" | "Bloqueada" | "Concluída";
export type Quadrant = "Q1" | "Q2" | "Q3" | "Q4";

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  capacity: number; // %
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  assignee?: string;
  deadline?: string;
  children?: Subtask[];
}

export interface Attachment {
  id: string;
  type: "audio" | "image" | "pdf";
  name: string;
  size: string;
  url: string;
  duration?: string;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  attachment?: Attachment;
}

export interface AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  detail: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  projectColor: string;
  priority: Priority;
  status: Status;
  quadrant: Quadrant;
  effort: number; // hours
  deadline: string;
  tags: string[];
  assignee: string;
  subtasks: Subtask[];
  attachments: Attachment[];
  comments: Comment[];
  dependencies: string[]; // task ids
  isRecurring: boolean;
  recurringPeriod?: "Diária" | "Semanal" | "Mensal";
  location?: { name: string; lat: number; lng: number; radius: number };
  complexityIndex: number;
  estimatedTime: number; // hours
  realTime: number; // hours
  progress: number; // 0-100
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  synced: boolean;
  taskId?: string;
}

export interface JsonRule {
  id: string;
  condition: string;
  action: string;
  active: boolean;
}

export interface OKR {
  id: string;
  goal: string;
  target: number;
  current: number;
  unit: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "tm1", name: "Lucas Inacio", avatar: "LI", role: "Tech Lead", capacity: 92 },
  { id: "tm2", name: "Mariana Silva", avatar: "MS", role: "Backend Dev", capacity: 65 },
  { id: "tm3", name: "Carlos Souza", avatar: "CS", role: "Frontend Dev", capacity: 30 },
  { id: "tm4", name: "Ana Mendes", avatar: "AM", role: "UX Designer", capacity: 78 },
];

export const PROJECTS = [
  { id: "p1", name: "App Ordena - Sprint Core", color: "#6366F1" },
  { id: "p2", name: "Backend Node.js", color: "#10B981" },
  { id: "p3", name: "Infraestrutura MinIO/S3", color: "#F59E0B" },
  { id: "p4", name: "Design System Figma", color: "#EC4899" },
];

function calcProgress(subtasks: Subtask[]): number {
  if (!subtasks.length) return 0;
  const all: Subtask[] = [];
  const flatten = (s: Subtask[]) => s.forEach(t => { all.push(t); if (t.children) flatten(t.children); });
  flatten(subtasks);
  return Math.round((all.filter(s => s.done).length / all.length) * 100);
}

const subtasksT1: Subtask[] = [
  {
    id: "st1-1", title: "Configurar índices compostos no SQLite", done: true,
    assignee: "Lucas Inacio", deadline: "2025-09-10",
    children: [
      { id: "st1-1-1", title: "Mapear queries mais lentas", done: true },
      { id: "st1-1-2", title: "Criar migration v2_indexes.sql", done: true },
    ],
  },
  { id: "st1-2", title: "Implementar WAL mode para concorrência", done: true, assignee: "Carlos Souza", deadline: "2025-09-11" },
  { id: "st1-3", title: "Testes de performance com 10k registros", done: false, assignee: "Mariana Silva", deadline: "2025-09-14" },
  { id: "st1-4", title: "Documentar estratégia offline-first", done: false, assignee: "Ana Mendes", deadline: "2025-09-15" },
  { id: "st1-5", title: "Code review e merge na branch main", done: false, assignee: "Lucas Inacio", deadline: "2025-09-16" },
];

const subtasksT2: Subtask[] = [
  { id: "st2-1", title: "Criar endpoint POST /tasks no Express", done: true, assignee: "Mariana Silva" },
  { id: "st2-2", title: "Validação de schema com Zod", done: true, assignee: "Mariana Silva" },
  { id: "st2-3", title: "Integrar JWT middleware de autenticação", done: false, assignee: "Lucas Inacio" },
  { id: "st2-4", title: "Testes unitários com Jest (coverage > 80%)", done: false, assignee: "Carlos Souza" },
];

const subtasksT3: Subtask[] = [
  { id: "st3-1", title: "Provisionar bucket minio-ordena", done: true },
  { id: "st3-2", title: "Configurar políticas IAM de acesso", done: false },
  { id: "st3-3", title: "Implementar upload multipart", done: false },
];

export const TASKS: Task[] = [
  {
    id: "t1",
    title: "Corrigir vazamento de memória no build",
    description: "O processo de build está consumindo 4GB+ de RAM e crashando em ambientes com menos de 8GB. Investigar memory leaks no webpack config e no processo de bundling.",
    project: "App Ordena - Sprint Core",
    projectColor: "#6366F1",
    priority: "ALTA",
    status: "Em Andamento",
    quadrant: "Q1",
    effort: 6,
    deadline: "2025-09-12",
    tags: ["#critico", "#frontend", "#performance"],
    assignee: "Lucas Inacio",
    subtasks: subtasksT1,
    attachments: [
      { id: "att1", type: "audio", name: "nota_vazamento.mp3", size: "240 KB", url: "#", duration: "1:42" },
      { id: "att2", type: "pdf", name: "diagnostico_memoria.pdf", size: "1.2 MB", url: "#" },
    ],
    comments: [
      { id: "c1", author: "Mariana Silva", avatar: "MS", text: "Reproduzi o bug localmente. O profiler mostra crescimento de heap no chunk vendor.js.", timestamp: "Hoje, 09:14" },
      { id: "c2", author: "Lucas Inacio", avatar: "LI", text: "Vou tentar com SplitChunksPlugin primeiro.", timestamp: "Hoje, 09:32" },
    ],
    dependencies: [],
    isRecurring: false,
    location: { name: "Escritório TI", lat: -23.55, lng: -46.63, radius: 200 },
    complexityIndex: 0,
    estimatedTime: 6,
    realTime: 5.3,
    progress: 0,
  },
  {
    id: "t2",
    title: "Refatorar camada de dados MinIO",
    description: "Substituir SDK legado por nova API REST com suporte a presigned URLs e streaming de arquivos grandes.",
    project: "Infraestrutura MinIO/S3",
    projectColor: "#F59E0B",
    priority: "ALTA",
    status: "Pendente",
    quadrant: "Q2",
    effort: 8,
    deadline: "2025-09-18",
    tags: ["#api", "#backend", "#minio"],
    assignee: "Mariana Silva",
    subtasks: subtasksT3,
    attachments: [],
    comments: [
      { id: "c3", author: "Carlos Souza", avatar: "CS", text: "Já encontrei a documentação do novo SDK v3. Posso ajudar com a migração.", timestamp: "Ontem, 16:45" },
    ],
    dependencies: ["t1"],
    isRecurring: false,
    complexityIndex: 0,
    estimatedTime: 8,
    realTime: 0,
    progress: 0,
  },
  {
    id: "t3",
    title: "Deploy em Produção (AWS EC2)",
    description: "Subir nova versão 2.1.0 do backend no ambiente de produção após aprovação dos testes E2E.",
    project: "Backend Node.js",
    projectColor: "#10B981",
    priority: "ALTA",
    status: "Bloqueada",
    quadrant: "Q1",
    effort: 3,
    deadline: "2025-09-13",
    tags: ["#devops", "#deploy", "#backend"],
    assignee: "Lucas Inacio",
    subtasks: [
      { id: "st3a-1", title: "Aguardar aprovação dos testes E2E", done: false },
      { id: "st3a-2", title: "Executar pipeline CI/CD", done: false },
      { id: "st3a-3", title: "Validar healthcheck /api/status", done: false },
    ],
    attachments: [],
    comments: [],
    dependencies: ["t4"],
    isRecurring: false,
    complexityIndex: 0,
    estimatedTime: 3,
    realTime: 0,
    progress: 0,
  },
  {
    id: "t4",
    title: "Aprovação dos Testes E2E (Cypress)",
    description: "Executar suite completa de testes end-to-end com Cypress e gerar relatório de cobertura para aprovação do deploy.",
    project: "Backend Node.js",
    projectColor: "#10B981",
    priority: "ALTA",
    status: "Em Andamento",
    quadrant: "Q1",
    effort: 4,
    deadline: "2025-09-12",
    tags: ["#testes", "#qa", "#e2e"],
    assignee: "Carlos Souza",
    subtasks: subtasksT2,
    attachments: [
      { id: "att3", type: "image", name: "coverage_report.png", size: "380 KB", url: "https://images.unsplash.com/photo-1555066931-4365d14431b9?w=400&h=300&fit=crop" },
    ],
    comments: [
      { id: "c4", author: "Ana Mendes", avatar: "AM", text: "Os testes de fluxo de pagamento ainda estão quebrando no CI. Preciso de acesso ao ambiente de staging.", timestamp: "Hoje, 08:00" },
    ],
    dependencies: [],
    isRecurring: false,
    complexityIndex: 0,
    estimatedTime: 4,
    realTime: 3.2,
    progress: 0,
  },
  {
    id: "t5",
    title: "Atualizar planilha de reuniões semanais",
    description: "Preencher ata da retrospectiva e distribuir para todos os membros da equipe via e-mail.",
    project: "App Ordena - Sprint Core",
    projectColor: "#6366F1",
    priority: "MEDIA",
    status: "Pendente",
    quadrant: "Q3",
    effort: 1,
    deadline: "2025-09-13",
    tags: ["#administrativo", "#reuniao"],
    assignee: "Ana Mendes",
    subtasks: [],
    attachments: [],
    comments: [],
    dependencies: [],
    isRecurring: true,
    recurringPeriod: "Semanal",
    complexityIndex: 0,
    estimatedTime: 1,
    realTime: 0,
    progress: 0,
  },
  {
    id: "t6",
    title: "Organizar pastas antigas de downloads",
    description: "Limpar e categorizar arquivos de projetos antigos no servidor de arquivos compartilhado.",
    project: "Infraestrutura MinIO/S3",
    projectColor: "#F59E0B",
    priority: "BAIXA",
    status: "Pendente",
    quadrant: "Q4",
    effort: 2,
    deadline: "2025-09-20",
    tags: ["#organizacao", "#limpeza"],
    assignee: "Carlos Souza",
    subtasks: [],
    attachments: [],
    comments: [],
    dependencies: [],
    isRecurring: false,
    complexityIndex: 0,
    estimatedTime: 2,
    realTime: 0,
    progress: 0,
  },
  {
    id: "t7",
    title: "Criar componentes do Design System",
    description: "Desenvolver biblioteca de componentes React reutilizáveis documentados no Storybook (Button, Input, Card, Modal, Toast).",
    project: "Design System Figma",
    projectColor: "#EC4899",
    priority: "MEDIA",
    status: "Em Revisão",
    quadrant: "Q2",
    effort: 12,
    deadline: "2025-09-22",
    tags: ["#design", "#storybook", "#frontend"],
    assignee: "Ana Mendes",
    subtasks: [
      { id: "st7-1", title: "Button com variantes e estados", done: true },
      { id: "st7-2", title: "Input com validação integrada", done: true },
      { id: "st7-3", title: "Card e CardGroup responsivos", done: true },
      { id: "st7-4", title: "Modal com foco trap e animações", done: false },
      { id: "st7-5", title: "Toast system com fila de notificações", done: false },
      { id: "st7-6", title: "Documentar todos no Storybook", done: false },
    ],
    attachments: [
      { id: "att4", type: "image", name: "design_system_preview.png", size: "2.1 MB", url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop" },
    ],
    comments: [],
    dependencies: [],
    isRecurring: false,
    complexityIndex: 0,
    estimatedTime: 12,
    realTime: 8.5,
    progress: 0,
  },
  {
    id: "t8",
    title: "Implementar autenticação OAuth2 + JWT",
    description: "Configurar fluxo completo de autenticação com Google OAuth2, geração de JWT com refresh tokens e middleware de proteção de rotas.",
    project: "Backend Node.js",
    projectColor: "#10B981",
    priority: "ALTA",
    status: "Pendente",
    quadrant: "Q2",
    effort: 10,
    deadline: "2025-09-25",
    tags: ["#auth", "#seguranca", "#backend"],
    assignee: "Mariana Silva",
    subtasks: [
      { id: "st8-1", title: "Registrar app no Google Cloud Console", done: true },
      { id: "st8-2", title: "Configurar Passport.js com Google Strategy", done: false },
      { id: "st8-3", title: "Gerar e validar JWT com expiração de 1h", done: false },
      { id: "st8-4", title: "Implementar refresh token rotation", done: false },
    ],
    attachments: [],
    comments: [
      { id: "c5", author: "Lucas Inacio", avatar: "LI", text: "Lembrar de usar RS256 ao invés de HS256 para melhor segurança.", timestamp: "2025-09-10, 14:20" },
    ],
    dependencies: ["t4"],
    isRecurring: false,
    complexityIndex: 0,
    estimatedTime: 10,
    realTime: 0,
    progress: 0,
  },
];

// Compute progress and complexity for each task
TASKS.forEach(t => {
  t.progress = calcProgress(t.subtasks);
  t.complexityIndex = parseFloat(
    (t.subtasks.length * 1.5 + t.dependencies.length * 2.0 + t.attachments.length * 0.5 + t.comments.length * 0.3).toFixed(1)
  );
});

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "ce1", title: "Sprint Planning Q4", date: "2025-09-13", time: "09:00", synced: true, taskId: "t1" },
  { id: "ce2", title: "Code Review - Auth Module", date: "2025-09-14", time: "14:00", synced: true, taskId: "t8" },
  { id: "ce3", title: "Demo Day - Stakeholders", date: "2025-09-17", time: "10:00", synced: false },
  { id: "ce4", title: "Retrospectiva Sprint 12", date: "2025-09-19", time: "16:00", synced: true },
  { id: "ce5", title: "1:1 Lucas & Mariana", date: "2025-09-15", time: "11:00", synced: false },
];

export const AUDIT_LOG: AuditEntry[] = [
  { id: "al1", action: "Criou tarefa", user: "Lucas Inacio", timestamp: "2025-09-10 08:00", detail: "Criou 'Corrigir vazamento de memória no build'" },
  { id: "al2", action: "Alterou status", user: "Mariana Silva", timestamp: "2025-09-10 10:15", detail: "t2: Pendente → Em Andamento" },
  { id: "al3", action: "Comentou", user: "Carlos Souza", timestamp: "2025-09-10 16:45", detail: "Adicionou comentário em 'Refatorar camada MinIO'" },
  { id: "al4", action: "Anexou arquivo", user: "Ana Mendes", timestamp: "2025-09-11 09:00", detail: "coverage_report.png → Testes E2E" },
  { id: "al5", action: "Bloqueou tarefa", user: "Sistema", timestamp: "2025-09-11 11:30", detail: "Deploy bloqueado: Testes E2E pendentes" },
  { id: "al6", action: "Marcou subtarefa", user: "Lucas Inacio", timestamp: "2025-09-11 13:00", detail: "✓ Configurar índices compostos no SQLite" },
];

export const JSON_RULES: JsonRule[] = [
  {
    id: "jr1",
    condition: "task.priority === 'ALTA' && task.status === 'BLOQUEADA'",
    action: "notify('Gestor', 'URGENTE') && scheduleSlackAlert()",
    active: true,
  },
  {
    id: "jr2",
    condition: "task.deadline < today && task.status !== 'Concluída'",
    action: "escalate('Tech Lead') && sendEmailAlert()",
    active: true,
  },
  {
    id: "jr3",
    condition: "team.capacity > 90",
    action: "suggestDelegation() && notifyBurnoutAlert()",
    active: false,
  },
];

export const OKRS: OKR[] = [
  { id: "okr1", goal: "Concluir tarefas técnicas hoje", target: 4, current: 3, unit: "tarefas" },
  { id: "okr2", goal: "Taxa de cobertura de testes", target: 80, current: 68, unit: "%" },
  { id: "okr3", goal: "Tempo médio de revisão de PR", target: 2, current: 3.5, unit: "horas" },
];

export const PRODUCTIVITY_DATA = [
  { day: "Seg", concluidas: 5, atrasadas: 1 },
  { day: "Ter", concluidas: 7, atrasadas: 0 },
  { day: "Qua", concluidas: 4, atrasadas: 2 },
  { day: "Qui", concluidas: 8, atrasadas: 1 },
  { day: "Sex", concluidas: 6, atrasadas: 0 },
  { day: "Sáb", concluidas: 2, atrasadas: 0 },
  { day: "Dom", concluidas: 1, atrasadas: 0 },
];

export const MONTHLY_DATA = [
  { month: "Jun", mensal: 62, trimestral: 58 },
  { month: "Jul", mensal: 75, trimestral: 67 },
  { month: "Ago", mensal: 71, trimestral: 70 },
  { month: "Set", mensal: 84, trimestral: 76 },
];

export const GANTT_TASKS = [
  { id: "g1", title: "Setup Infraestrutura", start: 1, duration: 3, color: "#F59E0B", deps: [] },
  { id: "g2", title: "Backend API Core", start: 3, duration: 5, color: "#10B981", deps: ["g1"] },
  { id: "g3", title: "Auth OAuth2 + JWT", start: 5, duration: 4, color: "#6366F1", deps: ["g2"] },
  { id: "g4", title: "Frontend React", start: 4, duration: 6, color: "#EC4899", deps: ["g1"] },
  { id: "g5", title: "Testes E2E Cypress", start: 8, duration: 3, color: "#14B8A6", deps: ["g2", "g4"] },
  { id: "g6", title: "Deploy Produção", start: 11, duration: 2, color: "#F43F5E", deps: ["g5"] },
];

export const LEADERBOARD = [
  { codename: "Arquiteto #01", score: 94, tasks: 32, streak: 12 },
  { codename: "Desenvolvedor Ágil #04", score: 88, tasks: 28, streak: 8 },
  { codename: "QA Master #02", score: 82, tasks: 25, streak: 6 },
  { codename: "Designer #03", score: 76, tasks: 19, streak: 4 },
];

export const TEMPLATES = [
  { id: "tpl1", name: "Onboarding de Novo Membro", tasks: 8, description: "Fluxo completo de integração de novo colaborador" },
  { id: "tpl2", name: "Fechamento Mensal", tasks: 5, description: "Checklist de fechamento financeiro e relatórios" },
  { id: "tpl3", name: "Sprint Planning", tasks: 6, description: "Cerimônias e artefatos da sprint" },
];
