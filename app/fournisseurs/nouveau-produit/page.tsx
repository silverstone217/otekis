import { getUser } from "@/actions/actions";
import NewProductForm from "@/components/supplier/products/new/NewProductForm";

async function page() {
  const user = await getUser();

  if (!user) return null;
  return <NewProductForm />;
}

export default page;
