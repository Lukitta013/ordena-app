# PROMPT DE CORREÇÃO PARA O FIGMA — APLICATIVO ORDENA
> Cole tudo entre "=== INÍCIO ===" e "=== FIM ===" no Figma Make, sobre o projeto que já existe.

=== INÍCIO ===

Você vai **corrigir o protótipo do aplicativo Ordena que já existe neste projeto**. Não recomece do zero: mantenha as telas já desenhadas e aplique as seis correções abaixo. Idioma da interface: português do Brasil.

---

## CORREÇÃO 1 — Remover a barra de entregas do topo

Hoje existe, acima do aplicativo, uma barra de navegação com as abas **"Entrega 1 — AV1: 30%", "Entrega 2 — AV2: 20%" e "Entrega 3 — AV3: 50%"**, junto de um cabeçalho com o logotipo "Ordena", o nome "Lucas Inacio de Carvalho" e um botão de tema.

**Apague essa barra inteira e esse cabeçalho.** Eles são andaime de apresentação, não fazem parte do produto, e hoje empurram o aplicativo para baixo e competem com a interface real.

Nada dessa barra deve sobrar: nem as abas, nem o logotipo no topo, nem o nome do aluno, nem o botão de tema que fica ali.

---

## CORREÇÃO 2 — Fundir as três entregas em um único aplicativo

O problema de fundo é que o protótipo hoje trata AV1, AV2 e AV3 como **três aplicativos separados**. Elas são o mesmo produto entregue em fases. Corrija assim:

**Toda funcionalidade das três entregas passa a ser alcançada pela barra inferior**, que tem cinco destinos: **Tarefas · Projetos · Agenda · Análises · Ajustes**.

Redistribua as telas existentes exatamente nesta estrutura:

**Tarefas** (destino inicial)
- Lista principal com os quadrantes da matriz de Eisenhower
- Busca e bottom sheet de filtros multicritério
- Nova tarefa e edição de tarefa
- Detalhe da tarefa, com subtarefas aninhadas, dependências, comentários, anexos, gravação de áudio, cronômetro e checkpoints
- Ao final da tela, um bloco "Mais em tarefas" levando a: Anotações rápidas · Arquivadas e auditoria · Fechamento diário

**Projetos**
- Lista de projetos e detalhe do projeto (tarefas, membros, status personalizados)
- Bloco "Planejamento" levando a: Cronograma Gantt · Projeções do projeto · Capacidade da equipe · Administração e permissões

**Agenda**
- Calendário mensal com a lista do dia
- Bloco "Lembretes e rotinas" levando a: Tarefas recorrentes · Lembretes por local (geofencing) · Alertas de prazo · Integrações (Google Calendar, e-mail, backup)

**Análises**
- Indicadores do período, gráfico de barras de entregas e gráfico de linhas de tendência
- Bloco "Aprofundar" levando a: Relatório comparativo · Tempo e calibração de estimativas · Bem-estar e carga diária · Metas e revisões

**Ajustes**
- Cartão da conta do usuário
- Aparência (ver correção 4)
- Bloco "Aplicativo": Notificações · Sincronização e offline · Automações · Backup e exportação
- Bloco "Segurança e governança": Administração e permissões · Auditoria de acessos
- Botão "Sair da conta"

**Regra:** nenhuma tela pode ficar inalcançável a partir desses cinco destinos. Se sobrar alguma tela órfã do protótipo atual, encaixe-a no bloco onde ela faz sentido.

### Como manter a rastreabilidade das entregas sem separar o aplicativo
Em vez das abas no topo, coloque um **marcador discreto no cabeçalho de cada seção**: um texto pequeno em fonte monoespaçada, com borda fina de 1 px e cantos de 4 px, na cor do texto terciário, escrito por exemplo `US15` ou `US06 · US11 · US13`.

E em **Ajustes → Aparência**, crie um interruptor **"Marcadores de entrega"**, com a descrição "Mostra a User Story de origem de cada recurso", que liga e desliga todos esses marcadores de uma vez. Assim a rastreabilidade existe para a avaliação e some para a demonstração.

---

## CORREÇÃO 3 — Tela cheia, sem moldura de celular

Hoje o aplicativo aparece dentro de uma **moldura de iPhone**, com bordas arredondadas, notch desenhado e botões laterais, ocupando só o meio da tela.

**Remova a moldura.** O aplicativo deve ocupar **100% da largura e da altura da janela**, encostado nas bordas.

Remova também a barra de status falsa desenhada dentro da moldura (o `09:40`, o ícone de 5G, o wi-fi e a bateria) e a linha de indicador de gesto na base. Essas coisas pertencem ao sistema operacional, não ao protótipo.

Remova ainda a linha "Credenciais: lucas@email.com / senha123" que hoje fica solta embaixo da moldura. Se quiser manter a dica de acesso, ela vai **dentro da tela de login**, como um texto pequeno em fonte monoespaçada, centralizado abaixo do rodapé do formulário.

