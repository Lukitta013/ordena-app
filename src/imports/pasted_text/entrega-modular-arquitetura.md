
1. **Aba 1 ("Entrega 1 - AV1: 30% | Core MVP & Offline-First")**:
   - Aponta para `src/entrega1/` cobrindo **US01 a US05** (Itens 01, 02, 03, 04, 09, 11, 30, 43).
   - Badge descritivo: "8 Itens do Backlog • Foco em Matriz Eisenhower, CRUD SQLite e Subtarefas".
2. **Aba 2 ("Entrega 2 - AV2: 20% | Suporte, Hardware e Integrações")**:
   - Aponta para `src/entrega2/` cobrindo **US06 a US14** (Itens 05, 07, 08, 10, 12, 13, 14, 15, 16, 17, 24, 31, 32, 35, 38, 41, 47).
   - Badge descritivo: "17 Itens do Backlog • Geofencing GPS, MinIO Áudio, Bloqueio Rígido e Calendário".
3. **Aba 3 ("Entrega 3 - AV3: 50% | Inteligência, BI, Colaboração e Release")**:
   - Aponta para `src/entrega3/` cobrindo **US15 a US27** (Itens 06, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29, 33, 34, 36, 37, 39, 40, 42, 44, 45, 46, 48, 49, 50, 51, 52, 53).
   - Badge descritivo: "28 Itens do Backlog • Gantt Interativo, BI Dashboard, WebRTC, Burnout e Regras JSON".

Ao clicar em cada aba da barra externa, o smartphone chaveia dinamicamente para o hub/telas do respectivo módulo, mantendo a consistência dos dados mockados no estado global do React.

---

## 3. ARQUITETURA MODULAR E TELAS POR ENTREGA

### 📁 ABA 1: `src/entrega1/` (ENTREGA 1 — AV1: 30% • US01 a US05)
Foco no Core MVP funcional, persistência local simulada e ordenação inteligente.

1. **Tela Principal (Home com Matriz de Eisenhower Modificada - US01, US03)**:
   - Header do app móvel com saudação, avatar do usuário, indicador visual animado "Offline-First SQLite Ativo (Índices Compostos OK)" e botão de busca rápida.
   - **Matriz de Eisenhower Interativa**:
     - Visualização em abas ou quadrantes 2x2 com cards elegantes:
       - **Q1 - Fazer Agora** (Urgente & Importante - ex: "Corrigir vazamento de memória no build").
       - **Q2 - Agendar** (Não Urgente & Importante - ex: "Refatorar camada de dados MinIO").
       - **Q3 - Delegar** (Urgente & Não Importante - ex: "Atualizar planilha de reuniões").
       - **Q4 - Eliminar** (Não Urgente & Não Importante - ex: "Organizar pastas antigas de downloads").
     - Badge com o **Score de Priorização Heurística** calculado para cada tarefa com base em: Prazo + Esforço + Dependências + Histórico de Atrasos.
     - Checkbox interativo com animação de tachado e som/feedback tátil visual.
2. **Modal de Criação e Edição de Tarefas Estruturadas (US01, US04, US05)**:
   - Formulário completo com validações:
     - Título e Descrição detalhada (suporte a markdown visual).
     - Data e Hora de Vencimento (DatePicker nativo simulado).
     - Seletor de Prioridade (Alta, Média, Baixa) com cores dinâmicas.
     - Esforço Estimado (horas ou pontos de complexidade).
     - Associação a Projeto temático com badge colorido.
     - Seletor de Status Personalizados (ex: "Pendente", "Em Andamento", "Em Revisão", "Bloqueada", "Concluída") com ícones e cores customizáveis (US04, ITEM-30).
     - Tags e Etiquetas customizadas (ex: `#frontend`, `#api`, `#critico`) com autocomplete.
3. **Modal de Detalhes da Tarefa & Subtarefas Multinível (US02)**:
   - Árvore hierárquica de subtarefas aninhadas em múltiplos níveis (Tarefa -> Subtarefa Nível 1 -> Subtarefa Nível 2).
   - Definição individual de responsável (avatar/nome) e prazo específico por subtarefa.
   - **Barra de Progresso Percentual Dinâmica**: recalcula automaticamente em tempo real à medida que as subtarefas são marcadas como concluídas (ex: 3 de 5 concluídas = 60%).
