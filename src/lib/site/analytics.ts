"use client";

const SESSION_KEY = "mm-analytics-session";

function getSessionId() {
  if (typeof window === "undefined") return null;
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_KEY, next);
  return next;
}

export function trackSiteEvent(
  eventType: string,
  options: { motoId?: string | null; metadata?: Record<string, unknown> } = {}
) {
  if (typeof window === "undefined") return;

  // Em page_view registramos de onde o visitante veio, para o painel
  // conseguir montar "Origem das visitas" com dados reais.
  const origin =
    eventType === "page_view"
      ? {
          referrer: document.referrer || "",
          utmSource: new URLSearchParams(window.location.search).get("utm_source") ?? "",
        }
      : null;

  const body = JSON.stringify({
    eventType,
    motoId: options.motoId ?? null,
    sessionId: getSessionId(),
    metadata: {
      path: window.location.pathname,
      ...origin,
      ...options.metadata,
    },
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
    return;
  }

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