**Comportamento por largura de tela:**
- **Menos de 900 px:** aplicativo em coluna única, ocupando tudo, com a barra de navegação fixa na base.
- **900 px ou mais:** a barra inferior desaparece e vira um **trilho lateral esquerdo de 224 px**, com os mesmos cinco destinos em ícone e rótulo, mais um item "Notificações" com contador e um botão "Nova tarefa" ancorado na base do trilho. O conteúdo ocupa o restante. Quando uma tarefa está aberta, a área divide em duas colunas: lista à esquerda, detalhe da tarefa à direita.

Isso resolve o desperdício de espaço quando o protótipo é aberto no navegador do computador, que é como ele será apresentado.

---

## CORREÇÃO 4 — Tema claro e escuro dentro das configurações

Tire o botão de tema do cabeçalho que foi removido na correção 1. O controle de tema passa a morar em **Ajustes → Aparência**, como um seletor de três opções lado a lado, cada uma com ícone de traço:

- **Claro** (ícone de sol)
- **Escuro** (ícone de lua)
- **Sistema** (ícone de monitor) — opção padrão

Desenhe **todas as telas do projeto nos dois temas**. Defina as cores como variáveis do Figma (modo Claro e modo Escuro), nunca como cor fixa aplicada direto no elemento, para que trocar o modo troque o arquivo inteiro.

**Tema escuro:** fundo `#0E131C` · superfície `#151C27` · superfície elevada `#1C2533` · rebaixado `#111722` · borda `#273140` · texto primário `#E7ECF3` · secundário `#93A0B1` · terciário `#63707F` · acento `#4C77E8` · crítico `#E4706A` · atenção `#D5A03C` · sucesso `#4FAF83`.

**Tema claro:** fundo `#F2F5F9` · superfície `#FFFFFF` · rebaixado `#E9EEF4` · borda `#DEE5ED` · texto primário `#121821` · secundário `#566273` · terciário `#8492A3` · acento `#2A50C0` · crítico `#C0413C` · atenção `#A8751A` · sucesso `#2C7A5A`.

---

## CORREÇÃO 5 — Limpar a poluição visual que ainda restou

Reforce em todas as telas, inclusive nas que já foram redesenhadas:

- **Nenhum emoji** em título, aba, chip, cartão, botão ou cabeçalho de seção. Onde houver, substitua por ícone de traço monocromático de 20 px (estilo Lucide ou Feather) ou simplesmente remova.
- **Nenhum gradiente, brilho, neon ou sombra colorida.**
- **No máximo três cores de destaque por tela.**
- **No máximo um chip de projeto e um indicador de prioridade por cartão de tarefa.** A prioridade é uma barra vertical de 3 px na borda esquerda do cartão — não repita a palavra "Alta" ao lado dela.
- Os quadrantes da matriz **não** usam caixas coloridas com borda tracejada, como estão hoje na tela de onboarding. Cada quadrante é um cabeçalho de seção: uma barra de 3 px na cor semântica, o nome em 15 px semibold e o subtítulo explicativo em 12 px no texto terciário — "Fazer agora · Urgente e importante", "Agendar · Importante, não urgente", "Interrupções · Urgente, não importante", "Baixo impacto · Nem urgente, nem importante".
- **Tipografia:** Instrument Sans na interface; IBM Plex Mono em prazos, esforço, contadores e nos marcadores de User Story; e um único toque de Instrument Serif apenas no logotipo "Ordena".

---

## CORREÇÃO 6 — Ligar tudo no protótipo

Depois de reorganizar, refaça as ligações para que o protótipo funcione de ponta a ponta:

- Cada um dos cinco itens da barra inferior navega para o seu destino, com animação **Instant**, a partir de qualquer tela que contenha a barra.
- Cada linha dos blocos ("Mais em tarefas", "Planejamento", "Lembretes e rotinas", "Aprofundar", "Aplicativo", "Segurança e governança") abre a tela correspondente com **Move in pela direita, 220 ms**, e a tela aberta tem seta de voltar no canto superior esquerdo.
- **A barra inferior continua visível nessas telas secundárias.** Elas fazem parte do aplicativo, não são um fluxo à parte.
- Tocar em um cartão de tarefa abre o detalhe; em tela larga, o detalhe abre na coluna da direita em vez de cobrir a lista.
- O botão "+" do cabeçalho de Tarefas abre a nova tarefa como bottom sheet subindo de baixo, 250 ms.
- O fluxo de entrada é: Splash → Onboarding → **Login** → Tarefas. "Sair da conta", em Ajustes, volta para o Login.

---

## VERIFICAÇÃO ANTES DE ENTREGAR
- [ ] A barra de abas de entregas não existe mais em nenhuma tela.
- [ ] Nenhuma moldura de celular, barra de status falsa ou texto solto fora do aplicativo.
- [ ] O aplicativo ocupa a janela inteira; acima de 900 px existe o trilho lateral.
- [ ] Todas as funcionalidades das três entregas são alcançáveis pelos cinco destinos da barra inferior.
- [ ] Nenhuma tela órfã.
- [ ] O seletor de tema está em Ajustes e todas as telas existem nos modos claro e escuro.
- [ ] O interruptor "Marcadores de entrega" liga e desliga os marcadores de User Story.
- [ ] Nenhum emoji e nenhum gradiente em nenhuma tela.

=== FIM ===
