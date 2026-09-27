# ORDENA — CRUD COMPLETO DE TAREFAS E SUBTARaEFAS MULTINÍVEL (ENTREGA 1 • AV1: 30%)

Atue como Engenheiro de Frontend Sênior (React + TypeScript + Tailwind CSS) e Designer de Interação.

O protótipo do aplicativo **"Ordena"** já está visualmente correto como app de **produtividade pessoal** (não corporativo), com moldura Android, tema Dark/Light e Matriz de Eisenhower. Porém ele é **somente leitura**: não existe criação, edição ou exclusão de tarefas, e as subtarefas são uma lista plana sem gestão.

Sua missão é implementar o **ciclo CRUD completo de tarefas e de subtarefas aninhadas em múltiplos níveis** nos componentes de `src/entrega1/`, atendendo aos requisitos ITEM-01, ITEM-02, ITEM-04, ITEM-11 e ITEM-30 do backlog.

---

## 0. REGRAS DE NÃO-REGRESSÃO (OBRIGATÓRIAS)

Preserve integralmente o que já está aprovado. **Não altere**:

- A barra externa superior com as 3 abas (`Entrega 1 - AV1: 30%`, `Entrega 2 - AV2: 20%`, `Entrega 3 - AV3: 50%`) nem a navegação entre `src/entrega1/`, `src/entrega2/` e `src/entrega3/`.
- A moldura de smartphone Android (status bar, punch-hole, gesture bar) e a largura útil de 390–412px.
- O suporte a Dark/Light Mode com `prefers-color-scheme` e o botão manual Sol/Lua.
- A identidade **100% pessoal**: nenhum avatar, nome de responsável ou badge de atribuição nos cartões.
- O card limpo já definido: checkbox circular, título, pílula de projeto, prazo amigável, esforço, mini barra de progresso e borda lateral `border-l-4` por quadrante (Q1 `rose-500`, Q2 `indigo-500`, Q3 `amber-500`, Q4 `slate-400`). **Nunca** reintroduza `Score: 121`, excesso de tags técnicas nem rodapé repetindo o quadrante.
- O rótulo `⚡ Q3 Interrupções / Terceirizar` (jamais "Q3 Delegar").

---

## 1. MODELO DE DADOS — SUBTAREFAS RECURSIVAS (ITEM-02)

Refatore o tipo de subtarefa para suportar aninhamento real em **até 3 níveis** (Tarefa → Nível 1 → Nível 2 → Nível 3):

```ts
type Subtask = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;      // prazo próprio, independente da tarefa-mãe (ITEM-02)
  children: Subtask[];   // aninhamento recursivo
};

type Task = {
  id: string;
  title: string;
  description: string;
  project: 'Faculdade' | 'Saúde' | 'Finanças' | 'Pessoal' | 'Manutenção' | 'Projetos';
  priority: 'Alta' | 'Média' | 'Baixa';
  status: 'Pendente' | 'Em Andamento' | 'Em Revisão' | 'Bloqueada' | 'Concluída'; // ITEM-30
  dueDate: string;
  effort: string;        // "10m", "2h", "2h30"
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  subtasks: Subtask[];
  updatedAt: string;
  syncPending: boolean;  // fila offline-first (ITEM-11)
};
```

Implemente helpers puros e recursivos em `src/entrega1/utils/subtaskTree.ts`:

- `addSubtask(tree, parentId | null, title)` — insere na raiz ou como filho de qualquer nó.
- `updateSubtask(tree, id, patch)` — edita título, conclusão ou prazo em qualquer profundidade.
- `removeSubtask(tree, id)` — remove o nó **e toda a sua descendência** (cascata).
- `toggleSubtask(tree, id)` — ao marcar um nó como concluído, marca automaticamente todos os descendentes; ao desmarcar, desmarca os ancestrais.
- `countLeaves(tree)` → `{ completed, total }` — contagem recursiva usada no progresso.

---

## 2. CRIAÇÃO DE TAREFAS (ITEM-01)

- Adicione um **FAB** (botão flutuante circular) no canto inferior direito da tela do smartphone: `w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center` com ícone `Plus`, posicionado acima da gesture bar (`bottom-20 right-5`).
- Ao clicar, abre o **`TaskFormModal`** como bottom-sheet deslizante (animação `translate-y` suave) com os campos:
  - **Título** (obrigatório, `autoFocus`) — salvar fica desabilitado se vazio.
  - **Descrição** (`textarea`, 3 linhas, opcional).
  - **Projeto** (`select` com as 6 opções, cada uma exibindo sua cor).
  - **Prioridade** — 3 pílulas clicáveis mutuamente exclusivas: `Alta` (`bg-rose-500/15 text-rose-500`), `Média` (`bg-amber-500/15 text-amber-500`), `Baixa` (`bg-emerald-500/15 text-emerald-500`); a ativa recebe `ring-2`.
  - **Status** (`select` com os 5 status customizados do ITEM-30, cada um com ícone e cor).
  - **Prazo** (`input type="datetime-local"`).
  - **Esforço estimado** (`input text` compacto `w-24`, placeholder "ex: 2h").
  - **Subtarefas iniciais** — permite adicionar itens de nível 1 já na criação.
