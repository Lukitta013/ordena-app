# PROMPT PARA O FIGMA — APLICATIVO "ORDENA"
> Cole o conteúdo abaixo (da linha "=== INÍCIO DO PROMPT ===" até o fim) no Figma Make / Figma AI.
> Se a ferramenta limitar o tamanho, envie por blocos na ordem: BLOCO 1 (design system) → BLOCO 2 (telas) → BLOCO 3 (API/fluxo) → BLOCO 4 (entrega/prints).

=== INÍCIO DO PROMPT ===

# BLOCO 0 — CONTEXTO

Você é um designer de produto sênior. Crie no Figma o design completo do aplicativo mobile **Ordena** — um gerenciador de tarefas pessoais e de equipe, Android, feito em React Native, com arquitetura **offline-first (SQLite local + sincronização)**.

Idioma de toda a interface: **português do Brasil**.
Plataforma alvo: **Android**, frames de **390 × 844 px** (mobile), grid de 8 pt, safe area superior de 44 px e barra de navegação inferior de 56 px.
Projeto acadêmico: o resultado será apresentado a um professor, então a organização do arquivo e a exportação das telas são parte da entrega.

---

# BLOCO 1 — DESIGN SYSTEM (REGRAS OBRIGATÓRIAS)

## 1.1 Princípio visual
Interface **sóbria, minimalista e de baixa poluição visual**. Menos é mais: muito espaço em branco (negativo), hierarquia tipográfica clara e cor usada só como informação, nunca como decoração.

## 1.2 PROIBIÇÕES (regras rígidas)
- **NÃO use emojis em lugar nenhum** da interface (nada de 🔥 📅 ⚡ 🎓 💚 ✓ em texto). Emojis são proibidos em títulos, chips, abas, cards e botões.
- **NÃO use gradientes** em fundos, cards ou botões.
- **NÃO use sombras coloridas, glow, neon ou brilho.**
- **NÃO use mais de 3 cores de destaque** em uma mesma tela.
- **NÃO empilhe múltiplos badges coloridos** no mesmo card: no máximo 1 chip de categoria + 1 indicador de prioridade.
- **NÃO repita a informação**: se a barra lateral já indica prioridade, não coloque também um texto "Alta" ao lado.

## 1.3 Ícones
Use **apenas ícones de traço (outline), estilo Lucide/Feather**, monocromáticos, 20 × 20 px, espessura 1,5 px, na cor do texto secundário. Ícone sempre acompanhado de rótulo quando for ação principal.

## 1.4 Paleta (tema escuro como padrão + tema claro equivalente)

**Tema escuro (padrão)**
- Fundo base: `#0F1115`
- Superfície / card: `#171A21`
- Superfície elevada (modal, bottom sheet): `#1E222B`
- Borda / divisor: `#262B36`
- Texto primário: `#E8EAED`
- Texto secundário: `#9AA0AC`
- Texto terciário / placeholder: `#6B7280`
- Cor de marca (ação primária): `#4F6BED`
- Sucesso: `#3FB27F`
- Atenção: `#D9A441`
- Erro / crítico: `#D9534F`
- Neutro informativo: `#5A6473`

**Tema claro**
- Fundo `#F7F8FA` · Superfície `#FFFFFF` · Borda `#E3E6EB` · Texto primário `#141821` · Texto secundário `#5B6473` · Marca `#3F55C9`.

Regra: as cores semânticas (sucesso, atenção, erro) aparecem **só em barras de 3 px, pontos de 6 px ou textos de status** — nunca como fundo cheio de card.

## 1.5 Tipografia
Família **Inter** (fallback: Roboto).
- Display / título de tela: 26 px, SemiBold, line-height 32
- Título de seção: 17 px, SemiBold, line-height 24
- Título de card: 15 px, Medium, line-height 22
- Corpo: 14 px, Regular, line-height 20
- Apoio / metadados: 12 px, Regular, line-height 16
- Rótulo de chip / overline: 11 px, Medium, letter-spacing 0,4 px, caixa alta apenas em overlines

