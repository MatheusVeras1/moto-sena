# Agent Handoff

## Estado atual

- Repositório: `MatheusVeras1/moto-sena`, branch `main`.
- O gestor real e o demo usam novamente a paleta dourada original (`#d6a84a` e `#f0c86a`) em navegação, gráficos, seleções, focos e ações. Os tokens são exclusivos do painel; o site público continua com a identidade laranja da Moto Sena, e estados semânticos permanecem verdes ou vermelhos.
- A Visão geral do gestor agora é orientada a vendas: abre com a fila atual de atendimento, KPIs de visitantes únicos/WhatsApp/pedidos/conversão, filtros de 7/30/90 dias ou mês, séries diárias, funil por sessão e desempenho por modelo. A evolução usa três gráficos de área independentes e interativos (visitantes em dourado, WhatsApp em verde e pedidos em ciano), com total, média e pico. Gestor real e demo compartilham a mesma apresentação; Público e aquisição fica sempre visível com origem, cidades, horários e calculadora.
- A aba Motos real e demo agora compartilha o mesmo editor em cards inspirado no painel da Matriz: busca, filtros, contador de pendências, badges, restauração, salvamento individual e em lote. O real mantém a API/Supabase; o demo salva apenas no estado em memória da sessão e nunca chama `/api/admin/motos`.
- Logo: Três variações suportadas (Escudo, Metálica de apresentação e JPG padrão), rotacionáveis por um botão dedicado no menu de navegação e persistidas na sessão do navegador.
- Metadados e preview social usam exclusivamente a logo padrão.
- Catálogo de modelos permanece como está até a confirmação oficial dos produtos.
- A seção "Como comprar" usa uma timeline interativa (01 a 04) centralizada, que avança dinamicamente a cada 3 segundos em ciclo ininterrupto, reiniciando o temporizador adequadamente após seleções manuais. O design do site utiliza a paleta original laranja da marca, com exceção da calculadora de economia, que usa tons de Verde Esmeralda e Azul Ciano para representar a economia financeira e sustentabilidade.
- A seção de lojas físicas (Stores) suporta duas unidades (Shopping Nova Iguaçu e Shopping Grande Rio) chaveadas por abas interativas integradas com mapa interativo filtrado em tema dark.
- O menu superior (CardNav) exibe ícones Lucide (Zap, WalletCards, MapPin) sem emojis nos cards principais do menu de hambúrguer com micro-animações no hover, e inclui dois botões de ação na barra (WhatsApp em verde e Instagram com gradiente oficial), que ocultam o texto em telas mobile mostrando apenas os respectivos ícones side-by-side.

## Campanhas em vídeo

- Vídeos reais ficam em `private/videos/campanhas/` com IDs `vitrine`, `atendimento`, `modelos`, `tecnologia` e `entrega`.
- Posters correspondentes ficam em `public/videos/posters/campanha-*.webp`.
- A rota `/api/videos/campanhas/[id]` mantém Range e bloqueia abertura como documento.
- Hero usa `atendimento` em autoplay mudo; o botão explícito alterna entre ouvir e silenciar o áudio. O vídeo pausa ao sair da viewport e só retoma ao voltar.
- A seção `Veja a Moto Sena de perto` usa um accordion editorial: vídeo ativo amplo à esquerda, cards laterais compactos, texto/benefícios/CTAs à direita. Só o card ativo recebe vídeo; hover, foco, toque e término avançam com expansão e fade.

## Pedido qualificado

- O modal permite trocar o modelo sem apagar pagamento, entrega ou dados de contato.
- Nome, WhatsApp (10 a 15 dígitos após normalização) e cidade são obrigatórios antes de abrir o WhatsApp.
- A API recebe o pedido antes do redirecionamento; sem Supabase ela responde normalmente, mas não persiste o lead.

## Validação

