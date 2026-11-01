import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/$", // Uniquement la page d'accueil exacte
          "/conditions-et-termes",
          "/a-propos",
          "/documentation",
        ],
        disallow: [
          "/api/", // Bloque toutes les routes API (crucial pour le CPU Neon)
          "/admins/",
          "/dashboard/",
          "/account/",
          "/settings/",
          "/auth/",
          "/connexion",
          "/commandes/", // Pas besoin de /* à la fin, le slash bloque tout le sous-dossier
          "/finances/",
          "/livraisons/",
          "/produits/",
          "/utilisateurs/",
          "/ma-boutique/",
          "/mes-contacts/",
          "/mes-produits/",
          "/preferences/",
          "/historiques/",
          "/nos-produits",
          "/*/catalogues/", // Simplifié pour bloquer n'importe quel segment dynamique de catalogue
        ],
      },
    ],
    sitemap: "https://www.otekis.com/sitemap.xml",
  };
}