4. **Gaveta de Anotações Rápidas (Quick Notes - US05, ITEM-43)**:
   - Painel deslizante inferior (bottom-sheet) para rascunho de ideias rápidas não estruturadas com um clique no botão "Converter em Tarefa Completa" (preenchendo o formulário da US01 automaticamente).
5. **Barra de Filtros Multicritério Combinados (US05, ITEM-09)**:
   - Filtros dinâmicos por Projeto, Tag, Responsável, Status e Intervalo de Datas.
   - Botão "Salvar Visualização Rápida" para persistir presets de filtros.

---

### 📁 ABA 2: `src/entrega2/` (ENTREGA 2 — AV2: 20% • US06 a US14)
Foco em sensores de hardware, integrações nativas, regras de dependência rígida e armazenamento em nuvem.

1. **Simulador de Geofencing & Lembretes por GPS (US06, ITEM-05, ITEM-35)**:
   - Card interativo com mini-mapa vetorial estilizado simulando a localização GPS do usuário via `react-native-geolocation`.
   - Botão interativo: "Simular Deslocamento do Usuário para o Raio do Cartório/Supermercado".
   - Ao entrar no raio de 200m, dispara uma notificação push Android contextual na tela: *"📍 Alerta de Proximidade: Você está a 50m do Supermercado. Não se esqueça de: 'Comprar insumos para o laboratório'!"* com botões de ação direta.
2. **Mecanismo de Dependências Rígidas e Alertas de Bloqueio (US07, ITEM-07, ITEM-41, ITEM-47)**:
   - Visualizador de vínculos entre tarefas (ex: "Tarefa B: Deploy em Produção" depende estritamente da "Tarefa A: Aprovação dos Testes E2E").
   - Interação: Ao tentar avançar o status da tarefa dependente sem concluir a antecedente, exibe um modal de bloqueio rígido com ícone de cadeado vermelho: *"⚠️ Ação Bloqueada: Esta tarefa possui dependência não concluída. Conclua primeiro [Tarefa A] para desbloquear."*
   - Gestão de Dependências Externas (Terceiros/Fornecedores) com cronômetro de prazo crítico e alertas de atraso.
3. **Módulo de Duplicação e Templates Reutilizáveis (US08, ITEM-08)**:
   - Botão "Duplicar Tarefa com Subtarefas": duplica toda a árvore recalculando datas automaticamente com base no dia atual (D+0, D+2, D+5).
   - Seletor de "Salvar como Template de Rotina" (ex: "Onboarding de Novo Membro", "Fechamento Mensal").
4. **Sincronização Bidirecional com Google Calendar & Android Provider (US09, ITEM-10)**:
   - Painel com toggle "Sincronização Ativa com Google Calendar".
   - Botão "Forçar Sincronização Agora" com animação de rotação e exibição do timestamp do último sync e eventos espelhados.
5. **Comentários Multimídia & Gravador de Áudio com MinIO REST (US10, ITEM-12)**:
   - Thread de comentários na tarefa com avatares e timestamps.
   - **Simulador de Gravador de Áudio**:
     - Botão "Gravar Áudio" (ícone de microfone) que inicia gravação com visualizador de onda sonora (waveform animado) e contador de segundos.
     - Botão "Parar e Salvar no MinIO via API REST": exibe card de áudio pronto para reprodução com player interativo (Play/Pause, barra de progresso) e badge: `s3://minio-ordena/audios/task_10_note.mp3 (240 KB)`.
     - Área de anexos com pré-visualização de fotos e documentos PDF.
6. **Sistema de Alertas Progressivos de Prazo (US11, ITEM-13)**:
   - Régua visual com badges de gradiente de cores conforme a urgência do vencimento:
     - 7 dias: Verde (`bg-emerald-500`)
     - 3 dias: Amarelo (`bg-amber-400`)
     - 1 dia: Laranja (`bg-orange-500`)
     - 2 horas: Vermelho (`bg-rose-500`)
     - 30 minutos: Vermelho Carmesim pulsante com notificação push simulada.
   - Card de "Resumo Diário de Alterações" pronto para disparo por e-mail/push (ITEM-16).
7. **Busca Semântica com Índice Invertido & Auditoria Cronológica (US12, ITEM-14, ITEM-15, ITEM-17)**:
   - Campo de busca com simulação de índice invertido tolerante a erros ortográficos: ao digitar "relatrio" ou "minio", encontra instantaneamente "Relatório Trimestral" e arquivos associados.
   - Feed cronológico de auditoria (quem criou, quem alterou status, quem comentou, com horários exatos).
   - Seção de "Tarefas Arquivadas" com restauração em 1 clique.
