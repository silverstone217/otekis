import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyPreference } from "@/actions/companyAction";
import { applyPromotionOnProfit } from "@/utils/functions";

const TargetGenders = {
  unisex: ["o", "unisex", "neutral", "man", "woman"],
  man: ["m", "man"],
  woman: ["f", "woman"],
  kids: ["k", "kids"],
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 🔹 Préférences utilisateur reçues
    const categories = searchParams.get("categories")?.split(",") || [];
    const gender = searchParams.get("gender") || "O";
    const showAds = searchParams.get("showAds") === "true";

    const page = Number(searchParams.get("page") || "1");
    const take = 20;
    const skip = (page - 1) * take;

    console.log("🔹 Preferences reçues :", { categories, gender, showAds });

    // --- Préférences de la compagnie ---
    const companyPrefs = await getCompanyPreference();
    if (!companyPrefs) {
      return NextResponse.json(
        { CONTENTS: [], message: "Aucune préférence entreprise trouvée." },
        { status: 200 },
      );
    }

    const currency = companyPrefs.currency || "USD";
    const exchangeRate =
      currency === "USD" ? 1 : Number(companyPrefs.exchangeRate) || 1;

    // --- Récupérer les produits liés aux shops ---
    const productShops = await prisma.productShop.findMany({
      include: { Product: true, shop: true },
      take,
      skip,
      orderBy: { createdAt: "desc" },
    });

    // --- Transformer et scorer les données ---
    const contents = await Promise.all(
      productShops.map(async (ps) => {
        const product = ps.Product;
        const shop = ps.shop;
        if (!product || !shop) return null;

        const discountPercentage = ps.promotion ?? 0;
        const benefit = ps?.percentage
          ? Math.round((ps.percentage * product.price) / 100)
          : 0;
        const beneficeAfterDiscount = applyPromotionOnProfit(
          benefit,
          discountPercentage,
        );
        const totalPriceAfterDiscount = product.price + beneficeAfterDiscount;

        // --- Scoring selon les préférences ---
        let count = 0;

        // Si la catégorie du produit correspond à celles préférées → +3
        if (
          product.category &&
          categories.some((cat) =>
            product.category.toLowerCase().includes(cat.toLowerCase()),
          )
        ) {
          count += 3;
        }

        // Si le genre du produit correspond → +1
        if (product.target) {
          const key = product.target.toLowerCase();
          if (
            Object.prototype.hasOwnProperty.call(TargetGenders, key) &&
            TargetGenders[key as keyof typeof TargetGenders].includes(
              gender.toLowerCase(),
            )
          ) {
            count += 1;
          }
        }

        // --- Construction du format ContentType attendu ---
        const shopProductUrl = `https://www.otekis.com/${shop.slug}/catalogues/${product.id}`;

        return {
          count, // ⚙️ interne, on le supprimera après tri
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
              ).toFixed(2),
            ),
            stock: product.stock ?? 0,
            brand: product.brand ? product.brand.replace(/ /g, "-") : "",
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
            origin: "otekis",
          },
          shop: {
            id: shop.id,
            name: shop.name,
            description: shop.description ?? "",
            logo: shop.logo ?? "",
            slug: shop.slug,
          },
          url: shopProductUrl,
        };
      }),
    );

    // --- Nettoyer et trier ---
    const validContents = contents
      .filter((c): c is NonNullable<(typeof contents)[number]> => c !== null)
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0)) // tri décroissant
      .map(({ count, ...rest }) => {
        void count; // retire count avant d’envoyer, évite l'avertissement TS pour variable inutilisée
        return rest;
      }); // retire count avant d’envoyer

    console.log(`✅ ${validContents.length} produits préparés et triés.`);

    //
    // 🔹 Produits externes (slash-mobile)
    let externalContents: any[] = [];

    try {
      const externalRes = await fetch(
        "https://slash-puce.vercel.app/api/slash-mobile",
        {
          method: "GET",
          cache: "no-store", // important pour API dynamique
        },
      );

      if (externalRes.ok) {
        const externalData = await externalRes.json();

        externalContents = (externalData?.data || []).map((item: any) => ({
          ...item,
          product: {
            ...item.product,
            origin: item.product.origin || "external",
          },
        }));
      } else {
        console.error("⚠️ API externe non OK");
      }
    } catch (err) {
      console.error("⚠️ erreur fetch external", err);
    }

    const mergedContents = [...validContents, ...externalContents];

    // mélange aléatoire pour discovery
    const shuffled = mergedContents.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      CONTENTS: shuffled,
      hasMore: validContents.length === take,
      message: "Données récupérées avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur GET /products/get :", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