- **Cálculo automático do quadrante**: derive `quadrant` de prioridade + prazo, sem pedir ao usuário (Alta + vence em ≤24h → Q1; Alta/Média + prazo futuro → Q2; Baixa + urgente → Q3; Baixa + não urgente → Q4). Exiba o quadrante resultante como preview em tempo real no formulário: *"📍 Esta tarefa entrará em: Q2 Agendar"*.
- Ao salvar: insere no topo do estado global, fecha a modal, rola até o novo card com realce temporário (`ring-2 ring-indigo-500` por 1,5s) e exibe toast `"✓ Tarefa criada · salva no SQLite local"`.

---

## 3. EDIÇÃO DE TAREFA NA MODAL DE DETALHES

No header da `TaskDetailModal`, ao lado do botão de fechar (X), adicione:

- **Editar** — ícone `Pencil w-5 h-5`, estilo `p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-500 transition-colors`. Alterna `isEditing = true`.
- **Excluir** — ícone `Trash2 w-5 h-5`, estilo `p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors`.

Com `isEditing === true`, cada campo estático vira input editável **no mesmo lugar**, sem trocar de tela (preserve o scroll e a altura da modal):

| Campo       | Visualização    | Edição                                                                                                                                              |
| ----------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Título     | `<h2>` semibold | `<input type="text" autoFocus>` com `border-b-2 border-indigo-500 bg-transparent text-lg font-semibold outline-none w-full`                       |
| Descrição | `<p>` muted     | `<textarea>` 3 linhas, `resize-none bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-sm`        |
| Projeto     | pílula colorida  | `<select>` com as 6 opções, cor refletida                                                                                                         |
| Prioridade  | badge             | 3 pílulas clicáveis com`ring-2` na ativa                                                                                                          |
| Status      | badge com ícone  | `<select>` com os 5 status do ITEM-30                                                                                                               |
| Prazo       | "Hoje, 19:00"     | `<input type="datetime-local">` com `bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 text-sm` |
| Esforço    | "2h"              | `<input type="text" class="w-20">` placeholder "ex: 2h"                                                                                             |

**Barra de ações fixa na base da modal** (`sticky bottom-0` com `backdrop-blur` e borda superior):

- **[Cancelar]** (`border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-5 py-2 rounded-xl`) — descarta tudo, volta `isEditing = false`, nada é mutado.
- **[Salvar]** (`bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl shadow-md`) — aplica ao estado global, **recalcula o quadrante** (se a prioridade/prazo mudou, o card migra de quadrante na Home), volta ao modo leitura e exibe toast `"✓ Alterações salvas"`.
- Se o usuário tentar fechar a modal com alterações pendentes, confirme antes: *"Descartar alterações não salvas?"*.

---

## 4. EXCLUSÃO DE TAREFA COM CONFIRMAÇÃO

Ao clicar na lixeira, **não exclua imediatamente**. Substitua o corpo da modal por um bloco de confirmação inline centralizado:

```
┌─────────────────────────────────────────┐
│            🗑️ Excluir tarefa?           │
│                                         │
│   "Estudar Árvores AVL para a prova"    │
│   3 subtarefas também serão removidas.  │
│   Esta ação não pode ser desfeita.      │
│                                         │
│      [ Cancelar ]     [ Excluir ]       │
│      (outline)        (bg-rose-600)     │
└─────────────────────────────────────────┘
```

- **[Cancelar]** → volta ao modo de visualização.
- **[Excluir]** → remove a tarefa do estado, fecha a modal, recalcula os contadores do topo e exibe snackbar no rodapé do smartphone: `"✓ Tarefa excluída"` **com botão [Desfazer]** ativo por 5 segundos (restaura a tarefa e sua árvore completa de subtarefas).

---

## 5. CRUD DE SUBTAREFAS MULTINÍVEL (ITEM-02) — NÚCLEO DESTA ENTREGA

A seção "Subtarefas" da modal deve renderizar uma **árvore recursiva**, não uma lista plana. Use um componente `<SubtaskNode>` que se renderiza a si mesmo para os filhos, com indentação progressiva (`pl-5` por nível) e guias verticais sutis (`border-l border-slate-200 dark:border-slate-700`).

### 5.1 Layout de cada linha