8. **Configurador de Tarefas Recorrentes & Integração de E-mails (US13, ITEM-24, ITEM-38)**:
   - Seletor de periodicidade (Diária, Semanal, Mensal) com critérios de parada (ex: "Encerrar após 12 ocorrências" ou "Data limite").
   - Simulador de captura de e-mails (Gmail/Outlook API) convertendo e-mail recebido em tarefa com 1 clique.
9. **Verificação de Conflitos de Agenda & Fluxo de Aceite/Recusa (US14, ITEM-31, ITEM-32)**:
   - Ao atribuir tarefa a um colega, o app verifica a disponibilidade: *"⚠️ Conflito Detectado: Lucas já possui 7h de tarefas nesta quarta-feira. Sugestão: Quinta-feira às 10h"*.
   - Painel do colaborador com botões interativos: **[Aceitar Tarefa]**, **[Recusar com Justificativa]** e **[Solicitar Reajuste de Horário]**.

---

### 📁 ABA 3: `src/entrega3/` (ENTREGA 3 — AV3: 50% • US15 a US27)
Foco em Business Intelligence, visualização em Gantt, inteligência preditiva, colaboração síncrona WebRTC e conformidade de release.

1. **Dashboard de Business Intelligence & Produtividade (US15, ITEM-06, ITEM-44)**:
   - Métricas chave em cards estilo KPI:
     - Taxa de Conclusão Global (%)
     - Média de Tempo de Execução (horas/tarefa)
     - Índice de Atraso (%) com gráfico de tendência
   - Gráficos interativos renderizados em SVG/Tailwind:
     - Gráfico de Barras: Tarefas concluídas por dia da semana.
     - Gráfico de Linhas/Área: Produtividade comparativa Mensal vs Trimestral.
2. **Cronograma Visual em Diagrama de Gantt Interativo (US17, ITEM-20)**:
   - Linha do tempo visual com visualização por dias/semanas.
   - Barras horizontais coloridas representando tarefas e marcos do projeto.
   - Setas de conexão SVG ilustrando as dependências rígidas entre as atividades.
   - Capacidade de interagir com as barras (arrastar ou alterar datas) recalculando automaticamente o cronograma das tarefas sucessoras conectadas.
3. **Telemetria de Esforço Real, Calibração Heurística & Índice de Complexidade (US16, ITEM-19, ITEM-29, ITEM-33)**:
   - Timer nativo (Play/Pause) para registrar o tempo real trabalhado em uma tarefa.
   - Comparativo: "Tempo Estimado (4h) vs Tempo Real Gasto (5h20m)".
   - Indicador de "Precisão Histórica de Estimativas" (ex: 85% de calibração).
   - Badge com **Índice de Complexidade Multivariado** calculado automaticamente pela fórmula que pondera: `(# subtarefas * 1.5) + (# dependências * 2.0) + (# anexos * 0.5) + (# comentários * 0.3)`.
4. **Previsão Probabilística de Conclusão & Dimensionamento de Recursos (US18, ITEM-22, ITEM-40)**:
   - Card preditivo com a data provável de término da sprint/projeto com base na velocidade atual (Burndown preditivo).
   - Projeção de recursos necessários (estimativa de horas de desenvolvedores e designers para a próxima etapa).
5. **Painel de Capacidade da Equipe, Delegação Automática & Rotação (US19, ITEM-18, ITEM-21, ITEM-34)**:
   - Heatmap visual de alocação por membro da equipe (ex: Lucas: 92% - Sobrecarga, Mariana: 65% - Ideal, Carlos: 30% - Ocioso).
   - Sugestão automática do sistema com 1 clique: *"Transferir 'Ajustar Schema SQLite' de Lucas para Carlos para equilibrar a sprint"*.
   - Tabela de rotação periódica para tarefas repetitivas de manutenção/suporte.
6. **Mecanismo de Lock Otimista & Notificação de Mudança de Escopo (US20, ITEM-23, ITEM-50)**:
   - Simulação de edição concorrente com controle de versão: se dois usuários editam ao mesmo tempo, dispara banner de conflito: *"⚠️ Alerta de Lock Otimista: Este registro foi alterado por outro membro há 1 min. [Visualizar Alterações e Mesclar]"*.
   - Histórico de auditoria de alterações de escopo ou prazo com resumo detalhado.
