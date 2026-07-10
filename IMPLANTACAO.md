# Implantação Moto Sena

## Antes de publicar

1. Confirmar domínio, catálogo, preços, especificações, estoque, retirada e entrega.
2. Substituir logo temporária, preview social, ícones, fotos e vídeos pelos materiais oficiais aprovados.
3. Para cada vídeo novo, incluir o MP4 em `private/videos/`, poster em `public/videos/posters/` e liberar seu ID na rota de streaming.
4. Criar projeto Supabase em `sa-east-1`, aplicar as migrations, criar o usuário gestor e registrar seu perfil admin.
5. Configurar Vercel com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SECRET_KEY`.

## Validação

- `npm run lint` e `npm run build` aprovados.
- Nenhuma referência a marca anterior, placeholder ou preço não aprovado.
- WhatsApp, mapas, SEO/Open Graph, vídeos e rotas administrativas verificados.
