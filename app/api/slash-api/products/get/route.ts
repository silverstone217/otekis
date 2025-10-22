import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyPreference } from "@/actions/companyAction";
import {
  applyPromotionOnProfit,
  calculateDiscountPercentage,
} from "@/utils/functions";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Ces préférences sont lues mais non utilisées (gardées pour l’algorithme futur)
    const categories = searchParams.get("categories")?.split(",") || [];
    const gender = searchParams.get("gender") || "O";
    const showAds = searchParams.get("showAds") === "true";

    console.log("🔹 Preferences reçues (non utilisées pour filtrage) :", {
      categories,
      gender,
      showAds,
    });

    // --- Préférences de la compagnie (devise et taux) ---
    const companyPrefs = await getCompanyPreference();
    if (!companyPrefs) {
      return NextResponse.json(
        { CONTENTS: [], message: "Aucune préférence entreprise trouvée." },
        { status: 200 }
      );
    }

    const currency = companyPrefs.currency || "USD";
    const exchangeRate =
      currency === "USD" ? 1 : Number(companyPrefs.exchangeRate) || 1;

    // --- Récupérer les produits liés aux shops ---
    const productShops = await prisma.productShop.findMany({
      include: {
        Product: true,
        shop: true,
      },
      take: 100, // limite pour éviter de renvoyer trop de données
    });

    // --- Transformer les données ---
    const contents = await Promise.all(
      productShops.map(async (ps) => {
        const product = ps.Product;
        const shop = ps.shop;

        // Si produit ou boutique manquants → ignorer
        if (!product || !shop) return null;

        const discountPercentage = ps.promotion ?? 0;

        const benefit = ps?.percentage
          ? Math.round((ps.percentage * product.price) / 100)
          : 0;
        const beneficeAfterDiscount = applyPromotionOnProfit(
          benefit,
          discountPercentage
        );

        const totalPriceAfterDiscount = product.price + beneficeAfterDiscount;

        // URL SHOP PRODUCT
        const shopUrl = `https://www.otekis.com/${shop.slug}/catalogues/${product.id}`;

        // Construction du format ContentType attendu
        return {
          product: {
            id: ps.id,
            title: product.name ?? "Produit sans nom",
            description: product.description ?? "",
            images: [product.image, ...(product.images || [])].filter(Boolean),
            category: product.category ?? "autres",
            type: product.type ?? "standard",
            price: Number(
              (
                (discountPercentage && discountPercentage > 0
                  ? totalPriceAfterDiscount
                  : ps.price) * exchangeRate
              ).toFixed(2)
            ),
            stock: product.stock ?? 0,
            brand: product.brand ?? "",
            discountPercentage:
              discountPercentage && discountPercentage > 0
                ? discountPercentage
                : undefined,
            currency,
            target:
              (product.target?.toLowerCase() as
                | "man"
                | "woman"
                | "kids"
                | "unisex") ?? "unisex",
          },
          shop: {
            id: shop.id,
            name: shop.name,
            description: shop.description ?? "",
            logo: shop.logo ?? "",
          },
          url: shopUrl,
        };
      })
    );

    // Supprime les éventuels nulls
    const validContents = contents.filter(Boolean);

    console.log(`✅ ${validContents.length} produits préparés.`);

    return NextResponse.json(
      { CONTENTS: validContents, message: "Donnees recuperees avec succes" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erreur GET /products/get :", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
