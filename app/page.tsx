import { getProductsWithArticles } from "@/actions/actions";
import Footer from "@/components/home/Footer";
import MainHomeComponent from "@/components/home/MainHomeComponent";
import { prisma } from "@/lib/prisma";
import { shuffleArray } from "@/utils/functions";

export default async function Home() {
  // const user = await getUser();

  const products = await getProductsWithArticles();
  const filterdeProducts = !products
    ? []
    : shuffleArray(products).filter(
        (itm) => !itm.name.toLocaleLowerCase().includes("test")
      );

  return (
    <main className="min-h-dvh w-full flex items-center justify-start flex-col gap-10">
      <MainHomeComponent products={filterdeProducts} />

      <Footer />
    </main>
  );
}
