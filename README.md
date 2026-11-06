# Ordena

Aplicativo Android de gerenciamento **pessoal** de tarefas. Ele organiza o que você precisa fazer por prioridade e prazo (matriz de Eisenhower), por categoria (Faculdade, Trabalho, Finanças, Saúde, Pessoal, Lazer, Manutenção, Projetos) e por dia na agenda. As tarefas ficam salvas no próprio aparelho.

Autor: Lucas Inácio de Carvalho

## O que dá para fazer

- **Tarefas (CRUD completo):** criar, ver, editar, concluir/reabrir e excluir (com opção de desfazer). Cada tarefa tem título, descrição, prazo, prioridade, status, categoria e esforço estimado. O prazo não aceita data ou horário que já passou.
- **Subtarefas aninhadas:** vários níveis, com o progresso da tarefa principal calculado automaticamente.
- **Matriz de Eisenhower:** cada tarefa cai em um quadrante (Fazer Agora, Agendar, Interrupções, Baixo Impacto) conforme a prioridade e a proximidade do prazo. Dentro do quadrante, atrasadas vêm primeiro, depois o prazo mais próximo e o menor esforço.
- **Tags, busca e filtros:** tags nas tarefas, busca por título e filtros combinados por categoria, prioridade e tag, além de uma nota rápida que vira tarefa.
- **Projetos:** criar, editar e excluir categorias (nome, descrição, cor e datas) e personalizar os status das tarefas com cores próprias. Tocar numa categoria mostra as tarefas dela.
- **Dependências:** uma tarefa pode depender de outras e fica bloqueada até elas serem concluídas.
- **Duplicar e modelos:** duplicar uma tarefa com as subtarefas, salvar como modelo e criar tarefas novas a partir do modelo.
- **Anotações e anexos:** anotações com data, arquivos, fotos da câmera e áudios gravados dentro da tarefa.
- **Repetição:** tarefas diárias, semanais ou mensais; concluir cria a próxima.
- **Alertas de prazo:** notificações 1 dia, 2 horas e 30 minutos antes e um resumo diário.
- **Arquivo, histórico e busca:** arquivar sem apagar, histórico das ações e busca que aceita erros de digitação.
- **E-mail → tarefa:** colar um e-mail cria a tarefa com título e prazo.
- **Lembrete por local:** marca um lugar na tarefa e avisa quando você chega perto (com o app aberto).
- **Calendário:** sincroniza as tarefas em aberto com o calendário do Android (e com o Google Calendar pela conta Google do aparelho) e transforma eventos do calendário em tarefas.
- **Agenda:** calendário mensal com setas para voltar e avançar o mês; os dias com tarefa ficam marcados e tocar num dia lista as tarefas com prazo nele; tocar numa tarefa abre o detalhe.
- **Análises:** números de concluídas, em aberto e atrasadas e o fechamento do dia, calculados a partir das suas tarefas. Os alertas de prazo ficam na Agenda.

## Tecnologias

React 19, TypeScript, Vite, Tailwind CSS v4 e Capacitor (Android). Os dados ficam no armazenamento local do aparelho; os arquivos anexados ficam no IndexedDB do app.

Plugins do Capacitor: `@capacitor/geolocation` e `@capacitor/local-notifications` (lembrete por local), `@ebarooni/capacitor-calendar` (calendário do Android), `@capacitor/filesystem` e `@capacitor/share` (abrir anexos). O `AndroidManifest.xml` declara as permissões de localização, notificações, calendário, câmera e microfone; o Android pede cada uma na primeira vez que o recurso é usado.

## Como rodar

```bash
npm install
npm run dev              # abre no navegador para desenvolvimento
npm run build            # gera a versão final em dist/
npx cap sync android     # copia a versão final para o projeto Android
```

Depois do `cap sync`, abra a pasta `android/` no Android Studio e rode no emulador ou no celular.

## Primeira entrega: Projetos e Agenda

A primeira entrega (Sprint 1, AV1) apresenta as telas de **Projetos** e **Agenda**, junto com as tarefas que elas usam:

