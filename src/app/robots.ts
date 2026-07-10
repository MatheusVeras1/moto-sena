import type { MetadataRoute } from "next";
import { loja } from "@/config/loja";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/gestor", "/api/"],
    },
    sitemap: `${loja.siteUrl}/sitemap.xml`,
  };
}