- Novo agregador comercial coberto por Vitest (`npm test`) para deduplicação por sessão, origem do clique no WhatsApp, fuso de Brasília, períodos vazios e delta de conversão. Filtros de 7/30/90 dias e mês, CTA para Pedidos, três gráficos com navegação por mouse/teclado, Público e aquisição sempre visível e layout sem overflow foram verificados em desktop e 390 px; `/api/admin/overview` continua retornando `401` sem autenticação.
- Editor compartilhado de Motos validado no navegador: busca por modelo, quatro filtros, estado vazio, detecção de alterações, Restaurar, Salvar, Salvar tudo, persistência durante a sessão demo e layout em duas/uma colunas. O demo não realizou chamadas à API administrativa, `/api/admin/motos` preservou `401` sem autenticação e não houve overflow em 390 px.
- Paleta do gestor validada em `/gestor/demo`, `/gestor/demo/motos`, `/gestor/demo/pedidos`, `/gestor/demo/site` e `/gestor/login`, em desktop e mobile: nenhuma ocorrência visual laranja no painel, botões dourados com texto escuro e site público ainda laranja. `npm run build` aprovado; `npm run lint` sem erros e com um aviso preexistente de `useRef` não utilizado em `HowToBuy.tsx`.
- CodeGraph v1.4.1 inicializado em `.codegraph/`: 69 arquivos indexados, 737 nós e 1.260 relações; usar `codegraph explore` antes de buscas textuais para compreender ou localizar código.
- `npm run lint` e `npm run build` aprovados.
- Home desktop/mobile aprovada; troca de logo, persistência em sessão e retorno ao padrão em sessão nova verificados.
- Mute/unmute do hero, accordion de campanhas com um único vídeo ativo e checkout com troca de modelo foram verificados no navegador, em desktop e mobile.
- API de pedidos rejeita dados vazios (`400`) e aceita dados válidos (`200`).
- Seção de lojas reestruturada com abas responsivas para as unidades Shopping Nova Iguaçu e Shopping Grande Rio. Os dois mapas do Google Maps (fundo branco original) são pré-carregados simultaneamente na montagem da página para transição instantânea (0ms) no clique, sem telas em branco.
- A unidade Shopping Grande Rio aponta diretamente para o perfil do próprio shopping no Google Maps, enquanto o Google Meu Negócio da Moto Sena nessa unidade ainda não existe; a busca genérica por "Moto Sena" foi removida para evitar localização incorreta.
- Ícones de endereço e horário em Lojas ampliados e engrossados (strokeWidth=2.5) e botão de WhatsApp integrado com o ícone oficial e a cor de marca laranja de alta conversão.
- Vídeo de campanha responde `206` com Range e `404` para request documental.

- Cards da vitrine agora usam layout flexível de altura total, mantendo os botões de ação alinhados na base de cada linha do grid. Lint, build e comportamento de detalhes/interesse foram validados em desktop e em duas colunas.
- O visor 360° do modelo selecionado não estica mais junto com a coluna de conteúdo; isso remove a faixa preta abaixo de X13, YEP e V9 Max. Lint e build aprovados; no X13, o painel e o vídeo diferem apenas pela borda de 2 px.
- Nova seção "Como comprar" validada com sucesso: comportamento responsivo (linha vertical em mobile, horizontal em desktop), progresso contínuo e automático a cada 3 segundos, reinício suave após clique manual, acessibilidade por teclado/botão, detecção de movimento reduzido (shouldReduceMotion) ativa, e linter/build aprovados sem falhas.
- Variação de cores premium aplicada exclusivamente na calculadora de economia (Verde Esmeralda e Ciano Elétrico) mantendo o design original em laranja para o resto do site. Lint e build validados com sucesso.
- Rotação tripla de logos e persistência de sessão ativas e integradas ao header e rodapé.
- Ícones animados do menu funcionando sem emojis no linter e compilados com sucesso.
- Estrutura de Lojas dinâmica sincronizada: todos os metadados das unidades (Shopping Nova Iguaçu e Shopping Grande Rio), incluindo descriptions, shortNames e openingHours, são agora carregados dinamicamente de `src/data/stores.ts` em vez de serem fixos no componente UI.
- Painel do Gestor agora conta com controle de estoque integrado (Entradas, Saídas e Ajustes de saldo com histórico de movimentações) no Supabase (migração `005_inventory_and_reports.sql`) e simulações completas no modo Demo.
- Geração de relatórios gerenciais em PDF (jsPDF) e Excel (exceljs) com a paleta dourada do Gestor, dados consolidados do período filtrado e sem expor informações pessoais de clientes.
- Tratamento de erros de falta de saldo (409 Conflict) ao alterar status de pedidos para "Vendido" no real e demo.

## Pendências

- Curar fotos recebidas e substituir mídia genérica de cada modelo quando o catálogo oficial for confirmado.
- Confirmar domínio e configurar Supabase para o gestor real.
