import { getUser } from "@/actions/actions";
import NewProductForm from "@/components/supplier/products/new/NewProductForm";

type PageProps = {
  searchParams: Promise<{ shopId?: string; shopSlug?: string }>;
};

async function page({ searchParams }: PageProps) {
  const user = await getUser();
  if (!user) return null;

  const { shopId, shopSlug } = await searchParams;

  return <NewProductForm shopId={shopId} shopSlug={shopSlug} />;
}

export default page;
