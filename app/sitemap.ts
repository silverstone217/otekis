import { MetadataRoute } from "next";
// import { prisma } from "@/lib/prisma";

// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   const base = "https://www.otekis.com";

//   const staticRoutes = [
//     "",
//     "/conditions-et-termes",
//     "/a-propos",
//     "/nos-produits",
//     "/documentation",
//   ].map((path) => ({
//     url: `${base}${path}`,
//     lastModified: new Date(),
//   }));

//   const shops = await prisma.shop.findMany({
//     select: {
//       slug: true,
//       updatedAt: true,
//     },
//   });

//   const shopRoutes = shops.map((shop) => ({
//     url: `${base}/${shop.slug}`,
//     lastModified: shop.updatedAt,
//   }));

//   // Produits par boutique
//   const productsShops = await prisma.productShop.findMany({
//     include: {
//       shop: {
//         select: {
//           slug: true,
//         },
//       },
//       Product: true,
//     },
//   });

//   const mappedShops = productsShops.map((ps) => {
//     return {
//       shopSlug: ps.shop.slug,
//       productId: ps.Product.id,
//       productUpdatedAt: ps.Product.updatedAt,
//     };
//   });

//   const productRoutes = mappedShops.map((p) => ({
//     url: `${base}/${p.shopSlug}/catalogues/${p.productId}`,
//     lastModified: p.productUpdatedAt,
//   }));

//   return [...staticRoutes, ...shopRoutes, ...productRoutes];
// }

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.otekis.com";

  const staticRoutes = [
    "",
    "/conditions-et-termes",
    "/a-propos",
    "/documentation",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  return staticRoutes;
}