```
┌────────────────────────────────────────────────────────────┐
│ ▾ [✓] Revisar fator de balanceamento    🕑 Hoje  ＋ ✏️ 🗑️ │
│   │                                                        │
│   ├─ [✓] Caso -1 / 0 / +1 no papel            ＋ ✏️ 🗑️ │
│   └─ [ ] Conferir no slide 12 do professor     ＋ ✏️ 🗑️ │
│ ▸ [ ] Resolver 5 exercícios de rotação dupla  (0/3) ＋✏️🗑️│
└────────────────────────────────────────────────────────────┘
```

- **Chevron** (`ChevronDown` / `ChevronRight`, `w-3.5 h-3.5`) só aparece em nós com filhos; colapsa/expande a ramificação. Nó colapsado exibe o contador `(0/3)` dos descendentes.
- **Checkbox** `w-4 h-4 rounded border-2 checked:bg-indigo-500 checked:border-indigo-500`; título tachado (`line-through text-slate-400`) quando concluído.
- **Prazo próprio** (opcional, ITEM-02): chip discreto `🕑 Hoje` / `🕑 Sáb` clicável que abre um date picker compacto inline. Quando o prazo da subtarefa estiver vencido, pinte o chip em `text-rose-500`.
- **Ações em hover** (`opacity-0 group-hover:opacity-100 transition-opacity`), sempre nesta ordem:
  1. `Plus w-3.5 h-3.5 text-slate-400 hover:text-indigo-500` → **adicionar sub-subtarefa filha** (desabilitado e oculto no nível 3, com tooltip *"Limite de 3 níveis atingido"*).
  2. `Pencil w-3.5 h-3.5 text-slate-400 hover:text-indigo-500` → edição inline.
  3. `Trash2 w-3.5 h-3.5 text-slate-400 hover:text-rose-500` → exclusão.

### 5.2 Adicionar

- Input permanente ao final de cada nível: `○ [ Digite uma nova subtarefa... ]  +`, estilizado com `bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:border-indigo-500 text-sm`, checkbox fantasma desabilitado à esquerda e botão `+` (`bg-indigo-500/10 text-indigo-500 rounded-lg p-1`).
- **Enter** ou clique no `+` cria `{ id: uuid(), title, completed: false, children: [] }`, limpa o input **mantendo o foco** para adição contínua, e recalcula o progresso na hora.
- Clicar no `＋` de uma linha existente abre o mesmo input já indentado como filho daquele nó, com foco automático.

### 5.3 Editar inline

- Clique no lápis **ou duplo clique no texto** troca o `<span>` por um `<input>` pré-preenchido (`text-sm bg-transparent border-b border-indigo-400 outline-none w-full`).
- **Enter** ou blur salva; **Escape** cancela e restaura o texto original; título vazio ao salvar = cancela a edição (não apaga o item).

### 5.4 Excluir

- Clique na lixeira remove o nó **e todos os seus descendentes**, sem confirmação se for uma folha (ação leve).
- Se o nó tiver filhos, confirme inline na própria linha: *"Excluir este item e seus 2 subitens? [Sim] [Não]"*.

### 5.5 Progresso recursivo e propagação

```ts
const { completed, total } = countLeaves(task.subtasks); // conta todos os nós da árvore
const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
```

- Texto: `"{completed} de {total} concluídas"` (`text-xs text-slate-500`).
- Barra: `h-1.5 rounded-full bg-slate-200 dark:bg-slate-800` com fill `bg-indigo-500 rounded-full transition-all duration-300` e `style={{ width: percent + '%' }}`.
- Em `percent === 100`: fill vira `bg-emerald-500` e o rótulo passa a `"✓ Todas concluídas"`.
- **Propagação vertical**: marcar um nó-pai conclui toda a sua descendência; concluir o último filho pendente conclui o pai automaticamente; desmarcar um filho reabre os ancestrais. A barra e o contador reagem instantaneamente em **ambos** os lugares — modal e mini barra do card na Home.

---

## 6. FEEDBACK OFFLINE-FIRST (ITEM-11)

Todo CRUD deve ser visivelmente local-first, sem depender de rede:

- Após cada operação, exiba no toast o sufixo `· salvo no SQLite local`.
- Marque a tarefa alterada com `syncPending: true` e mostre no card um ícone discreto `CloudOff w-3 h-3 text-slate-400` com tooltip *"Aguardando sincronização"*.
- No header do app, mantenha o indicador existente e adicione o contador da fila: `"Offline-First SQLite Ativo · 3 alterações na fila"`.
- Inclua um botão "Simular reconexão" nas configurações: ao acionar, anima a limpeza da fila (`syncPending → false` em sequência, ~300ms cada) e exibe `"✓ 3 alterações sincronizadas com o servidor Node.js"`.

---

