// import { HeroShopBottomSectionByCat } from "@/components/shop/home/HeroShop";
import NewArrivalProductSection from "@/components/shop/home/NewArrivalProductSection";
import { prisma } from "@/lib/prisma";
import { FontsList } from "@/utils/fontsData";
import { preferenceDefaults } from "@/utils/preferences";
import { capitalizeText } from "@/utils/shopFunctions";
import { Preferences, Product, Shop } from "@/lib/generated/prisma/client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";
import { exChangeRate, getCurrencySymbol } from "@/actions/companyAction";
import { ProductsTypeWithArticles } from "@/types/shop";
import { ProductWithArticle } from "@/types/data";

// HEROS
import ShopHeroOne from "@/components/new-shop/templates/first/ShopHero";
import ShopHeroSecond from "@/components/new-shop/templates/second/ShopHero";
import ShopHeroThird from "@/components/new-shop/templates/third/ShopHero";
import ShopHeroFourth from "@/components/new-shop/templates/fourth/ShopHero";
import ShopHeroFifth from "@/components/new-shop/templates/fifth/ShopHero";
import ShopHeroSixth from "@/components/new-shop/templates/sixth/ShopHero";

// CATEGORIES
// import ShopCategoryOne from "@/components/new-shop/templates/first/ShopCategorySection";
// import ShopCategorySecond from "@/components/new-shop/templates/second/ShopCategorySection";
// import ShopCategoryThird from "@/components/new-shop/templates/third/ShopCategorySection";
// import ShopCategoryFourth from "@/components/new-shop/templates/fourth/ShopCategorySection";
// import ShopcategoryFifth from "@/components/new-shop/templates/fifth/ShopCategorySection";

import { HEADERS_DATA } from "./layout";
import { cn } from "@/lib/utils";

// HEROS DATA
const HEROS_DATA = [
  ShopHeroOne,
  ShopHeroSecond,
  ShopHeroThird,
  ShopHeroFourth,
  ShopHeroFifth,
  ShopHeroSixth,
];

// CATEGORIES DATA
// const CATEGORIES_DATA = [
//   ShopCategoryOne,
//   ShopCategorySecond,
//   ShopCategoryThird,
//   ShopCategoryFourth,
//   ShopcategoryFifth,
// ];

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Get shop by slug and preferences
const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      Preferences: true,
      ProductShop: true,
      supplierProductShops: true,
    },
  });
  if (!shop) return null;

  return shop;
};

// GET OTEKIS PRODUCTS
const getProducts = async () => {
  const products = await prisma.product.findMany({
    include: { Article: true },
    orderBy: { createdAt: "desc" },
  });
  return products;
};

