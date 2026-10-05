# Ordena

Aplicativo Android de gerenciamento **pessoal** de tarefas. Ele organiza o que você precisa fazer por prioridade e prazo (matriz de Eisenhower), por categoria (Faculdade, Trabalho, Finanças, Saúde, Pessoal, Lazer, Manutenção, Projetos) e por dia na agenda. As tarefas ficam salvas no próprio aparelho.

Autor: Lucas Inácio de Carvalho

## O que dá para fazer

- **Tarefas (CRUD completo):** criar, ver, editar, concluir/reabrir e excluir (com opção de desfazer). Cada tarefa tem título, descrição, prazo, prioridade, status, categoria e esforço estimado. O prazo não aceita data ou horário que já passou.
- **Subtarefas aninhadas:** vários níveis, com o progresso da tarefa principal calculado automaticamente.
- **Matriz de Eisenhower:** cada tarefa cai em um quadrante (Fazer Agora, Agendar, Interrupções, Baixo Impacto) conforme a prioridade e a proximidade do prazo. Dentro do quadrante, atrasadas vêm primeiro, depois o prazo mais próximo e o menor esforço.
- **Tags, busca e filtros:** tags nas tarefas, busca por título e filtros combinados por categoria, prioridade e tag, além de uma nota rápida que vira tarefa.
- **Projetos:** criar, editar e excluir categorias (nome, descrição, cor e datas) e personalizar os status das tarefas com cores próprias. Tocar numa categoria mostra as tarefas dela.
- **Agenda:** calendário mensal com setas para voltar e avançar o mês; os dias com tarefa ficam marcados e tocar num dia lista as tarefas com prazo nele.
- **Análises:** números de concluídas, em aberto e atrasadas e o fechamento do dia, calculados a partir das suas tarefas. Os alertas de prazo ficam na Agenda.

## Tecnologias

React 19, TypeScript, Vite, Tailwind CSS v4 e Capacitor (Android). Os dados ficam no armazenamento local do aparelho.

## Como rodar

```bash
npm install
npm run dev              # abre no navegador para desenvolvimento
npm run build            # gera a versão final em dist/
npx cap sync android     # copia a versão final para o projeto Android
```

Depois do `cap sync`, abra a pasta `android/` no Android Studio e rode no emulador ou no celular.

## Product Backlog

As 27 user stories do backlog original, com o estado de cada uma no app.

**Legenda**
- ✅ **Implementado:** funciona de verdade com as suas tarefas.
- 🟡 **Parcial:** a parte principal funciona; o restante ainda não.
- 🖼️ **Demonstração:** existe uma tela mostrando a ideia, com dados de exemplo.
- ⏳ **Não iniciado:** ainda não tem nada no app.
- ❌ **Removido:** fora do escopo porque é recurso de equipe, e o Ordena é pessoal.

### Sprint 1

| ID | História | Estado | No app |
|----|----------|--------|--------|
| US01 | Criar tarefas estruturadas (título, descrição, prazo, prioridade, esforço) com uso offline | ✅ Implementado | CRUD completo, salvo no aparelho. Sem SQLite nem sincronização com servidor. |
| US02 | Subtarefas em vários níveis com progresso automático | ✅ Implementado | Subtarefas aninhadas com barra de progresso. Sem responsáveis, por ser pessoal. |
| US03 | Lista ordenada por matriz de Eisenhower | ✅ Implementado | Quadrantes por prioridade e prazo; dentro de cada um, atrasadas primeiro, depois prazo mais próximo e menor esforço. Dependências entre tarefas são a US07. |
| US04 | Projetos temáticos com cor e status personalizados | ✅ Implementado | Criar, editar e excluir categorias com nome, descrição, cor e datas de início e fim. Status personalizados com cor: criar, renomear e excluir (Pendente e Concluída são fixos). |
| US05 | Tags, filtros combinados e anotações rápidas | ✅ Implementado | Tags nas tarefas, filtros combinados (categoria, prioridade e tag) junto com a busca, e nota rápida que vira tarefa. |

### Sprint 2

| ID | História | Estado | No app |
|----|----------|--------|--------|
| US06 | Lembretes por localização (GPS/geofencing) | 🖼️ Demonstração | Agenda › Lembretes por Local |
| US07 | Dependências entre tarefas e dependências externas | ⏳ Não iniciado | |
| US08 | Duplicar tarefas e salvar modelos | 🟡 Parcial | Projetos › Duplicação e Templates duplica a tarefa com as subtarefas. Salvar como modelo ainda não existe. |
| US09 | Sincronizar com Google Calendar e calendário do Android | 🖼️ Demonstração | Agenda › Integrações |
| US10 | Comentários e anexos (imagem, documento, áudio) | ⏳ Não iniciado | |
| US11 | Alertas progressivos de prazo e resumos diários | 🟡 Parcial | Agenda › Alertas de Prazo mostra a urgência de cada tarefa real. Sem notificação push nem e-mail. |
| US12 | Feed de auditoria, arquivamento e busca tolerante a erros | 🖼️ Demonstração | Busca por título funciona na lista; a tela Agenda › Busca e Auditoria é demonstração. |
| US13 | Tarefas recorrentes e tarefas criadas a partir de e-mails | 🖼️ Demonstração | Agenda › Tarefas Recorrentes |
| US14 | Verificar conflito de agenda antes de atribuir tarefas a membros | ❌ Removido | Atribuição entre membros de equipe. |

### Sprint 3

| ID | História | Estado | No app |
|----|----------|--------|--------|
| US15 | Gráficos e relatórios de produtividade | 🟡 Parcial | Análises mostra concluídas, em aberto e atrasadas a partir das tarefas reais. Comparativos por período são demonstração. |
| US16 | Registrar tempo gasto e calibrar estimativas | 🖼️ Demonstração | Análises › Tempo e Estimativas |
| US17 | Gráfico de Gantt com dependências | 🖼️ Demonstração | Projetos › Cronograma Gantt |
| US18 | Projeção da data de conclusão e previsão de recursos | 🟡 Parcial | Projetos › Projeções usa as tarefas restantes reais com um ritmo fixo. Dimensionar equipe foi removido. |
| US19 | Painel de capacidade da equipe e delegação automática | ❌ Removido | Recurso de gestão de equipe. |
| US20 | Lock otimista para edições simultâneas | ❌ Removido | Edição colaborativa. |
| US21 | Chamadas de áudio e vídeo (WebRTC) | ❌ Removido | Comunicação entre membros. |
| US22 | Pausas anti-burnout, alerta de sobrecarga e ranking | 🖼️ Demonstração | Análises › Bem-estar e Carga Diária. O ranking entre pessoas foi removido. |
| US23 | Backup na nuvem e exportação em PDF | 🖼️ Demonstração | Ajustes › Backup e Exportação |
| US24 | Metas diárias e revisão de tarefas por outros membros | 🖼️ Demonstração | Análises › Metas Pessoais. A revisão por outros membros foi removida. |
| US25 | Permissões e logs de acesso por membro | ❌ Removido | Administração de equipe. |
| US26 | Motor de regras "se-então" e duração ideal de reuniões | 🖼️ Demonstração | Ajustes › Automações |
| US27 | Fechamento diário, plano do dia seguinte e checkpoints | 🟡 Parcial | Análises › Fechamento Diário usa as tarefas reais (feitas hoje, prazo amanhã, sugestão da mais rápida). Checkpoints são demonstração. |