## 1.6 Componentes (crie como Components com Variants em uma página "Design System")
1. **Botão** — variants: primário, secundário (contorno), texto, destrutivo; estados: normal, pressionado, desabilitado, carregando; alturas 48 (grande) e 40 (médio); raio 10 px.
2. **Campo de texto** — variants: normal, focado, preenchido, erro, desabilitado; com rótulo acima, ícone opcional à esquerda, texto de ajuda/erro abaixo; altura 52; raio 10 px.
3. **Card de tarefa** — barra vertical de 3 px à esquerda indicando prioridade (erro = alta, atenção = média, neutro = baixa); título em 2 linhas máximo; linha de metadados com ícone de calendário + prazo, ícone de relógio + esforço; barra de progresso fina (2 px) com "x/y subtarefas"; 1 chip de projeto. Variants: pendente, em andamento, concluída (título com risco e opacidade 55%), atrasada, bloqueada.
4. **Chip / tag** — fundo transparente com borda de 1 px na cor do projeto, texto em 11 px. Sem fundo sólido.
5. **Abas (segmented control)** — 4 itens, indicador inferior de 2 px, sem ícone, sem emoji.
6. **Cabeçalho de seção** — título + contador discreto à direita + subtítulo explicativo em 12 px.
7. **Barra de navegação inferior** — 5 itens: Tarefas, Projetos, Agenda, Análises, Perfil. Ícone outline 22 px + rótulo 10 px; item ativo em cor de marca.
8. **Bottom sheet** — alça de 36 × 4 px no topo, cantos superiores 20 px, fundo em superfície elevada.
9. **Estado vazio** — ilustração geométrica simples em linha (sem mascote, sem emoji) + título + 1 frase + 1 botão.
10. **Toast / snackbar**, **modal de confirmação**, **skeleton loader**, **avatar**, **switch**, **checkbox**, **barra de progresso**, **badge numérico**, **indicador de conexão (Online / Offline / Sincronizando)**.

## 1.7 Substituindo os emojis por linguagem visual
- Quadrante "Fazer Agora" → cabeçalho "Fazer agora" + subtítulo "Urgente e importante" + barra de 3 px em erro.
- "Agendar" → subtítulo "Importante, não urgente" + barra em marca.
- "Interrupções" → subtítulo "Urgente, não importante" + barra em atenção.
- "Baixo impacto" → subtítulo "Nem urgente, nem importante" + barra em neutro.

---

# BLOCO 2 — TELAS A CRIAR (FLUXO COMPLETO)

Crie **todas** as telas abaixo, cada uma em seu próprio Frame, na ordem indicada. Entre parênteses estão as User Stories cobertas (backlog de 27 US, sprints 1 a 3).

## Grupo A — Acesso e autenticação (sprint 1)
1. **Splash** — logotipo "Ordena" em marca tipográfica simples, indicador de carregamento discreto.
2. **Onboarding** — 3 telas em carrossel: "Capture tudo", "Priorize com a matriz de Eisenhower", "Funciona sem internet". Ilustrações em linha, indicador de páginas, botão "Pular".
3. **Login** — campos E-mail e Senha (com olho de mostrar/ocultar), link "Esqueci minha senha", botão primário "Entrar", divisor "ou", botões secundários "Continuar com Google" e "Entrar com biometria", rodapé "Não tem conta? Criar conta". Mostre também as variantes: **estado de erro** ("E-mail ou senha inválidos") e **estado carregando**.
4. **Criar conta** — Nome, E-mail, Senha, Confirmar senha, medidor de força da senha, checkbox de termos, botão "Criar conta".
5. **Esqueci a senha** — campo de e-mail + botão "Enviar link".
6. **Verificação / código enviado** — 6 campos de código, reenviar em contagem regressiva.
7. **Nova senha** — dois campos + regras de senha listadas com check de validação.
8. **Login — biometria** — modal do sistema simulado sobre a tela de login.

