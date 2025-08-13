import { HeroShopBottomSectionByCat } from "@/components/shop/home/HeroShop";
import NewArrivalProductSection from "@/components/shop/home/NewArrivalProductSection";
import { prisma } from "@/lib/prisma";
import { FontsList } from "@/utils/fontsData";
import { preferenceDefaults } from "@/utils/preferences";
import { capitalizeText } from "@/utils/shopFunctions";
import { Preferences, Product } from "@prisma/client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

// HEROS
import ShopHeroOne from "@/components/new-shop/templates/first/ShopHero";
import ShopHeroSecond from "@/components/new-shop/templates/second/ShopHero";
import ShopHeroThird from "@/components/new-shop/templates/third/ShopHero";
import ShopHeroFourth from "@/components/new-shop/templates/fourth/ShopHero";

// CATEGORIES
import ShopCategoryOne from "@/components/new-shop/templates/first/ShopCategorySection";
import ShopCategorySecond from "@/components/new-shop/templates/second/ShopCategorySection";
import ShopCategoryThird from "@/components/new-shop/templates/third/ShopCategorySection";
import ShopCategoryFourth from "@/components/new-shop/templates/fourth/ShopCategorySection";
import { exChangeRate, getCurrencySymbol } from "@/actions/companyAction";
import { ProductsTypeWithArticles } from "@/types/shop";
import { ProductWithArticle } from "@/types/data";

// HEADERS DATA
const HEROS_DATA = [ShopHeroOne, ShopHeroSecond, ShopHeroThird, ShopHeroFourth];

// CATEGORIES DATA
const CATEGORIES_DATA = [
  ShopCategoryOne,
  ShopCategorySecond,
  ShopCategoryThird,
  ShopCategoryFourth,
];

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Get shop by slug and preferences
const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { Preferences: true, ProductShop: true },
  });
  if (!shop) return null;

  return shop;
};
const getProducts = async () => {
  const products = await prisma.product.findMany({
    include: { Article: true },
    orderBy: { createdAt: "desc" },
  });
  return products;
};

export async function generateMetadata(
  props: Props
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
    };
  }

  return {
    title: capitalizeText(shop.name),
    description: capitalizeText(shop.description),
    openGraph: {
      title: capitalizeText(shop.name),
      description: capitalizeText(shop.description),
      images: [shop.logo],
      type: "website",
    },
    icons: {
      icon: shop.logo,
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

  const preferences = shop.Preferences ?? (preferenceDefaults as Preferences);
  const productsShop = shop.ProductShop;
  const myFont = preferences.fontFamily;

  const getMyFont = FontsList.find((font) => font.name === myFont)?.component;

  // filterd by date and article stock
  const filteredProducts = () => {
    const productIdsInShop = productsShop.map((ps) => ps.productId);
    const filtered = products.filter((product) =>
      productIdsInShop.includes(product.id)
    );

    const sortedProductShops = productsShop
      .filter((ps) => productIdsInShop.includes(ps.productId))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    // const sortedFilteredProducts = sortedProductShops.map((sortedPS) =>
    //   filtered.find((product) => product.id === sortedPS.productId)
    // );
    function isOutOfStock(product: ProductsTypeWithArticles) {
      if (!product.Article || product.Article.length === 0) return true;
      return product.Article.every((a) => a.stock == null || a.stock <= 0);
    }

    const sortedFilteredProducts = sortedProductShops.map((sortedPS) =>
      filtered.find((product) => product.id === sortedPS.productId)
    );

    // Filtre explicitement les undefined (narrowing TypeScript garanti)
    const definedProducts = sortedFilteredProducts.filter(
      (p): p is ProductsTypeWithArticles => p !== undefined
    );

    return definedProducts.sort((a, b) => {
      const aOut = isOutOfStock(a);
      const bOut = isOutOfStock(b);
      if (aOut === bOut) return 0;
      return aOut ? 1 : -1;
    });
  };

  // const articleFirst = filteredProducts()[1]?.Article;

  // console.log(articleFirst);

  // Hero
  const Hero = preferences.Hero;
  const CurrentHero = HEROS_DATA[Number(Hero)] ?? HEROS_DATA[0];

  // Category
  const Category = preferences.Category;
  const CurrentCategory =
    CATEGORIES_DATA[Number(Category)] ?? CATEGORIES_DATA[0];

  const currency = await getCurrencySymbol();
  const exchange = await exChangeRate();

  return (
    <div className="w-full flex flex-col pb-10">
      <CurrentHero
        shop={shop}
        preferences={preferences}
        products={filteredProducts() as Product[]}
        productsShop={productsShop}
        getMyFont={getMyFont!}
        currency={currency}
        exchange={exchange}
      />

      <CurrentCategory
        shop={shop}
        preferences={preferences}
        products={filteredProducts() as Product[]}
        productsShop={productsShop}
        getMyFont={getMyFont!}
      />

      {/* <HeroShopBottomSectionByCat
        shop={shop}
        preferences={preferences}
        products={filteredProducts() as Product[]}
      /> */}
      {/* desc shop */}
      <div
        className="w-full lg:text-center p-4 py-8 text-pretty text-2xl 
      font-bold min-h-[70dvh] md:min-h-[60dvh] xl:min-h-[50dvh] overflow-hidden 
      box-border flex items-center justify-center 
      line-clamp-6 xl:leading-[50px] md:leading-10
      "
      >
        <p>
          {capitalizeText(shop.description.slice(0, 310))}
          {shop.description.length > 313 && "..."}
        </p>
      </div>

      {/* new arrivals */}
      <NewArrivalProductSection
        shop={shop}
        products={filteredProducts() as ProductWithArticle[]}
        preferences={preferences}
        productsShop={productsShop}
        currency={currency}
        exchange={exchange}
      />
    </div>
  );
};

export default MyShopPage;

// eau de parfum chanel saveur orange 300ml

// seduiser tout le monde, ayez confiance en vos charmes avec le nouveau eau de parfum chanel , doux et agreable.
