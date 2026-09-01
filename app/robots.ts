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
          "/$", // Page d'accueil uniquement
          "/conditions-et-termes",
          "/a-propos",
          "/documentation",
        ],
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
          "/nos-produits", // Bloque la page nos-produits
          "/*/*/catalogues/*", // Bloque les pages produits dynamiques
        ],
      },
    ],
    sitemap: "https://www.otekis.com/sitemap.xml",
  };
}
