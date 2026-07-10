# Moto Sena — Instruções do Projeto

## Comandos

Use npm: `npm run dev`, `npm run lint` e `npm run build`.

## Regras

- Leia `AGENT_HANDOFF.md` antes de editar e atualize-o após cada mudança.
- Dados públicos da Moto Sena começam em `src/config/loja.ts`; use `loja.logoPath` em vez de caminhos de logo fixos.
- Preços, especificações, fotos e vídeos só são publicados após confirmação da Moto Sena. Até lá, preços são `Sob consulta` e a mídia demonstrativa deve estar identificada como tal.
- MP4 ficam em `private/videos/`; posters em `public/videos/posters/`; streaming continua em `/api/videos/[group]/[id]` com Range support.
- Gestor real usa Supabase; `/gestor/demo` é apenas apresentação local. APIs administrativas devem retornar `401` sem autenticação.
- Links de WhatsApp preservam a atribuição criada por `src/lib/whatsapp.ts`.

## Git

O remoto deste projeto é exclusivamente `MatheusVeras1/moto-sena`. Commits de IA incluem `Co-Authored-By`.