## Grupo B — Núcleo de tarefas (sprint 1 — US01 a US05)
9. **Home / Minhas Tarefas** — saudação discreta "Bom dia, Lucas", título "Minhas tarefas", indicador "Offline-first · Sincronizado", 3 métricas em linha (Para hoje / Concluídas / Total) sem caixas coloridas, campo de busca com ícone de filtro, abas (Todas · Agora · Agendar · Interrupções · Baixo impacto), e as seções da matriz de Eisenhower com os cards de tarefa.
10. **Home — estado vazio** e **Home — carregando (skeleton)**.
11. **Busca e filtros** — bottom sheet com filtros multicritério: projeto, tag, prioridade, status, intervalo de prazo, esforço; botões "Limpar" e "Aplicar (12)". (US05)
12. **Nova tarefa** — bottom sheet: Título, Descrição, Prazo (data e hora), Esforço estimado, Prioridade (3 opções em segmented control), Projeto, Status, lista de subtarefas iniciais, aviso discreto "Esta tarefa entrará em: Agendar". (US01, US03)
13. **Detalhe da tarefa** — cabeçalho com título e ações (editar, duplicar, excluir); descrição; blocos de Prioridade, Status, Projeto, Prazo, Esforço; **Subtarefas aninhadas em 2 níveis** com percentual e barra de progresso; **Dependências** (bloqueada por / bloqueia); **Comentários**; **Anexos** (imagem, documento, áudio gravado); **Registro de tempo** (cronômetro e total gasto); **Checkpoints**. (US02, US07, US10, US16, US27)
14. **Tarefa bloqueada por dependência** — estado com aviso "Aguardando: Aprovação do cliente". (US07)
15. **Duplicar tarefa / salvar como modelo** — modal com opções (copiar subtarefas, anexos, comentários; recalcular datas). (US08)
16. **Anotações rápidas** — lista de notas curtas + ação "Converter em tarefa". (US05)

## Grupo C — Organização (sprint 1 e 2)
17. **Projetos — lista** — cards com nome, cor identificadora, período, progresso e contagem de tarefas. (US04)
18. **Projeto — detalhe** — abas: Tarefas, Membros, Status personalizados, Configurações. (US04, US25)
19. **Status personalizados** — editor de status com nome, cor e ícone. (US04)
20. **Tags** — gerenciamento de tags customizadas. (US05)

## Grupo D — Tempo, lembretes e integrações (sprint 2)
21. **Agenda / Calendário** — visão mensal + lista do dia; selo "Sincronizado com Google Calendar". (US09)
22. **Integrações** — cartões de conexão: Google Calendar, Gmail/Outlook (criar tarefa por e-mail), Google Drive/Dropbox (backup), com switches e estado "Conectado em 14/09". (US09, US13, US23)
23. **Lembretes por local (geofencing)** — mapa com raio, campo de local, gatilho "ao chegar / ao sair". (US06)
24. **Alertas de prazo** — configuração dos alertas progressivos (7 dias, 3 dias, 1 dia, 3 horas, 30 minutos) com escala de cor de neutro → atenção → erro. (US11)
25. **Notificações** — lista cronológica com não lidas destacadas por um ponto de 6 px. (US11)
26. **Tarefas recorrentes** — regra de repetição + critério de parada (após N ocorrências / até a data / sem fim). (US13)
27. **Atribuição de tarefa** — verificação de conflito de agenda + fluxo Aceitar / Recusar / Solicitar ajuste. (US14)
28. **Feed de auditoria e arquivadas** — linha do tempo de alterações e aba "Arquivadas". (US12)
29. **Busca semântica** — resultados com correção ortográfica ("Você quis dizer..."). (US12)

## Grupo E — Análises e gestão (sprint 3)
30. **Análises de produtividade** — gráfico de barras (entregas por semana) e de linhas (tendência), sem 3D, sem gradiente, uma cor de série por vez. (US15)
31. **Relatório comparativo** — comparação mensal/trimestral com variação percentual. (US15)
32. **Gantt** — linha do tempo horizontal com barras, setas de dependência e barra sendo arrastada (estado de recálculo em cascata). (US17)
33. **Projeções do projeto** — data provável de conclusão, taxa de execução, previsão de recursos. (US18)
34. **Painel de capacidade da equipe** — carga por membro, alerta de sobrecarga e sugestão de delegação. (US19)
35. **Conflito de edição (lock otimista)** — modal "Esta tarefa foi alterada por Ana às 14:32" com opções Manter minha versão / Ver diferenças / Descartar. (US20)
36. **Chamada de áudio/vídeo (WebRTC)** — tela de chamada iniciada a partir do contexto da tarefa, com controles de microfone, câmera e encerrar. (US21)
37. **Bem-estar e metas** — sugestão de pausa, alerta preditivo de sobrecarga, meta diária e ranking anônimo em lista sem nomes. (US22, US24)
38. **Revisão de tarefa concluída** — formulário estruturado de feedback. (US24)
39. **Backup e exportação** — destino do backup, frequência, histórico e "Exportar relatório em PDF". (US23)
40. **Automações (motor de regras se-então)** — lista de regras + editor visual "Se [condição] então [ação]" com prévia do JSON gerado. (US26)
41. **Fechamento diário** — resumo noturno, validação do plano do dia seguinte, sugestões de priorização. (US27)
42. **Administração** — membros, permissões por projeto e logs de acesso por horário. (US25)

