import React from "react";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getUser } from "@/actions/actions";
import MainForm from "@/components/supplier/products/update/MainForm";

type Props = {
  params: Promise<{ id: string }>;
};

const getSupplierProductById = async (id: string) => {
  const product = await prisma.supplierProduct.findUnique({
    where: { id },
    include: {
      Article: true,
      permittedShops: true,
    },
  });

  return product ?? null;
};

async function ProductSupplierId({ params }: Props) {
  const { id } = await params;

  if (!id) {
    redirect("/fournisseurs");
  }

  const user = await getUser();

  if (!user) {
    return null;
  }

  const product = await getSupplierProductById(id);

  if (!product) redirect("/fournisseurs");

  return (
    <div className="max-w-4xl w-full p-4 mx-auto ">
      <MainForm product={product} />
    </div>
  );
}

export default ProductSupplierId;
