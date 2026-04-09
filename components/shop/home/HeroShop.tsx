"use client";
import { Shop, Preferences, Product } from "@/lib/generated/prisma/client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import man1 from "@/public/images/manCat1.jpg";
import woman1 from "@/public/images/womanCat1.jpg";
import man2 from "@/public/images/manCat2.jpg";
import woman2 from "@/public/images/womanCat2.jpg";
import kid1 from "@/public/images/KidCat1.jpg";
import kid2 from "@/public/images/KidCat2.jpg";
import Image from "next/image";
import necklace1 from "@/public/images/necklace1.jpg";
import necklace2 from "@/public/images/necklace2.jpg";
import bracelet1 from "@/public/images/bracelet1.jpg";
import bracelet2 from "@/public/images/bracelet2.jpg";
import bag1 from "@/public/images/bag1.jpg";
import bag2 from "@/public/images/bag2.jpg";

// import { AccessoriesData, TypeClothesData } from "@/utils/data";
import { capitalizeText } from "@/utils/shopFunctions";

// type Props = {
//   shop: Shop;
//   preferences: Preferences;
//   products: Product[];
//   productsShop: ProductShop[];
// };

const DataCatClothes = [
  {
    image: man1,
    image2: man2,
    title: "Homme",
    link: "/catalogues?target=men",
  },
  {
    image: woman1,
    image2: woman2,
    title: "Femme",
    link: "/catalogues?target=women",
  },
  {
    image: kid1,
    image2: kid2,
    title: "Enfant",
    link: "/catalogues?target=children",
  },
];

const DataCatsAcc = [
  {
    image: necklace1,
    image2: necklace2,
    title: "Collier",
    link: "/catalogues?type=necklaces",
  },
  {
    image: bracelet1,
    image2: bracelet2,
    title: "Bracelets",
    link: "/catalogues?type=bracelets",
  },
  {
    image: bag2,
    image2: bag1,
    title: "Sacs",
    link: "/catalogues?type=bags",
  },
];

export const HeroShopBottomSectionByCat = ({
  shop,
  preferences,
  products,
}: {
  shop: Shop;
  preferences: Preferences;
  products: Product[];
}) => {
  const dataCat =
    shop.category === "accessoires" ? DataCatsAcc : DataCatClothes;

  return (
    <HeroShopBottomSection
      shop={shop}
      preferences={preferences}
      DataCat={dataCat}
      products={products}
    />
  );
};

export const HeroShopBottomSection = ({
  shop,
  preferences,
  DataCat,
  products,
}: {
  shop: Shop;
  preferences: Preferences;
  DataCat: typeof DataCatClothes;
  products: Product[];
}) => {
  // cosmetic shop only
  const idx = useMemo(
    () => Math.floor(Math.random() * products.length),
    [products]
  );

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  if (shop.category === "cosmetiques" && products && products.length > 0) {
    return products.length > 0 ? (
      <div
        className="relative w-full h-[420px]"
        style={{
          backgroundImage: `url(${products[idx].image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "420px",
          position: "relative",
        }}
      >
        {/* image absolute */}

        {/* buy btn */}
        <div
          className="flex flex-col gap-2 z-50 w-full h-full text-white items-end justify-end p-4
          bg-gradient-to-b md:bg-gradient-to-br from-transparent via-black/20 to-black/50
        "
        >
          <div className="flex flex-col gap-2 max-w-sm">
            <h1 className="tracking-tight font-bold uppercase line-clamp-2 text-2xl">
              {products[idx].name}
            </h1>
            <p className="line-clamp-3">
              {capitalizeText(products[idx].description)}
            </p>
            <Link
              style={{
                textDecoration: "none",
                backgroundColor: preferences.buttonColor,
                color: preferences.buttonTextColor,
                borderRadius: preferences.buttonRadius,
                padding: "10px 20px",
                fontSize: "18px",
                fontWeight: "bold",
                transition: "background-color 0.3s ease",
              }}
              href={`/${shop.slug}/catalogues/${products[idx].id}`}
              className="font-medium px-6 py-1 hover:scale-105
            transition-all duration-500 ease-in-out shadow-md
            flex items-center justify-center mt-4"
            >
              Acheter
            </Link>
          </div>
        </div>
      </div>
    ) : null;
  } else if (
    shop.category === "cosmetiques" &&
    products &&
    products.length === 0
  ) {
    return null;
  } else {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-3 transition-all duration-500 ease-in-out">
        {DataCat.map((item, idx) => (
          <div
            className="w-full h-[55dvh] xl:h-[70dvh]  group relative
          transition-all duration-500 ease-in-out group "
            key={idx}
          >
            <Image
              src={item.image}
              alt={item.title}
              width={1200}
              height={1000}
              priority
              className="object-cover transition-all duration-500 ease-in-out absolute inset-0
            h-full w-full group-hover:opacity-0"
            />
            <Image
              src={item.image2}
              alt={item.title}
              width={1200}
              height={1000}
              priority
              className="object-cover opacity-0 group-hover:opacity-100 absolute inset-0
            transition-all duration-500 ease-in-out h-full w-full group-hover:scale-105
            group-hover:z-20 group-hover:shadow-2xl group-hover:border
            "
            />
            {/* link */}
            <Link
              style={{
                textDecoration: "none",
                backgroundColor: preferences.buttonColor,
                color: preferences.buttonTextColor,
                borderRadius: preferences.buttonRadius,
              }}
              href={`/${shop.slug}${item.link}`}
              className="font-medium px-10 py-2 hover:opacity-70 hover:shadow-2xl
              transition-all duration-500 ease-in-out shadow-md absolute z-30
              top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:px-14
              hover:font-bold
              "
            >
              {item.title}
            </Link>
          </div>
        ))}
      </div>
    );
  }
};