## 7. ESTADO GLOBAL REATIVO

Centralize as tarefas em um `TaskContext` (`src/entrega1/context/TaskContext.tsx`) exposto por um hook `useTasks()`, com `useState` + `useCallback` e atualizações **imutáveis** (`setTasks(prev => prev.map(...) / prev.filter(...))`). Exponha: `createTask`, `updateTask`, `deleteTask`, `restoreTask`, `toggleTaskComplete`, `addSubtask`, `updateSubtask`, `removeSubtask`, `toggleSubtask`.

`HomeScreen`, `TaskCard`, `TaskFormModal`, `TaskDetailModal` e `SubtaskTree` devem consumir **a mesma referência** de estado, garantindo que:

- **Criar / editar / excluir tarefa** → reflete no card, nos contadores do topo (`Total`, `Concluídas`, `Atrasadas`) e nos filtros salvos.
- **Editar prioridade ou prazo** → a tarefa **migra de quadrante** na Matriz de Eisenhower sem recarregar a tela.
- **Qualquer operação em subtarefa** → recalcula percentual na modal e na mini barra do card simultaneamente.
- **Filtro por quadrante/projeto ativo** → continua coerente após qualquer CRUD (se a tarefa editada sair do filtro atual, anime sua saída da lista).

---

## 8. DADOS MOCKADOS COM ÁRVORE MULTINÍVEL

Mantenha as 6 tarefas pessoais já aprovadas (Árvores AVL • Fatura Nubank • Treino de perna • Relatório de Estatística • Suplementos na farmácia • Troca de óleo da moto), com seus projetos e cores (`Faculdade` indigo `#6366F1`, `Finanças` emerald `#10B981`, `Saúde` rose `#F43F5E`, `Pessoal` amber `#F59E0B`, `Manutenção` sky `#0EA5E9`, `Projetos` violet).

Enriqueça **pelo menos duas delas com 3 níveis reais de aninhamento**, para que a hierarquia seja demonstrável na apresentação:

**"Estudar Árvores AVL para a prova de quarta"** — Faculdade • Hoje, 19:00 • 2h • Alta • Q1

- [X] Revisar conceito de fator de balanceamento
  - [X] Entender os casos -1, 0 e +1
  - [X] Anotar a fórmula de altura da subárvore
- [X] Implementar rotações no caderno
  - [X] Rotação simples à esquerda (RR)
  - [X] Rotação simples à direita (LL)
  - [ ] Rotação dupla LR e RL — 🕑 Hoje, 22:00
- [ ] Resolver 5 exercícios práticos da lista 4
- [ ] Refazer o exercício 3 da prova anterior como simulado

**"Finalizar relatório de Estatística Aplicada"** — Faculdade • Amanhã, 23:59 • 3h • Média • Q2

- [X] Coletar os dados da pesquisa no Google Forms
- [X] Calcular as medidas descritivas
  - [X] Média, mediana e moda
  - [X] Desvio padrão e variância
- [ ] Montar os gráficos no Excel
  - [ ] Gráfico de barras por faixa de idade
  - [ ] Boxplot comparativo — 🕑 Amanhã, 14:00
- [ ] Redigir conclusão e formatar em ABNT
- [ ] Revisar ortografia e exportar o PDF final

As demais tarefas mantêm subtarefas de 1 a 2 níveis, conforme já definido.

---

## 9. CHECKLIST DE ACEITAÇÃO (VALIDE TUDO ANTES DE ENTREGAR)

1. FAB cria tarefa nova, que aparece no quadrante correto calculado automaticamente.
2. Lápis na modal torna todos os 7 campos editáveis; Salvar reflete no card em menos de um frame; Cancelar não muta nada.
3. Lixeira pede confirmação, exclui, e o snackbar **[Desfazer]** restaura a tarefa com a árvore intacta.
4. É possível adicionar uma subtarefa de nível 1, uma filha dela (nível 2) e uma neta (nível 3); o nível 3 bloqueia novo aninhamento.
5. Editar subtarefa por duplo clique funciona com Enter (salva) e Escape (cancela).
6. Excluir um nó-pai remove os filhos e a barra de progresso recalcula corretamente.
7. Marcar o pai conclui os filhos; concluir o último filho conclui o pai.
8. Colapsar/expandir ramificações funciona e exibe o contador dos descendentes.
9. Todo CRUD emite toast com o sufixo de SQLite local e marca a fila de sincronização.
10. Tudo acima funciona **idêntico** em Dark e Light Mode, sem quebrar a moldura Android nem as 3 abas de entrega.

Mantenha o código em React + TypeScript, componentes pequenos e tipados, classes utilitárias Tailwind, transições suaves (`transition-all duration-200`) e zero dependências externas além das já utilizadas (`lucide-react` para ícones).