7. **Chamadas de Voz e Vídeo P2P via WebRTC com Sinalização Node.js (US21, ITEM-25)**:
   - Botão direto no header da tarefa "Iniciar Alinhamento WebRTC".
   - Abre modal de videoconferência simulando transmissão de vídeo da câmera frontal, áudio P2P, botões de Mute/Câmera/Compartilhar Tela e indicador *"Status: Conectado P2P via STUN/TURN (Node.js Signaling Ativo)"*.
8. **Prevenção de Burnout, Alertas Diários e Ranking Ético Anônimo (US22, ITEM-27, ITEM-53, ITEM-26)**:
   - Radar de Saúde Ocupacional com alerta preditivo: *"Você acumulou mais de 8 horas de tarefas críticas hoje. Sugestão de Pausa de 15 minutos recomendada! ☕"*.
   - Leaderboard ético com codinomes anônimos (ex: "Desenvolvedor Ágil #04", "Arquiteto #02") incentivando colaboração saudável com opção de anonimato total.
9. **Backup em Nuvem (Google Drive / Dropbox) & Exportação Completa em PDF (US23, ITEM-28, ITEM-49)**:
   - Card de status de backup com botão "Executar Backup Imediato".
   - Gerador de relatório analítico: botão "Exportar Relatório PDF" que abre modal simulando o documento formatado com resumo executivo, gráficos de Gantt e lista de tarefas homologadas pronto para download.
10. **Metas Pessoais de Produtividade (OKRs) & Revisão por Pares (US24, ITEM-36, ITEM-37)**:
    - Widget de metas individuais (ex: "Meta do dia: Concluir 4 tarefas técnicas - [=== 75% ===]").
    - Formulário estruturado de Code Review / Validação por Pares com critérios de qualidade, aderência ao prazo e campos de feedback qualitativo.
11. **Governança de Projetos com Permissões & Auditoria de Acessos (US25, ITEM-39, ITEM-51)**:
    - Matriz de papéis por projeto (Admin, Editor, Revisor, Visualizador).
    - Tabela de auditoria de acessos registrando membro, IP simulado, tarefa visualizada e timestamp.
12. **Motor de Regras JSON ('Se-Então') & Otimização de Reuniões (US26, ITEM-42, ITEM-45)**:
    - Construtor visual de regras de automação com visualizador de JSON gerado:
      - *Exemplo*: `IF (task.priority === 'ALTA' && task.status === 'BLOQUEADA') -> THEN (notify('Gestor', 'URGENTE') && scheduleSlackAlert())`.
    - Otimizador de reuniões que analisa a pauta e sugere reuniões enxutas de 15 a 25 minutos.
13. **Fechamento Diário Noturno (D+1), Anti-Procrastinação & Checkpoints (US27, ITEM-46, ITEM-48, ITEM-52)**:
    - Tela de fechamento diário noturno: resumo das tarefas entregues hoje e validação guiada do planejamento de amanhã (D+1).
    - Assistente anti-procrastinação: destaca a tarefa ideal de 15 minutos para iniciar o dia destravando o fluxo de dopamina.
    - Tarefas longas fracionadas com checkpoints intermediários (25%, 50%, 75%, 100%) com prazos parciais independentes.

---

## 4. DADOS MOCKADOS E INTERATIVIDADE REAL

Gere uma base de dados mockada rica em `src/mock/mockData.ts` contendo:
- 6 a 8 tarefas diversificadas pertencentes a projetos distintos ("App Ordena - Sprint Core", "Backend Node.js", "Infraestrutura MinIO/S3", "Design System Figma").
- Subtarefas reais de 2 a 3 níveis hierárquicos.
- Membros de equipe (Lucas Inacio, Mariana Silva, Carlos Souza, Ana Mendes).
- Histórico de auditoria, eventos de calendário, anexos de áudio e regras JSON pré-configuradas.

**Toda a UI deve ser funcionalmente navegável**:
- Clicar em abas altera os componentes no smartphone.
- Clicar em checkboxes atualiza os estados e barras de progresso.
- Abrir e fechar modais e gavetas deslizantes (bottom sheets).
- Alternar o tema reflete instantaneamente em toda a aplicação.

Construa a aplicação em React moderno com componentes limpos, tipados com TypeScript e estilizados com classes utilitárias do Tailwind CSS, garantindo uma apresentação acadêmica impecável, fluida e de nível profissional.