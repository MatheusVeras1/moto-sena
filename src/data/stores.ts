export type StoreUnit = {
  id: string;
  name: string;
  address: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
};

function mapsEmbed(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
}

export const stores: StoreUnit[] = [
  {
    id: "shopping-nova-iguacu",
    name: "Moto Sena - Shopping Nova Iguaçu",
    address: "Av. Abílio Augusto Távora, 1111 - Luz, Nova Iguaçu - RJ, 26260-045",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Moto%20Sena%20Shopping%20Nova%20Igua%C3%A7u%20Av.%20Ab%C3%ADlio%20Augusto%20T%C3%A1vora%201111",
    mapsEmbedUrl: mapsEmbed(
      "Moto Sena, Shopping Nova Iguaçu, Av. Abílio Augusto Távora, 1111 - Luz, Nova Iguaçu - RJ"
    ),
  },
];
