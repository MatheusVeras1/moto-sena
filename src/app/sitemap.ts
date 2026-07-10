import type { MetadataRoute } from "next";
import { loja } from "@/config/loja";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: loja.siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
