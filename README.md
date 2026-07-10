# Moto Sena

Site em Next.js para a Moto Sena, loja de motos elétricas no Shopping Nova Iguaçu. Inclui vitrine, checkout por WhatsApp, simulador de economia e painel gestor com Supabase.

## Status

- Identidade visual Moto Sena aplicada com asset temporário laranja e branco.
- Catálogo, vídeos e posters atuais são demonstrativos e aguardam materiais oficiais.
- Preços públicos estão como `Sob consulta`.
- O painel real depende de Supabase; `/gestor/demo` funciona localmente sem banco.

## Comandos

```powershell
npm run dev
npm run lint
npm run build
```

## Fontes de dados

- `src/config/loja.ts`: identidade, SEO, contato e localização.
- `src/data/motos.ts`: catálogo fallback demonstrativo.
- `src/data/stores.ts`: unidade e mapa.
- `private/videos/`: vídeos privados servidos pela rota de streaming.
- `supabase/`: schema, RLS e seed inicial.

Antes da publicação, substituir os materiais demonstrativos por catálogo e mídia aprovados pela Moto Sena.
