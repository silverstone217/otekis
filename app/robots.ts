import { MetadataRoute } from "next";

// export default function robots(): MetadataRoute.Robots {
//   return {
//     rules: [
//       {
//         userAgent: "*",
//         allow: "/",
//         disallow: [
//           "/admins/",
//           "/dashboard/",
//           "/account/",
//           "/api/",
//           "/settings/",
//           "/auth/",
//           "/connexion",
//           "/commandes/*",
//           "/finances/*",
//           "/livraisons/*",
//           "/produits/*",
//           "/utilisateurs/*",
//           "/historiques/*",
//         ],
//       },
//     ],
//     sitemap: "https://www.otekis.com/sitemap.xml",
//   };
// }

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
          "/_next/", // Empêche le préchargement dynamique des chunks JS/Data
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
          "mes-contacts/",
          "mes-produits/",
          "preferences/",
          "/actions/",
          "/historiques/",
          "/nos-produits",
          "/*/catalogues/", // Simplifié pour bloquer n'importe quel segment dynamique de catalogue
        ],
      },
    ],
    sitemap: "https://www.otekis.com/sitemap.xml",
  };
}