## Grupo F — Perfil e estados de sistema
43. **Perfil e configurações** — dados da conta, tema (claro/escuro/sistema), notificações, sincronização, sair da conta.
44. **Estados de sistema** — 4 frames lado a lado: **Offline** (faixa discreta "Sem conexão · 3 alterações na fila"), **Sincronizando**, **Erro de servidor** com botão "Tentar novamente", **Sessão expirada** com retorno ao login.

---

# BLOCO 3 — FLUXO DE SERVIÇO E CONTRATO DE API

Crie uma página chamada **"Fluxo de Serviço & API"** com os frames abaixo (formato paisagem 1920 × 1080, diagramas em linha, sem emojis, usando a mesma paleta).

## 3.1 Frame "Arquitetura"
Diagrama em camadas, da esquerda para a direita:

`App React Native (UI)` → `Camada de domínio (Zustand/Redux)` → `SQLite local (offline-first, índices compostos)` → `Fila de sincronização (outbox)` → `API Gateway (Node.js + Express)` → e à direita, em coluna: `PostgreSQL`, `Redis (cache e filas)`, `MinIO (anexos via S3 API)`, `Firebase Cloud Messaging (push)`, `SMTP (resumos diários)`, `Google Calendar API`, `Gmail/Outlook API`, `Google Drive/Dropbox (backup)`, `Servidor de sinalização WebRTC (Node.js)`, `WebSocket (tempo real)`.

Legende as setas com: `REST/JSON + JWT`, `WebSocket`, `Presigned URL`, `OAuth 2.0`.

## 3.2 Frame "Fluxo offline-first"
Sequência: ação do usuário → gravação imediata no SQLite → item entra no outbox com `version` e `updated_at` → tela mostra "Sincronizando" → ao ter rede, `POST /sync/push` → servidor responde `200` (aplicado) ou `409` (conflito de versão) → em caso de `409`, abre a tela de conflito de edição (lock otimista) → `GET /sync/pull?since=` traz as mudanças remotas → estado final "Sincronizado".

## 3.3 Frame "Fluxo de autenticação"
Login → `POST /auth/login` → recebe `accessToken` (15 min) + `refreshToken` (30 dias) → guarda no Keystore → requisições com `Authorization: Bearer` → `401` dispara `POST /auth/refresh` → se o refresh falhar, volta ao login.

## 3.4 Frame "Contrato de API — entregas"
Tabela com as colunas **Método · Endpoint · Descrição · Tela · US**. Preencha com:

**Autenticação**
- `POST /auth/register` — criar conta — Criar conta — US01
- `POST /auth/login` — autenticar — Login — US01
- `POST /auth/refresh` — renovar token — (transversal)
- `POST /auth/logout` — encerrar sessão — Perfil
- `POST /auth/forgot-password` — enviar link — Esqueci a senha
- `POST /auth/reset-password` — redefinir — Nova senha
- `GET /auth/me` — perfil do usuário — Perfil