- **Projetos:** criar, editar e excluir categorias (nome, descrição, cor e datas), personalizar os status das tarefas e tocar numa categoria para ver as tarefas dela.
- **Agenda:** calendário mensal com setas para trocar de mês, dias com tarefa marcados e a lista de tarefas do dia tocado.
- **Tarefas:** CRUD completo, subtarefas, matriz de Eisenhower, tags, filtros e nota rápida.

User stories desta entrega:

| ID | História | Estado | No app |
|----|----------|--------|--------|
| US01 | Criar tarefas estruturadas (título, descrição, prazo, prioridade, esforço) com uso offline | ✅ Implementado | CRUD completo, salvo no aparelho. |
| US02 | Subtarefas em vários níveis com progresso automático | ✅ Implementado | Subtarefas aninhadas com prazo próprio e barra de progresso. |
| US03 | Lista ordenada por matriz de Eisenhower | ✅ Implementado | Quadrantes por prioridade e prazo; dentro de cada um, atrasadas primeiro, depois prazo mais próximo e menor esforço. |
| US04 | Projetos temáticos com cor e status personalizados | ✅ Implementado | Criar, editar e excluir categorias com nome, descrição, cor e datas de início e fim. Status personalizados com cor: criar, renomear e excluir (Pendente e Concluída são fixos). |
| US05 | Tags, filtros combinados e anotações rápidas | ✅ Implementado | Tags nas tarefas, filtros combinados (categoria, prioridade e tag) junto com a busca, e nota rápida que vira tarefa. |

## Product Backlog

O backlog por entrega, como no documento do produto: Sprint 1 (AV1, 30%), Sprint 2 (AV2, 20%) e Sprint 3 (AV3, 50%).

**Legenda**
- ✅ **Implementado:** funciona de verdade com as suas tarefas.
- 🟡 **Parcial:** a parte principal funciona; o restante ainda não.
- 🖼️ **Demonstração:** existe uma tela mostrando a ideia, com dados de exemplo.
- ⏳ **Não iniciado:** ainda não tem nada no app.

### Sprint 1 — AV1

| ID | História | Estado | No app |
|----|----------|--------|--------|
| US01 | Criar tarefas estruturadas (título, descrição, prazo, prioridade, esforço) com uso offline | ✅ Implementado | CRUD completo, salvo no aparelho. |
| US02 | Subtarefas em vários níveis com progresso automático | ✅ Implementado | Subtarefas aninhadas com prazo próprio e barra de progresso. |
| US03 | Lista ordenada por matriz de Eisenhower | ✅ Implementado | Quadrantes por prioridade e prazo; dentro de cada um, atrasadas primeiro, depois prazo mais próximo e menor esforço. |
| US04 | Projetos temáticos com cor e status personalizados | ✅ Implementado | Criar, editar e excluir categorias com nome, descrição, cor e datas de início e fim. Status personalizados com cor: criar, renomear e excluir (Pendente e Concluída são fixos). |
| US05 | Tags, filtros combinados e anotações rápidas | ✅ Implementado | Tags nas tarefas, filtros combinados (categoria, prioridade e tag) junto com a busca, e nota rápida que vira tarefa. |

### Sprint 2 — AV2

