import React from "react";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getUser } from "@/actions/actions";
import { PERMITED_ROLES } from "@/utils/dataAdd";
import { Package } from "lucide-react";
import MainSupplierOrder from "@/components/admins/orders/supplier/MainSupplierOrder";

type Props = {
  params: Promise<{ id: string }>;
};

const getOrderById = async (id: string, userId: string) => {
  const order = await prisma.supplierOrder.findUnique({
    where: {
      id,
      productShop: {
        Product: {
          supplierId: userId,
        },
      },
    },
    include: {
      deliveryCompany: true,
      supplierEarning: true,
      otekisEarning: true,
    },
  });

  return order;
};

const getProductByArticleId = async (articleId: string) => {
  const articleWithProduct = await prisma.supplierArticle.findUnique({
    where: { id: articleId },
    include: {
      Product: true,
    },
  });

  if (!articleWithProduct)
    return {
      article: null,
      product: null,
    };

  const { Product: product, ...article } = articleWithProduct;

  return {
    product,
    article,
  };
};

const shopInfo = async (productShopId: string) => {
  const productShop = await prisma.supplierProductShop.findUnique({
    where: {
      id: productShopId,
    },
    include: {
      shop: {
        select: {
          name: true,
          id: true,
          logo: true,
        },
      },
    },
  });

  return productShop ? productShop.shop : null;
};

async function SupplierOrderpage({ params }: Props) {
  const { id: orderId } = await params;

  if (!orderId) {
    redirect("/commandes");
  }

  const user = await getUser();

  if (!user) {
    return null;
  }

  const role = user.role;
  if (!PERMITED_ROLES.includes(role)) {
    return null;
  }

  const order = await getOrderById(orderId, user.id);

  if (!order) redirect("/commandes");

  const { article, product } = await getProductByArticleId(order.articleId);
  const shop = await shopInfo(order.productShopId);

  if (!article || !product || !shop) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 
        border-2 border-dashed rounded-3xl bg-muted/10"
      >
        <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">
          Aucune commande enregistrée ou un probleme survenue
        </p>
      </div>
    );
  }

  return (
    <div>
      <MainSupplierOrder
        order={order}
        product={product}
        article={article}
        shop={shop}
      />
    </div>
  );
}

export default SupplierOrderpage;