**Tarefas**
- `GET /tasks` — listar com filtros (`?project=&tag=&priority=&status=&due_from=&due_to=&q=`) — Home, Busca — US01, US05
- `POST /tasks` — criar — Nova tarefa — US01
- `GET /tasks/{id}` — detalhe — Detalhe da tarefa — US01
- `PATCH /tasks/{id}` — editar (envia `version` para lock otimista) — Detalhe — US20
- `DELETE /tasks/{id}` — excluir — Detalhe
- `POST /tasks/{id}/duplicate` — duplicar com recálculo de datas — Duplicar — US08
- `POST /templates` · `GET /templates` — modelos reutilizáveis — Duplicar — US08
- `GET|POST /tasks/{id}/subtasks` · `PATCH /subtasks/{id}` — subtarefas aninhadas e progresso — Detalhe — US02
- `POST /tasks/{id}/dependencies` · `DELETE /dependencies/{id}` — dependências rígidas e externas — Detalhe — US07
- `GET|POST /tasks/{id}/comments` — comentários — Detalhe — US10
- `POST /attachments/presign` · `POST /tasks/{id}/attachments` — upload no MinIO via URL assinada — Detalhe — US10
- `POST /tasks/{id}/time-entries` · `GET /tasks/{id}/time-entries` — tempo real gasto — Detalhe — US16
- `POST /tasks/{id}/checkpoints` — prazos parciais — Detalhe — US27
- `POST /tasks/{id}/archive` — arquivar — Arquivadas — US12

**Priorização e busca**
- `GET /priority/matrix` — quadrantes calculados (prazo, esforço, dependências, histórico de atrasos) — Home — US03
- `POST /priority/recompute` — recalcular ordenação — Home — US03
- `GET /search?q=` — busca semântica com índice invertido tolerante a erros — Busca — US12

**Projetos, status e tags**
- `GET|POST /projects` · `PATCH|DELETE /projects/{id}` — projetos temáticos — Projetos — US04
- `GET|POST /projects/{id}/statuses` — status personalizados — Status — US04
- `GET|POST /tags` — tags customizadas — Tags — US05
- `GET|POST /notes` · `POST /notes/{id}/convert` — anotações rápidas e conversão — Anotações — US05

**Lembretes, prazos e notificações**
- `POST /devices` — registrar token FCM — (transversal)
- `GET|POST /geofences` — lembretes por local — Lembretes por local — US06
- `GET|PUT /alerts/settings` — alertas progressivos (7d → 30min) — Alertas de prazo — US11
- `GET /notifications` · `POST /notifications/{id}/read` — central de notificações — Notificações — US11
- `PUT /digests/settings` — resumo diário por e-mail/push — Alertas — US11
- `GET|POST /recurrences` — recorrência e critério de parada — Tarefas recorrentes — US13

**Integrações**
- `POST /integrations/google-calendar/connect` · `POST /integrations/google-calendar/sync` — US09
- `POST /integrations/email/connect` · `GET|POST /integrations/email/rules` — tarefa a partir de e-mail — US13
- `GET|PUT /backup/config` · `POST /backup/run` · `GET /backup/history` — Google Drive/Dropbox — US23
- `POST /reports/export` — relatório analítico em PDF — Backup e exportação — US23

**Equipe e colaboração**
- `GET /availability/conflicts` — conflito de agenda antes de atribuir — Atribuição — US14
- `POST /assignments` · `POST /assignments/{id}/accept|decline|adjust` — aceite, recusa, ajuste — Atribuição — US14
- `WS /realtime` — eventos de mudança em tempo real e alerta de mudança de escopo — US20
- `POST /calls` · `WS /signaling` — chamada WebRTC a partir da tarefa — Chamada — US21
- `GET /workload` · `POST /delegation/suggest` — capacidade e delegação automática — Painel de capacidade — US19

**Análises e automação**
- `GET /analytics/productivity?period=` — barras e linhas — Análises — US15
- `GET /analytics/comparison?from=&to=` — comparativo mensal/trimestral — Relatório — US15
- `GET /analytics/complexity-index` · `GET /estimates/calibration` — índice de complexidade e calibração — Detalhe/Análises — US16
- `GET /projects/{id}/gantt` · `PATCH /projects/{id}/gantt` — arrastar e recalcular em cascata — Gantt — US17
- `GET /projects/{id}/forecast` — data provável e previsão de recursos — Projeções — US18
- `GET|POST /automations` · `POST /automations/{id}/test` — regras se-então em JSON — Automações — US26
- `GET /meetings/suggest-duration` — duração ótima de reunião — Automações — US26
- `GET /wellbeing/breaks` · `GET /wellbeing/ranking` · `GET|PUT /goals` — pausas, ranking anônimo e metas — Bem-estar — US22, US24
- `POST /reviews` — solicitar revisão com formulário de feedback — Revisão — US24
- `GET /daily-closeout` — fechamento noturno e plano do dia seguinte — Fechamento diário — US27

