import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${appConfig.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
