# PROMPT PARA O FIGMA — TELA DE LOGIN + INTEGRAÇÃO DE TODAS AS TELAS
**Aplicativo Ordena · Lucas Inacio de Carvalho · Android React Native**

> Este prompt complementa o `PROMPT_FIGMA_ORDENA.md`. Use-o depois que as telas já existirem no arquivo, ou junto com ele.
> Cole o conteúdo entre "=== INÍCIO DO PROMPT ===" e "=== FIM DO PROMPT ===".

=== INÍCIO DO PROMPT ===

# PARTE 1 — TELA DE LOGIN (ESPECIFICAÇÃO COMPLETA)

Crie o grupo de autenticação do aplicativo **Ordena** em frames de **390 × 844 px**, tema escuro, idioma português do Brasil.
**Regras rígidas: nenhum emoji, nenhum gradiente, nenhum glow ou sombra colorida, no máximo 3 cores de destaque por tela.** Ícones apenas de traço (Lucide/Feather), 20 px, espessura 1,5.

Paleta: fundo `#0F1115` · superfície `#171A21` · superfície elevada `#1E222B` · borda `#262B36` · texto primário `#E8EAED` · texto secundário `#9AA0AC` · placeholder `#6B7280` · marca `#4F6BED` · sucesso `#3FB27F` · atenção `#D9A441` · erro `#D9534F`.
Tipografia Inter: título 26/32 SemiBold · corpo 14/20 Regular · apoio 12/16 · rótulo de campo 13/18 Medium.

## 1.1 Frame `03_Login_US01` — estado padrão
Estrutura vertical, margens laterais de 24 px:

| Posição (y) | Elemento | Especificação |
|---|---|---|
| 44 | Safe area | Barra de status Android, ícones em texto secundário |
| 96 | Marca | Palavra "Ordena" em 28 px SemiBold, letter-spacing −0,4; abaixo, "Organize. Priorize. Entregue." em 13 px, texto secundário |
| 184 | Título | "Entrar" em 26 px SemiBold |
| 216 | Subtítulo | "Acesse sua conta para continuar" em 14 px, texto secundário |
| 264 | Campo E-mail | Rótulo "E-mail" acima; caixa 342 × 52, raio 10, fundo superfície, borda 1 px; ícone de envelope à esquerda; placeholder "seu@email.com"; teclado de e-mail |
| 340 | Campo Senha | Rótulo "Senha"; mesma caixa; ícone de cadeado à esquerda; ícone de olho à direita para mostrar/ocultar; placeholder "Sua senha" |
| 400 | Link | "Esqueci minha senha" alinhado à direita, 13 px, cor de marca, sem sublinhado |
| 444 | Botão primário | "Entrar", largura total, altura 52, raio 10, fundo de marca, texto `#FFFFFF` 15 px SemiBold |
| 512 | Divisor | Linha de 1 px em borda, com o texto "ou" centralizado em 12 px sobre o fundo |
| 548 | Botão Google | Secundário (fundo transparente, borda 1 px), altura 52, ícone do Google à esquerda, texto "Continuar com Google" |
| 612 | Botão biometria | Secundário, ícone de digital, texto "Entrar com biometria" |
| 760 | Rodapé | "Não tem uma conta? " em texto secundário + "Criar conta" em cor de marca, centralizado |

Espaçamento vertical entre blocos: múltiplos de 8. Nenhum card decorativo, nenhuma ilustração de fundo.

## 1.2 Variantes obrigatórias da tela de login
Crie cada uma como frame próprio, lado a lado, nomeados no padrão indicado:

