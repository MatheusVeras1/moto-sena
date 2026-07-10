# Agent Handoff

## Estado atual

- Repositório: `MatheusVeras1/moto-sena`, branch `main`.
- Logo padrão: escudo Moto Sena em `public/brand/logo-moto-sena-escudo.png`.
- Logo de apresentação: variação metálica em `public/brand/logo-moto-sena-apresentacao.png`, alternável pelo menu e persistida só na sessão do navegador.
- Metadados e preview social usam exclusivamente a logo padrão.
- Catálogo de modelos permanece como está até a confirmação oficial dos produtos.
- A seção "Como comprar" usa uma timeline interativa (01 a 04) centralizada, que avança dinamicamente a cada 3 segundos em ciclo ininterrupto, reiniciando o temporizador adequadamente após seleções manuais.

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

- `npm run lint` e `npm run build` aprovados.
- Home desktop/mobile aprovada; troca de logo, persistência em sessão e retorno ao padrão em sessão nova verificados.
- Mute/unmute do hero, accordion de campanhas com um único vídeo ativo e checkout com troca de modelo foram verificados no navegador, em desktop e mobile.
- API de pedidos rejeita dados vazios (`400`) e aceita dados válidos (`200`).
- Seção de lojas deixa explícito que a Moto Sena fica dentro do Shopping Nova Iguaçu, no 1º piso; o mapa continua apontando para a chegada ao shopping.
- Vídeo de campanha responde `206` com Range e `404` para request documental.

- Cards da vitrine agora usam layout flexível de altura total, mantendo os botões de ação alinhados na base de cada linha do grid. Lint, build e comportamento de detalhes/interesse foram validados em desktop e em duas colunas.
- O visor 360° do modelo selecionado não estica mais junto com a coluna de conteúdo; isso remove a faixa preta abaixo de X13, YEP e V9 Max. Lint e build aprovados; no X13, o painel e o vídeo diferem apenas pela borda de 2 px.
- Nova seção "Como comprar" validada com sucesso: comportamento responsivo (linha vertical em mobile, horizontal em desktop), progresso contínuo e automático a cada 3 segundos, reinício suave após clique manual, e linter/build aprovados sem falhas.

## Pendências

- Curar fotos recebidas e substituir mídia genérica de cada modelo quando o catálogo oficial for confirmado.
- Confirmar domínio e configurar Supabase para o gestor real.
