export type CampaignClip = {
  id: "vitrine" | "atendimento" | "modelos" | "tecnologia" | "entrega";
  title: string;
  description: string;
  video: string;
  poster: string;
};

const campaign = (id: CampaignClip["id"], title: string, description: string): CampaignClip => ({
  id,
  title,
  description,
  video: `/api/videos/campanhas/${id}`,
  poster: `/videos/posters/campanha-${id}.webp`,
});

export const campaignHero = campaign(
  "atendimento",
  "A Moto Sena por dentro",
  "Conheça a loja, os modelos e quem está pronto para te atender."
);

export const campaignReel: CampaignClip[] = [
  campaign("vitrine", "Modelos para a sua rotina", "Escolha a elétrica que combina com você."),
  campaign("modelos", "Variedade na loja", "Veja diferentes estilos de motos elétricas."),
  campaign("tecnologia", "Detalhes que fazem diferença", "Tecnologia, conforto e praticidade no dia a dia."),
  campaign("entrega", "Sua próxima moto está aqui", "Visite a Moto Sena no Shopping Nova Iguaçu."),
];
