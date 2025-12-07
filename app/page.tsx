import Footer from "@/components/home/Footer";
import MainHomeComponent from "@/components/home/MainHomeComponent";

export default async function Home() {
  // const user = await getUser();
  return (
    <main className="min-h-dvh w-full flex items-center justify-start flex-col gap-10">
      <MainHomeComponent />

      <Footer />
    </main>
  );
}