**Governança**
- `GET|POST /admin/members` · `PUT /admin/permissions` — permissões por projeto — Administração — US25
- `GET /audit-logs?member=&from=&to=` — logs de acesso e alterações — Auditoria — US12, US25

**Sincronização**
- `POST /sync/push` — envia o outbox (retorna `409` em conflito de versão)
- `GET /sync/pull?since=` — busca alterações remotas
- `GET /health` — disponibilidade do serviço

## 3.5 Frame "Padrões técnicos"
Caixa com: autenticação `Bearer JWT`; paginação `?page=&limit=` com envelope `{ data, meta }`; erros no formato `{ error: { code, message, details } }`; códigos usados `200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500`; cabeçalhos `Idempotency-Key` (criação offline) e `If-Match: version` (lock otimista); versionamento `/v1`.

## 3.6 Frame "Mapa telas × US × endpoints"
Matriz visual ligando cada tela do BLOCO 2 às suas US e aos endpoints do item 3.4.

---

# BLOCO 4 — ORGANIZAÇÃO DO ARQUIVO E ENTREGA DOS PRINTS

## 4.1 Estrutura de páginas do Figma
Crie exatamente estas páginas, nesta ordem:
1. `00 — Capa`
2. `01 — Design System`
3. `02 — Acesso e Autenticação`
4. `03 — Tarefas (Sprint 1)`
5. `04 — Organização (Sprint 1–2)`
6. `05 — Integrações e Alertas (Sprint 2)`
7. `06 — Análises e Gestão (Sprint 3)`
8. `07 — Perfil e Estados de Sistema`
9. `08 — Fluxo de Serviço & API`
10. `09 — Prints para Entrega`

## 4.2 Nomenclatura dos frames (obrigatória)
Nomeie cada frame no padrão `NN_Nome-da-Tela_USxx` — por exemplo: `03_Login_US01`, `09_Home-Tarefas_US03`, `13_Detalhe-Tarefa_US02-US07`. Isso faz com que o nome do arquivo exportado já identifique a tela e a User Story.

## 4.3 Página "09 — Prints para Entrega"
Esta é a página que será mostrada ao professor. Monte assim:
- **Um frame por tela**, isolado, tamanho **1200 × 1000 px**, fundo `#0B0D11`.
- Dentro de cada frame: a tela do app centralizada com leve elevação, e acima dela um cabeçalho de duas linhas — linha 1: número e nome da tela (18 px SemiBold); linha 2: User Stories atendidas e os endpoints usados (12 px, texto secundário).
- Rodapé de cada frame: `Ordena — Lucas Inacio de Carvalho · Android React Native`.
- Organize os frames em uma grade de 4 colunas, com 120 px de espaçamento entre eles.
- Inclua ao final três frames-resumo: **Mapa de navegação** (todas as telas ligadas por setas), **Arquitetura de serviço** e **Tabela de endpoints**.

## 4.4 Como exportar
Configure **todos** os frames da página `09 — Prints para Entrega` com preset de exportação **PNG 2x**. Ao final, liste para o usuário o passo a passo:
1. Abrir a página `09 — Prints para Entrega`;
2. Selecionar todos os frames (`Ctrl/Cmd + A`);
3. Menu `File > Export` (ou `Ctrl/Cmd + Shift + E`);
4. Confirmar `PNG · 2x` e exportar — cada frame vira um arquivo `.png` separado, já nomeado no padrão do item 4.2.

## 4.5 Protótipo
Ligue os frames em um protótipo navegável começando em `01_Splash`: Splash → Onboarding → Login → Home; e a partir da Home, navegação pela barra inferior e abertura dos detalhes, bottom sheets e modais. Use transição "Smart Animate" de 200 ms, sem efeitos chamativos.

## 4.6 Antes de finalizar, verifique
- [ ] Nenhum emoji em nenhuma tela.
- [ ] Nenhum gradiente, glow ou sombra colorida.
- [ ] Máximo de 3 cores de destaque por tela.
- [ ] Todas as 27 User Stories aparecem em pelo menos uma tela.
- [ ] Tela de login existe com os estados normal, erro e carregando.
- [ ] Todos os frames de `09 — Prints para Entrega` estão com exportação PNG 2x configurada.

=== FIM DO PROMPT ===
