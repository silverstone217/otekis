import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.otekis.com";

  const staticRoutes = [
    "",
    "/conditions-et-termes",
    "/a-propos",
    "/documentation",
  ];

  return staticRoutes.map((path) => ({
    url: `${base}${path}`,
  }));
}
