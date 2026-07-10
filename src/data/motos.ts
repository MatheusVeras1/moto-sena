export type Moto = {
  id: string;
  name: string;
  shortName: string;
  price: string;
  numericPrice?: number;
  tagline: string;
  description: string;
  video: string;
  heroVideo?: string;
  poster: string;
  /** Preço original riscado quando há promoção ativa (definido pelo gestor). */
  basePrice?: string;
  specs: string[];
  highlights: string[];
  caution?: string;
};

export const motos: Moto[] = [
  {
    id: "mini-bob-500w",
    name: "Mini Bob 500W",
    shortName: "Mini Bob",
    price: "Sob consulta",
    tagline: "Compacta, prática e forte para cidade.",
    description:
      "Modelo urbano para quem quer agilidade, facilidade de manobra e bom desempenho em trajetos curtos.",
    video: "/api/videos/motos/mini-bob-500w",
    heroVideo: "/api/videos/hero-modelos/mini-bob-500w",
    poster: "/videos/posters/mini-bob-500w.webp",
    specs: ["Motor 500W", "Compacta", "Boa em subidas"],
    highlights: ["Fácil de manobrar", "Forte para a categoria", "Ideal para uso rápido"],
  },
  {
    id: "bob-max-1000w",
    name: "Bob Max 1000W",
    shortName: "Bob Max",
    price: "Sob consulta",
    tagline: "Conforto e potência para rotina e trabalho.",
    description:
      "Scooter elétrica versátil para uso diário, trabalho e delivery, com foco em conforto prolongado.",
    video: "/api/videos/motos/bob-max-1000w",
    heroVideo: "/api/videos/hero-modelos/bob-max-1000w",
    poster: "/videos/posters/bob-max-1000w.webp",
    specs: ["Motor 1000W", "Alta autonomia", "Uso diário"],
    highlights: ["Conforto prolongado", "Boa para delivery", "Pode vir com baú"],
  },
  {
    id: "x11-1000w",
    name: "X11 1000W",
    shortName: "X11",
    price: "Sob consulta",
    tagline: "Econômica, completa e pronta para o dia a dia.",
    description:
      "Scooter elétrica com Bluetooth, painel digital e ré, pensada para quem quer economia sem perder conforto.",
    video: "/api/videos/motos/x11-1000w",
    heroVideo: "/api/videos/hero-modelos/x11-1000w",
    poster: "/videos/posters/x11-1000w.webp",
    specs: ["Até 45 km", "Até 32 km/h", "Ré"],
    highlights: ["Bluetooth", "Painel digital", "Conforto diário"],
  },
  {
    id: "one-max-1000w",
    name: "One Max 1000W",
    shortName: "One Max",
    price: "Sob consulta",
    tagline: "Força para subida e uso urbano mais pesado.",
    description:
      "Modelo robusto para quem busca estabilidade, resistência e potência real para trajetos mais exigentes.",
    video: "/api/videos/motos/one-max-1000w",
    heroVideo: "/api/videos/hero-modelos/one-max-1000w",
    poster: "/videos/posters/one-max-1000w.webp",
    specs: ["Motor 1000W", "Estável", "Uso pesado"],
    highlights: ["Ideal para subida", "Conforto em distância", "Estrutura resistente"],
  },
  {
    id: "ttx-1000w",
    name: "TTX 1000W",
    shortName: "TTX",
    price: "Sob consulta",
    tagline: "Design esportivo com eficiência urbana.",
    description:
      "Visual moderno, painel digital e condução leve para quem quer uma scooter com mais presença.",
    video: "/api/videos/motos/ttx-1000w",
    heroVideo: "/api/videos/hero-modelos/ttx-1000w",
    poster: "/videos/posters/ttx-1000w.webp",
    specs: ["Até 32 km/h", "Painel digital", "Design esportivo"],
    highlights: ["Visual moderno", "Condução leve", "Estilo e eficiência"],
  },
  {
    id: "x13-1000w",
    name: "X13 1000W",
    shortName: "X13",
    price: "Sob consulta",
    tagline: "Tecnologia, conforto e pacote completo.",
    description:
      "Scooter elétrica com bateria 60V 20Ah, NFC, Bluetooth, ré, alarme e freios a disco.",
    video: "/api/videos/motos/x13-1000w",
    heroVideo: "/api/videos/hero-modelos/x13-1000w",
    poster: "/videos/posters/x13-1000w.webp",
    specs: ["60V 20Ah", "Até 50 km", "Até 180 kg"],
    highlights: ["NFC e Bluetooth", "Ré + alarme", "Freio a disco"],
    caution: "Consulte as condições do modelo e enquadramento antes de publicar promessas legais.",
  },
  {
    id: "yep-1000w",
    name: "YEP 1000W",
    shortName: "YEP",
    price: "Sob consulta",
    tagline: "Alta autonomia para quem roda muito.",
    description:
      "Scooter elétrica com foco em autonomia, conforto e tecnologia para longas distâncias urbanas.",
    video: "/api/videos/motos/yep-1000w",
    heroVideo: "/api/videos/hero-modelos/yep-1000w",
    poster: "/videos/posters/yep-1000w.webp",
    specs: ["Motor 1000W", "Até 120 km", "Bluetooth"],
    highlights: ["Banco confortável", "Longas distâncias", "Uso intenso no dia"],
    caution: "Velocidade e enquadramento devem ser confirmados antes de comunicação final.",
  },
  {
    id: "v9-max-1000w",
    name: "V9 Max 1000W",
    shortName: "V9 Max",
    price: "Sob consulta",
    tagline: "Potência, conforto e presença urbana.",
    description:
      "Modelo forte e moderno para trajetos diários, com condução confortável e visual de destaque.",
    video: "/api/videos/motos/v9-max-1000w",
    heroVideo: "/api/videos/hero-modelos/v9-max-1000w",
    poster: "/videos/posters/v9-max-1000w.webp",
    specs: ["Motor 1000W", "Uso urbano", "Confortável"],
    highlights: ["Presença forte", "Boa estabilidade", "Rotina diária"],
    caution: "Preço, bateria e autonomia devem ser confirmados na unidade.",
  },
];

export const heroVideo = "/api/videos/hero/hero-urban-stickman";
export const heroPoster = "/videos/posters/hero-urban-stickman.webp";
