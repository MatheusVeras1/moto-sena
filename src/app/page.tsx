import HomeClient from "@/components/home/HomeClient";
import { loja } from "@/config/loja";
import { stores } from "@/data/stores";
import { getPublicSiteState } from "@/lib/site/db";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

// Dados estruturados: ajudam o Google a exibir a loja como negócio local.
const localBusinessJsonLd = stores.map((store) => ({
  "@context": "https://schema.org",
  "@type": "MotorcycleDealer",
  name: `${loja.nome} — ${store.name}`,
  address: store.address,
  url: loja.siteUrl,
  telephone: `+${WHATSAPP_NUMBER}`,
  image: new URL(loja.ogImagePath, loja.siteUrl).toString(),
  hasMap: store.mapsUrl,
}));

export default async function Home() {
  const initialState = await getPublicSiteState();
  return (
    <>
      <script
        type="application/ld+json"
        // Conteúdo estático gerado por JSON.stringify — sem entrada de usuário.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <HomeClient initialState={initialState} />
    </>
  );
}