// GET SUPPLIER PRODUCTS
const getSupplierProductsForShop = async ({ shop }: { shop: Shop }) => {
  return await prisma.supplierProduct.findMany({
    where: {
      OR: [
        { isAvailable: "for_all" },

        {
          isAvailable: "only_self",
          supplierId: shop.userId,
        },

        {
          isAvailable: "specific_sellers",
          permittedShops: {
            some: {
              shopId: shop.id,
            },
          },
        },
      ],
    },
    include: {
      Article: true,
      permittedShops: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// GENERATE METADATA
export async function generateMetadata(
  props: Props,
): // parent: ResolvingMetadata
Promise<Metadata> {
  const params = await props.params;
  // read route params
  const { slug } = params;

  // fetch data
  const shop = await getShopBySlug(slug);

  if (!shop) {
    return {
      title: "Boutique non trouvée",
      description: "La boutique que vous recherchez n'existe pas.",
      robots: { index: false },
    };
  }

  return {
    title: `${capitalizeText(shop.name)} – Boutique en ligne`,
    description: capitalizeText(shop.description),
    openGraph: {
      title: `${capitalizeText(shop.name)} – Boutique`,
      siteName: capitalizeText(shop.name),
      description: capitalizeText(shop.description),
      images: [
        {
          url: shop.logo, // Assure-toi que c'est une URL absolue
          width: 800,
          height: 600,
        },
      ],
      type: "website",
      url: "https://www.otekis.com/" + shop.slug,
    },
    icons: {
      icon: shop.logo,
    },
    alternates: {
      canonical: `https://www.otekis.com/${shop.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const MyShopPage = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const { slug } = params;

  if (!slug) return redirect("/");

  const shop = await getShopBySlug(slug);
  const products = await getProducts();

  if (!shop) return <div>Shop not found</div>;

  const supplierProducts = await getSupplierProductsForShop({ shop: shop });

  const preferences = shop.Preferences ?? (preferenceDefaults as Preferences);
  const myFont = preferences.fontFamily;
  const getMyFont = FontsList.find((font) => font.name === myFont)?.component;

  // OTEKIS PRODUCTSHOP
  const productsShop = shop.ProductShop;
  // SUPPLIER PRODUCTSHOP
  const supplierProductShop = shop.supplierProductShops;
  // ASSEMBLE ALL PRODUCTS
  const allProductsShop = [...supplierProductShop, ...productsShop].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // ASSEMBLE ALL PRODUCTS
  const allProducts = [...products, ...supplierProducts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // filterd by date and article stock
  const filteredProducts = () => {
    const productIdsInShop = allProductsShop.map((ps) => ps.productId);
    const filtered = allProducts.filter((product) =>
      productIdsInShop.includes(product.id),
    );

    const sortedProductShops = allProductsShop
      .filter((ps) => productIdsInShop.includes(ps.productId))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    // const sortedFilteredProducts = sortedProductShops.map((sortedPS) =>
    //   filtered.find((product) => product.id === sortedPS.productId)
    // );
    function isOutOfStock(product: ProductsTypeWithArticles) {
      if (!product.Article || product.Article.length === 0) return true;
      return product.Article.every(
        (a: { stock: number | null }) => a.stock == null || a.stock <= 0,
      );
    }

    const sortedFilteredProducts = sortedProductShops.map((sortedPS) =>
      filtered.find((product) => product.id === sortedPS.productId),
    );

    // Filtre explicitement les undefined (narrowing TypeScript garanti)
    const definedProducts = sortedFilteredProducts.filter(
      (p): p is ProductsTypeWithArticles => p !== undefined,
    );

    return definedProducts.sort((a, b) => {
      const aOut = isOutOfStock(a);
      const bOut = isOutOfStock(b);
      if (aOut === bOut) return 0;
      return aOut ? 1 : -1;
    });
  };

  // const articleFirst = filteredProducts()[1]?.Article;

  // HEADER
  const Header = Number(preferences.Header) ?? 1;

  // Hero
  const Hero = preferences.Hero;
  const CurrentHero = HEROS_DATA[Number(Hero)] ?? HEROS_DATA[0];

  // Category
  // const Category = preferences.Category;
  // const CurrentCategory =
  //   CATEGORIES_DATA[Number(Category)] ?? CATEGORIES_DATA[0];

  const currency = await getCurrencySymbol();
  const exchange = await exChangeRate();

  return (
    <div className="w-full flex flex-col pb-10">
      <CurrentHero
        shop={shop}
        preferences={preferences}
        products={filteredProducts() as Product[]}
        productsShop={allProductsShop}
        getMyFont={getMyFont!}
        currency={currency}
        exchange={exchange}
      />

      {Header === 3 && <div className="py-10" />}

      {/* <CurrentCategory
        shop={shop}
        preferences={preferences}
        products={filteredProducts() as Product[]}
        productsShop={productsShop}
        getMyFont={getMyFont!}
      /> */}

      {/* <HeroShopBottomSectionByCat
        shop={shop}
        preferences={preferences}
        products={filteredProducts() as Product[]}
      /> */}
      {/* desc shop */}
      <div className="p4-8"></div>
      {preferences.showDescription && (
        <section
          className="w-full relative overflow-hidden flex items-center justify-center px-6 py-20 lg:py-32"
          style={{ backgroundColor: preferences.background }}
        >
          {/* Décoration en arrière-plan (Optionnel : un grand texte très pâle) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
            <span className="text-[20vw] font-black uppercase tracking-tighter italic">
              {shop.name}
            </span>
          </div>

          <div
            className={cn(
              "relative z-10 max-w-5xl mx-auto text-center space-y-8",
              getMyFont?.className,
            )}
          >
            {/* Petit indicateur visuel */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-8 bg-current opacity-30" />
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-50 font-bold">
                À propos de nous
              </span>
              <div className="h-px w-8 bg-current opacity-30" />
            </div>

            {/* Texte de description principal */}
            <blockquote
              className="text-2xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.2] md:leading-[1.1] text-balance"
              style={{ color: preferences.textColor }}
            >
              <span className="opacity-100 italic font-serif mr-2">“</span>
              {capitalizeText(shop.description.slice(0, 310))}
              {shop.description.length > 310 && "..."}
              <span className="opacity-100 italic font-serif ml-1">”</span>
            </blockquote>

            {/* Signature ou Nom du Shop */}
            <div className="pt-6">
              <p
                className="text-sm font-black uppercase tracking-widest italic"
                style={{ color: preferences.buttonColor }}
              >
                — {shop.name}
              </p>
            </div>
          </div>
        </section>
      )}
      <div className="py-4"></div>
      {/* new arrivals */}
      <NewArrivalProductSection
        shop={shop}
        products={filteredProducts() as ProductWithArticle[]}
        preferences={preferences}
        productsShop={allProductsShop}
        currency={currency}
        exchange={exchange}
      />
    </div>
  );
};

export default MyShopPage;

// eau de parfum chanel saveur orange 300ml

// seduiser tout le monde, ayez confiance en vos charmes avec le nouveau eau de parfum chanel , doux et agreable.