| ID | História | Estado | No app |
|----|----------|--------|--------|
| US06 | Lembretes por localização (GPS/geofencing) | 🟡 Parcial | No detalhe da tarefa, "Lembrete por local" marca o lugar atual pelo GPS com raio de 100, 200 ou 500 m. Ao chegar perto, o app mostra um aviso e uma notificação que abre a tarefa. Agenda › Lembretes por Local lista as tarefas com local e a distância. Funciona com o app aberto; o aviso com o app fechado (geofencing em segundo plano) ainda não existe. |
| US07 | Dependências entre tarefas | ✅ Implementado | No detalhe da tarefa, "Depende de" liga tarefas que precisam vir antes (sem permitir ciclos). A tarefa fica bloqueada (cadeado no cartão) e não pode ser concluída até as dependências estarem concluídas; o detalhe mostra o que ela libera. |
| US08 | Duplicar tarefas e salvar modelos | ✅ Implementado | Duplicar e "Salvar como modelo" no detalhe da tarefa e em Projetos › Duplicação e Modelos. O modelo guarda título, descrição, categoria, prioridade, esforço, tags, subtarefas, anotações e local; "Usar" cria a tarefa na hora e a tela Nova Tarefa permite começar de um modelo. |
| US09 | Sincronizar com Google Calendar e calendário do Android | ✅ Implementado | Agenda › Integrações liga a sincronização com o calendário do Android: cada tarefa aberta vira um evento no prazo (com a duração do esforço e aviso 30 min antes), atualizado ao editar e removido ao concluir, arquivar ou excluir. Escolhendo um calendário da conta Google, os eventos aparecem no Google Calendar. No caminho de volta, "Trazer eventos do calendário" lista os eventos dos próximos 30 dias e transforma o escolhido em tarefa. "Adicionar ao calendário" no detalhe da tarefa cria um evento avulso. |
| US10 | Anotações e anexos nas tarefas (imagem, documento, áudio) | ✅ Implementado | No detalhe da tarefa: anotações com data e hora, e anexos de arquivo (imagem, PDF, documentos, planilhas), foto pela câmera e áudio gravado no app (até 25 MB cada). Os arquivos ficam no aparelho; tocar abre no app adequado. |
| US11 | Alertas progressivos de prazo e resumo diário | ✅ Implementado | Agenda › Alertas de Prazo liga as notificações do Android: cada tarefa aberta avisa 1 dia, 2 horas e 30 minutos antes e na hora do prazo, mesmo com o app fechado; tocar no aviso abre a tarefa. O resumo diário (hora escolhida) diz quantas vencem hoje, quantas estão atrasadas e quantas estão em aberto. A régua mostra a urgência de cada tarefa. |
| US12 | Histórico de atividades, arquivamento e busca tolerante a erros | ✅ Implementado | A busca da lista e a de Agenda › Busca e Auditoria ignoram acentos e aceitam erros de digitação ("relatrio" acha "relatório"); a segunda procura também em descrição, tags, anotações e arquivadas. Arquivar (no detalhe da tarefa ou "Arquivar concluídas") tira a tarefa da lista sem apagar; dá para desarquivar. O histórico registra criar, editar, concluir, reabrir, arquivar, duplicar e excluir. |
| US13 | Tarefas recorrentes e tarefas criadas a partir de e-mails | ✅ Implementado | No detalhe da tarefa, "Repetir" (diária, semanal ou mensal, para sempre ou N vezes): concluir cria a próxima ocorrência com as subtarefas zeradas. Agenda › Tarefas Recorrentes lista as que se repetem e tem "E-mail → tarefa": colar o e-mail usa o assunto como título e acha o prazo no texto ("até sexta às 23h59", "15/12", "amanhã"). |

### Sprint 3 — AV3

| ID | História | Estado | No app |
|----|----------|--------|--------|
| US15 | Gráficos e relatórios de produtividade | 🟡 Parcial | Análises mostra concluídas, em aberto e atrasadas a partir das tarefas reais. Comparativos por período são demonstração. |
| US16 | Registrar tempo gasto e calibrar estimativas | 🖼️ Demonstração | Análises › Tempo e Estimativas |
| US17 | Cronograma (Gantt) das tarefas | 🖼️ Demonstração | Projetos › Cronograma Gantt |
| US18 | Projeção da data de conclusão | 🟡 Parcial | Projetos › Projeções usa as tarefas restantes reais com um ritmo fixo. |
| US22 | Sugestão de pausas e alerta de sobrecarga do dia | 🖼️ Demonstração | Análises › Bem-estar e Carga Diária |
| US23 | Backup na nuvem e exportação em PDF | 🖼️ Demonstração | Ajustes › Backup e Exportação |
| US24 | Metas pessoais diárias | 🖼️ Demonstração | Análises › Metas Pessoais |
| US26 | Automações com regras "se-então" | 🖼️ Demonstração | Ajustes › Automações |
| US27 | Fechamento diário, plano do dia seguinte e checkpoints | 🟡 Parcial | Análises › Fechamento Diário usa as tarefas reais (feitas hoje, prazo amanhã, sugestão da mais rápida). Checkpoints são demonstração. |
