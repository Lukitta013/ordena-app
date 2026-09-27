# REFATORAÇÃO DE UI/UX: TRANSIÇÃO PARA APLICATIVO DE PRODUTIVIDADE PESSOAL

Atue como Designer de Produto e Engenheiro de Frontend Sênior.
Refatore a interface da tela inicial e dos cartões de tarefas (`src/entrega1/`) para eliminar a aparência corporativa estilo "Jira/DevOps" e transformá-la em um aplicativo moderno, limpo e elegante de **produtividade pessoal** (na linha de referências como Things 3, Todoist e TickTick).

Aplique rigorosamente as correções estruturais, visuais e de conteúdo abaixo:

---

### 1. REMOÇÃO DE ATRIBUIÇÕES E AVATARES (FOCO PESSOAL)
- **Eliminar totalmente** o avatar do usuário `(L) Lucas`, nome de responsável e badges de atribuição dos cartões de tarefas da tela principal.
- Como o aplicativo é de uso pessoal do próprio usuário logado, a exibição repetitiva de quem é o responsável em cada card é redundante e polui desnecessariamente a visualização.

---

### 2. DADOS MOCKADOS: ROTINA PESSOAL, ESTUDOS E PROJETOS REAIS
Substitua 100% dos tickets corporativos de sprint/DevOps por tarefas reais e diversificadas da rotina individual do usuário (divididas entre estudos, projetos pessoais, saúde e finanças):

1. **"Estudar Estrutura de Dados — Árvores AVL"**
   - Projeto: `[Faculdade]` (cor violeta/índigo)
   - Prazo: "Hoje, 19:00" • Esforço: "2h" • Quadrante: Q1 (Urgente & Importante)
   - Subtarefas: 2 de 4 concluídas (50%)
2. **"Comprar suplementos e vitaminas na farmácia"**
   - Projeto: `[Pessoal & Saúde]` (cor esmeralda/verde)
   - Prazo: "Hoje, 17:30" • Esforço: "30m" • Quadrante: Q1 (Urgente & Importante)
   - Subtarefas: 0 de 2 concluídas (0%)
3. **"Finalizar relatório prático de Estatística Aplicada"**
   - Projeto: `[Faculdade]` (cor violeta/índigo)
   - Prazo: "Amanhã, 23:59" • Esforço: "3h" • Quadrante: Q2 (Importante & Não Urgente)
   - Subtarefas: 3 de 5 concluídas (60%)
4. **"Refatorar módulo SQLite e offline-first do App Ordena"**
   - Projeto: `[Projetos]` (cor azul celeste)
   - Prazo: "Quinta, 18:00" • Esforço: "2h30" • Quadrante: Q2 (Importante & Não Urgente)
   - Subtarefas: 1 de 3 concluídas (33%)
5. **"Agendar revisão periódica do carro na concessionária"**
   - Projeto: `[Rotina]` (cor âmbar)
   - Prazo: "Sexta, 12:00" • Esforço: "20m" • Quadrante: Q3 (Interrupções / Terceirizar)
6. **"Digitalizar e arquivar notas fiscais do mês"**
   - Projeto: `[Finanças]` (cor ardósia/cinza)
   - Prazo: "Domingo" • Esforço: "45m" • Quadrante: Q4 (Eliminar / Baixo Impacto)

---

### 3. REDESIGN E LIMPEZA VISUAL DOS CARTÕES DE TAREFAS
Simplifique a hierarquia visual de cada cartão (`TaskCard`), eliminando a sobrecarga de informações:

- **Borda Lateral Indicadora de Quadrante**:
  - Remova rodapés pesados e identifique o quadrante de Eisenhower por uma borda lateral esquerda elegante (`border-l-4`):
    - Q1 (Fazer Agora): `border-l-rose-500`
    - Q2 (Agendar): `border-l-indigo-500`
    - Q3 (Terceirizar / Automatizar): `border-l-amber-500`
    - Q4 (Eliminar / Baixo Impacto): `border-l-slate-400`
- **Estrutura Interna do Card (Layout Limpo)**:
  - **Lado Esquerdo**: Checkbox circular funcional (`rounded-full w-5 h-5 border-2 border-slate-400 dark:border-slate-500 hover:border-indigo-500`), que ao ser clicado aplica efeito suave de tachado (`line-through text-slate-400`) e animação de conclusão.
  - **Centro/Corpo**:
    - **Título**: Tipografia nítida e legível (`text-[15px] font-medium text-slate-900 dark:text-slate-100`).
    - **Metadados em Linha Única**: Abaixo do título, exiba apenas elementos essenciais em formato compacto e elegante:
      1. Badge sutil do Projeto com fundo translúcido (ex: `bg-indigo-500/10 text-indigo-500 text-xs px-2 py-0.5 rounded-full font-medium`).
      2. Ícone de calendário com data amigável (ex: "Hoje, 19:00" ou "Amanhã").
      3. Pílula discreta de esforço (ex: "⏱️ 2h").
    - **Mini Barra de Progresso de Subtarefas**: Exibir apenas se a tarefa contiver subtarefas, posicionada de forma discreta e minimalista (`h-1 rounded-full bg-slate-200 dark:bg-slate-800` com preenchimento colorido e texto sutil `2/4 sub`).
- **O QUE REMOVER OBRIGATORIAMENTE DO CARD**:
  - ❌ Remover completamente a pontuação solta `"Score: 121"` da face do cartão (mantenha os cálculos algorítmicos apenas no modal de detalhes ou na ordenação interna).
  - ❌ Remover o excesso de tags técnicas simultâneas (`#critico`, `#frontend`, `#performance`, `#devops`).
  - ❌ Remover o rodapé duplicado que repetia o nome do quadrante.
  - ❌ Remover badges redundantes como `[ALTA]` e `[Atrasada]` quando o prazo e a borda do quadrante já transmitem essa urgência.

---

### 4. AJUSTE METODOLÓGICO DA ABA Q3 NA MATRIZ DE EISENHOWER
Na barra de filtros horizontais de quadrantes:
- **Substituir**: `"👥 Q3 Delegar"`
- **Por**: `"⚡ Q3 Interrupções"` ou `"⚡ Q3 Terceirizar"` com ícone de raio/automação (`Zap` ou `Clock`), alinhando o conceito com o gerenciamento de tempo pessoal, onde o usuário individual não tem subordinados corporativos diretos, mas lida com demandas urgentes que devem ser automatizadas, despachadas rapidamente ou terceirizadas.