1. `03a_Login_Padrao` — como acima, campos vazios.
2. `03b_Login_Foco` — campo de e-mail focado: borda 1,5 px em cor de marca, rótulo em cor de marca, cursor visível.
3. `03c_Login_Preenchido` — ambos os campos preenchidos, senha mascarada com pontos, botão "Entrar" totalmente opaco.
4. `03d_Login_Senha-visivel` — senha em texto puro, ícone de olho no estado ativo.
5. `03e_Login_Erro-validacao` — e-mail sem "@": campo com borda em erro e mensagem abaixo "Informe um e-mail válido" em 12 px na cor de erro, com ícone de alerta de 14 px.
6. `03f_Login_Erro-credencial` — faixa de aviso acima do formulário (altura 44, fundo `#2A1A1C`, borda esquerda de 3 px em erro) com o texto "E-mail ou senha incorretos. Verifique e tente novamente."
7. `03g_Login_Carregando` — botão primário com spinner de 18 px e o texto "Entrando...", campos desabilitados com opacidade 60%.
8. `03h_Login_Offline` — faixa no topo (altura 32, fundo `#1E222B`) com ícone de nuvem cortada e o texto "Sem conexão. É necessário estar online para entrar."
9. `03i_Login_Bloqueado` — após 5 tentativas: mensagem "Muitas tentativas. Tente novamente em 02:00" com contagem regressiva e botão desabilitado.
10. `03j_Login_Biometria` — sobreposição escura com opacidade 60% e o diálogo nativo do Android simulado: ícone de digital de 48 px, título "Confirme sua identidade", texto "Use sua digital para entrar no Ordena", botões "Cancelar" e "Usar senha".

## 1.3 Demais telas do fluxo de acesso
- `01_Splash` — marca centralizada, indicador de progresso linear de 2 px na base, sem animação chamativa.
- `02_Onboarding` — 3 frames (`02a`, `02b`, `02c`): ilustração geométrica em linha (sem mascote), título de 22 px, uma frase de apoio, indicador de 3 pontos, "Pular" no topo direito e botão "Avançar" / "Começar".
- `04_Criar-conta` — Nome completo, E-mail, Senha, Confirmar senha; medidor de força da senha em 4 segmentos (fraca, média, boa, forte) usando erro → atenção → sucesso; checkbox "Li e aceito os Termos de Uso e a Política de Privacidade" com os dois links em cor de marca; botão "Criar conta"; rodapé "Já tem conta? Entrar". Variantes: padrão, senha fraca, e-mail já cadastrado.
- `05_Esqueci-senha` — ícone de cadeado de 40 px, título "Recuperar senha", texto explicativo, campo de e-mail, botão "Enviar link de recuperação", link "Voltar para o login".
- `06_Codigo-verificacao` — título "Verifique seu e-mail", texto "Enviamos um código para lucas@email.com", 6 caixas de dígito de 48 × 56 px, "Reenviar código em 00:45" desabilitado durante a contagem. Variantes: vazio, preenchido, código incorreto.
- `07_Nova-senha` — dois campos e a lista de regras com ícone de check que muda de texto terciário para sucesso conforme cada regra é atendida: "Mínimo de 8 caracteres", "Uma letra maiúscula", "Um número", "Um caractere especial". Botão "Redefinir senha".
- `08_Senha-alterada` — confirmação: ícone de check em círculo de 56 px na cor de sucesso (traço, não preenchido), título "Senha redefinida", botão "Ir para o login".

## 1.4 Acessibilidade e microcopy
- Contraste mínimo de 4,5:1 para texto e 3:1 para bordas de campo.
- Área de toque mínima de 48 × 48 px em todos os ícones clicáveis.
- Toda mensagem de erro é específica e sem culpa: "Informe um e-mail válido" e não "Erro no campo".
- Ordem de foco do teclado: E-mail → Senha → Esqueci minha senha → Entrar.
- Duplicar todas as telas do grupo no **tema claro** em uma seção paralela.

---

# PARTE 2 — INTEGRAÇÃO DE TODAS AS TELAS (PROTÓTIPO NAVEGÁVEL)

Ligue **todas** as telas do arquivo em um protótipo funcional. Configure na aba Prototype, com dispositivo Android e tema escuro.

