import { loja } from "@/config/loja";

// Número e atribuição vêm da configuração central em src/config/loja.ts.
export const WHATSAPP_NUMBER = loja.whatsappNumero;
export const WHATSAPP_SITE_ATTRIBUTION = `Mensagem enviada pelo site da ${loja.nome}.`;

function withSiteAttribution(message: string) {
  const trimmedMessage = message.trim();

  if (trimmedMessage.includes(WHATSAPP_SITE_ATTRIBUTION)) {
    return trimmedMessage;
  }

  return `${trimmedMessage}\n\n${WHATSAPP_SITE_ATTRIBUTION}`;
}

export function whatsappHref(message: string) {
  const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(withSiteAttribution(message))}`;
}

export const whatsappInterestHref = whatsappHref(
  `Olá, quero conhecer as motos elétricas da ${loja.nome}.`
);
