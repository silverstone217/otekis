import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admins/",
          "/dashboard/",
          "/account/",
          "/api/",
          "/settings/",
          "/auth/",
          "/connexion",
          "/commandes/*",
          "/finances/*",
          "/livraisons/*",
          "/produits/*",
          "/utilisateurs/*",
          "/historiques/*",
        ],
      },
    ],
    sitemap: "https://www.otekis.com/sitemap.xml",
  };
}