## 2.1 Regras gerais de transição
| Tipo de navegação | Ação | Animação | Duração |
|---|---|---|---|
| Avançar na pilha | Navigate to | Move in, da direita | 220 ms, Ease out |
| Voltar | Back | Move out, para a direita | 200 ms, Ease out |
| Trocar aba da barra inferior | Navigate to | Instant | — |
| Abrir bottom sheet | Open overlay, alinhado embaixo | Move in, de baixo | 250 ms, Ease out |
| Abrir modal centralizado | Open overlay, centralizado, com fundo escurecido 60% e "Close when clicking outside" | Dissolve | 180 ms |
| Trocar estado na mesma tela (foco, erro, carregando) | Change to | Smart Animate | 150 ms |
| Concluir fluxo e reiniciar pilha | Navigate to | Dissolve | 200 ms |

Nenhuma transição de Push, Slide vertical exagerado ou bounce.

## 2.2 Fluxos nomeados (Flow starting points)
Crie estes pontos de partida, nesta ordem, para o professor navegar direto ao que interessa:
1. `Fluxo 1 — Acesso e autenticação` (inicia em `01_Splash`)
2. `Fluxo 2 — Criar e priorizar tarefas` (inicia em `09_Home-Tarefas`)
3. `Fluxo 3 — Subtarefas e dependências` (inicia em `13_Detalhe-Tarefa`)
4. `Fluxo 4 — Projetos e organização` (inicia em `17_Projetos-Lista`)
5. `Fluxo 5 — Integrações e alertas` (inicia em `22_Integracoes`)
6. `Fluxo 6 — Colaboração em equipe` (inicia em `27_Atribuicao-Tarefa`)
7. `Fluxo 7 — Análises e gestão` (inicia em `30_Analises`)
8. `Fluxo 8 — Estados de sistema` (inicia em `44_Estados-Sistema`)

## 2.3 Mapa de ligações — Acesso
| Origem | Gatilho | Destino | Ação |
|---|---|---|---|
| `01_Splash` | After delay 1500 ms | `02a_Onboarding` | Dissolve |
| `02a` → `02b` → `02c` | Arrastar para a esquerda ou "Avançar" | próximo | Move in |
| `02c` | "Começar" | `03a_Login_Padrao` | Dissolve |
| Qualquer `02x` | "Pular" | `03a_Login_Padrao` | Dissolve |
| `03a` | Toque no campo de e-mail | `03b_Login_Foco` | Smart Animate |
| `03b` | Digitar | `03c_Login_Preenchido` | Smart Animate |
| `03c` | Ícone de olho | `03d_Login_Senha-visivel` | Smart Animate |
| `03c` | "Entrar" | `03g_Login_Carregando` | Smart Animate |
| `03g` | After delay 1200 ms | `09_Home-Tarefas` | Dissolve |
| `03c` | "Entrar" (caminho de erro, use um botão alternativo invisível) | `03f_Login_Erro-credencial` | Smart Animate |
| `03a` | "Esqueci minha senha" | `05_Esqueci-senha` | Move in |
| `05` | "Enviar link" | `06_Codigo-verificacao` | Move in |
| `06` | Código completo | `07_Nova-senha` | Move in |
| `07` | "Redefinir senha" | `08_Senha-alterada` | Move in |
| `08` | "Ir para o login" | `03a_Login_Padrao` | Dissolve |
| `03a` | "Criar conta" | `04_Criar-conta` | Move in |
| `04` | "Criar conta" | `09_Home-Tarefas` | Dissolve |
| `03a` | "Entrar com biometria" | `03j_Login_Biometria` | Open overlay |
| `03j` | "Cancelar" | `03a` | Close overlay |
| `03j` | Toque no ícone de digital | `09_Home-Tarefas` | Dissolve |
| Toda tela do grupo | Seta de voltar / "Voltar para o login" | tela anterior | Back |

## 2.4 Mapa de ligações — Barra de navegação inferior
Transforme a barra inferior em **componente com variants** (`Tarefas`, `Projetos`, `Agenda`, `Analises`, `Perfil`) e ligue cada item, a partir de qualquer tela que a contenha, para:
`09_Home-Tarefas` · `17_Projetos-Lista` · `21_Agenda` · `30_Analises` · `43_Perfil`. Ação **Navigate to**, animação **Instant**, mantendo a posição de rolagem.

