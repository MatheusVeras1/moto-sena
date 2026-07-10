# Agent Handoff

## Estado atual

- Projeto convertido do template para Moto Sena, Shopping Nova Iguaçu.
- `origin` aponta para `https://github.com/MatheusVeras1/moto-sena.git`; o remoto ainda não possui histórico.
- Identidade visual usa a marca candidata em `public/brand/logo-moto-sena.jpg`; ela deve ser substituída quando chegar o kit oficial.
- Catálogo e mídia são demonstrativos. Não publicar especificações, fotos, vídeos ou preços sem aprovação da Moto Sena.
- Supabase não está configurado neste checkout; `/gestor/demo` funciona localmente.

## Alterações desta etapa

- Centralizada identidade em `src/config/loja.ts` e removidas referências visuais à marca anterior.
- Atualizados metadados, ícones, localização, WhatsApp, Instagram, painel demo e documentação.
- Catálogo fallback e seed usam `Sob consulta` para preços não confirmados.
- Paleta laranja derivada da marca candidata aplicada no site e gestor.

## Validação

- `npm run lint` e `npm run build` aprovados.
- Home e `/gestor/demo` retornam `200`; APIs administrativas retornam `401` sem autenticação; streaming responde `206` com Range.
- Home aprovada em inspeção visual desktop e mobile; título SEO confirma Moto Sena em Nova Iguaçu.
- Confirmar logo final, catálogo, mídia, dados operacionais, domínio e Supabase antes de produção.
