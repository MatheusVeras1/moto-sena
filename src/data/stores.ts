export type StoreUnit = {
  id: string;
  name: string;
  shortName: string;
  address: string;
  description: string;
  locationDetail: string;
  openingHours: Array<{
    label: string;
    value: string;
  }>;
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
    shortName: "Shopping Nova Iguaçu",
    address: "Av. Abílio Augusto Távora, 1111 - Luz, Nova Iguaçu - RJ, 26260-045",
    description:
      "Nossa flagship está estrategicamente localizada para oferecer o melhor atendimento e a melhor experiência de teste de motos elétricas da região.",
    locationDetail: "Dentro do Shopping Nova Iguaçu, no 1º piso.",
    openingHours: [
      { label: "Segunda a Sábado", value: "10h às 22h" },
      { label: "Domingo e Feriados", value: "13h às 21h" },
    ],
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Moto%20Sena%20Shopping%20Nova%20Igua%C3%A7u%20Av.%20Ab%C3%ADlio%20Augusto%20T%C3%A1vora%201111",
    mapsEmbedUrl: mapsEmbed(
      "Moto Sena, Shopping Nova Iguaçu, Av. Abílio Augusto Távora, 1111 - Luz, Nova Iguaçu - RJ"
    ),
  },
  {
    id: "shopping-grande-rio",
    name: "Moto Sena - Shopping Grande Rio",
    shortName: "Shopping Grande Rio",
    address: "Rod. Pres. Dutra, 4200 - Parque Barreto, São João de Meriti - RJ, 25586-140",
    description:
      "Nossa segunda flagship oferece um showroom completo e test-ride exclusivo para você experimentar o melhor da mobilidade elétrica.",
    locationDetail: "Dentro do Shopping Grande Rio, no 1º piso.",
    openingHours: [
      { label: "Segunda a Sábado", value: "10h às 22h" },
      { label: "Domingo e Feriados", value: "13h às 21h" },
    ],
    mapsUrl:
      "https://www.google.com/maps/place/Shopping+Grande+Rio/@-22.7984605,-43.3577054,16.75z/data=!4m10!1m2!2m1!1sMoto+Sena,+Shopping+Grande+Rio,+Rod.+Pres.+Dutra,+4200+-+Parque+Barreto,+S%C3%A3o+Jo%C3%A3o+de+Meriti+-+RJ!3m6!1s0x9964fa87dde653:0xbdff55c99950e557!8m2!3d-22.7977996!4d-43.3516055!15sCmJNb3RvIFNlbmEsIFNob3BwaW5nIEdyYW5kZSBSaW8sIFJvZC4gUHJlcy4gRHV0cmEsIDQyMDAgLSBQYXJxdWUgQmFycmV0bywgU8OjbyBKb8OjbyBkZSBNZXJpdGkgLSBSSlpaIlhtb3RvIHNlbmEgc2hvcHBpbmcgZ3JhbmRlIHJpbyByb2QgcHJlcyBkdXRyYSA0MjAwIHBhcnF1ZSBiYXJyZXRvIHPDo28gam_Do28gZGUgbWVyaXRpIHJqkgEPc2hvcHBpbmdfY2VudGVymgEkQ2hkRFNVaE5NRzluUzBWSlEwRm5TVU5zY25WRE1XbFJSUkFC4AEA-gEECAAQSQ!16s%2Fg%2F121vfgr8?hl=pt-BR&entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D",
    mapsEmbedUrl: mapsEmbed(
      "Shopping Grande Rio, Rod. Pres. Dutra, 4200 - Parque Barreto, São João de Meriti - RJ"
    ),
  },
];