## 2.5 Mapa de ligações — Núcleo de tarefas
| Origem | Gatilho | Destino | Ação |
|---|---|---|---|
| `09_Home-Tarefas` | Botão flutuante "+" | `12_Nova-Tarefa` | Open overlay (bottom sheet) |
| `12_Nova-Tarefa` | "Criar Tarefa" | `09_Home-Tarefas` | Close overlay + Toast "Tarefa criada" |
| `12_Nova-Tarefa` | "Cancelar" ou arrastar para baixo | fecha | Close overlay |
| `09` | Toque em um cartão de tarefa | `13_Detalhe-Tarefa` | Move in |
| `09` | Ícone de filtro | `11_Busca-Filtros` | Open overlay |
| `11` | "Aplicar" | `09_Home-Filtrada` | Close overlay |
| `09` | Campo de busca | `29_Busca-Semantica` | Move in |
| `09` | Aba de quadrante | mesma tela, variante filtrada | Smart Animate |
| `09` | Puxar para baixo | `10_Home-Sincronizando` → `09` | Smart Animate |
| `13_Detalhe-Tarefa` | Rolar até Subtarefas | mesma tela (scroll interno) | — |
| `13` | Ícone de editar | `12_Nova-Tarefa` (modo edição) | Open overlay |
| `13` | Ícone de duplicar | `15_Duplicar-Tarefa` | Open overlay (modal) |
| `13` | Ícone de excluir | `Modal-Confirmar-Exclusao` | Open overlay |
| `13` | Seção Dependências | `14_Tarefa-Bloqueada` | Move in |
| `13` | Anexar arquivo | `Sheet-Anexos` (câmera, galeria, arquivo, áudio) | Open overlay |
| `13` | Botão de gravar áudio | `Sheet-Gravacao-Audio` | Open overlay |
| `13` | Iniciar cronômetro | mesma tela, variante "cronômetro ativo" | Smart Animate |
| `13` | Ícone de chamada | `36_Chamada-WebRTC` | Move in |
| `13` | Editar com conflito | `35_Conflito-Edicao` | Open overlay |
| `16_Anotacoes` | "Converter em tarefa" | `12_Nova-Tarefa` pré-preenchida | Open overlay |

## 2.6 Mapa de ligações — Organização, integrações e equipe
| Origem | Gatilho | Destino |
|---|---|---|
| `17_Projetos-Lista` | Cartão de projeto | `18_Projeto-Detalhe` |
| `18` | Aba "Status" | `19_Status-Personalizados` |
| `18` | Aba "Membros" | `42_Administracao` |
| `18` | Ícone de Gantt | `32_Gantt` |
| `18` | Ícone de projeção | `33_Projecoes` |
| `21_Agenda` | Selo "Google Calendar" | `22_Integracoes` |
| `22` | Cartão Google Calendar | `Modal-OAuth-Google` |
| `22` | Cartão Gmail/Outlook | `26_Tarefas-Recorrentes` / `Regras-Email` |
| `22` | Cartão Drive/Dropbox | `39_Backup-Exportacao` |
| `13_Detalhe-Tarefa` | "Lembrete por local" | `23_Geofencing` |
| `24_Alertas-Prazo` | Ajustar nível | mesma tela, Smart Animate |
| `25_Notificacoes` | Item da lista | `13_Detalhe-Tarefa` |
| `27_Atribuicao` | "Atribuir" | `Modal-Conflito-Agenda` |
| `Modal-Conflito-Agenda` | "Atribuir mesmo assim" | `27_Atribuicao-Enviada` |
| `27_Atribuicao-Recebida` | Aceitar / Recusar / Ajustar | estados correspondentes |
| `28_Auditoria` | Aba "Arquivadas" | mesma tela, variante |
| `29_Busca-Semantica` | Resultado | `13_Detalhe-Tarefa` |

## 2.7 Mapa de ligações — Análises e gestão
| Origem | Gatilho | Destino |
|---|---|---|
| `30_Analises` | Seletor de período | mesma tela, Smart Animate |
| `30` | "Comparar períodos" | `31_Relatorio-Comparativo` |
| `31` | "Exportar PDF" | `39_Backup-Exportacao` |
| `32_Gantt` | Arrastar uma barra | `32b_Gantt-Recalculo` (Smart Animate) |
| `32b` | "Confirmar" | `32_Gantt` atualizado |
| `33_Projecoes` | "Ver capacidade" | `34_Painel-Capacidade` |
| `34` | "Sugerir delegação" | `Modal-Delegacao` |
| `35_Conflito-Edicao` | "Ver diferenças" | `35b_Diferencas` |
| `36_Chamada-WebRTC` | Encerrar | tela anterior |
| `37_Bem-estar` | "Ver ranking" | `37b_Ranking-Anonimo` |
| `38_Revisao` | "Enviar feedback" | `13_Detalhe-Tarefa` + Toast |
| `40_Automacoes` | "Nova regra" | `40b_Editor-Regra` |
| `40b` | "Testar regra" | `Modal-Execucao-Seca` |
| `41_Fechamento-Diario` | "Confirmar plano" | `09_Home-Tarefas` |
| `43_Perfil` | "Sair da conta" | `Modal-Confirmar-Saida` → `03a_Login_Padrao` |

## 2.8 Estados de sistema (sobreposições globais)
Crie como **overlays reutilizáveis** acionáveis de qualquer tela:
- `Overlay_Offline` — faixa no topo "Sem conexão · 3 alterações na fila".
- `Overlay_Sincronizando` — faixa "Sincronizando...".
- `Overlay_Erro-Servidor` — modal com "Não foi possível conectar" e botão "Tentar novamente".
- `Overlay_Sessao-Expirada` — modal "Sua sessão expirou" com botão único "Entrar novamente" → `03a_Login_Padrao`.
- `Toast` — componente com variants sucesso, erro e informação, entrada por Dissolve de 150 ms e saída automática após 2 s.

## 2.9 Componentes interativos (para o protótipo parecer real)
Configure como **interactive components** (a interação vive no componente e vale em todas as telas):
- Checkbox e switch: On click → alterna variante, Smart Animate 120 ms.
- Item de subtarefa: On click no círculo → variante concluída (título riscado) e a barra de progresso avança.
- Campo de texto: On click → variante focada.
- Abas e segmented control: On click → variante ativa com o indicador deslizando (Smart Animate).
- Cartão de tarefa: While hovering/pressing → variante pressionada com leve escurecimento.
- Barra de navegação inferior: cada item alterna o estado ativo.

## 2.10 Frame `Mapa-de-Navegacao`
Crie um frame de 3000 × 2000 px, paisagem, com o **diagrama completo de navegação**: cada tela representada por uma miniatura de 160 px de largura com o nome abaixo, conectadas por setas ortogonais. Agrupe por cor de borda conforme o módulo (Acesso, Tarefas, Organização, Integrações, Equipe, Análises, Sistema) e inclua uma legenda. Este frame entra na página de prints como visão geral do projeto.

## 2.11 Verificação final
- [ ] Toda tela tem pelo menos uma entrada e uma saída (nenhuma tela órfã).
- [ ] Existe caminho de volta em todas as telas empilhadas.
- [ ] Os 8 fluxos nomeados iniciam corretamente.
- [ ] Nenhum ponto de conexão aponta para frame inexistente.
- [ ] Login percorre: padrão → foco → preenchido → carregando → Home, e também o caminho de erro.
- [ ] A barra inferior funciona a partir de qualquer uma das 5 telas raiz.
- [ ] Os overlays de estado de sistema fecham corretamente e devolvem à tela de origem.

=== FIM DO PROMPT ===
