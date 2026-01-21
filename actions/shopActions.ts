"use server";
import { prisma } from "@/lib/prisma";
import { getUser } from "../actions/actions";

export const getShopsByUserID = async (userId: string) => {
  const shops = await prisma.shop.findMany({
    where: { userId },
  });
  return shops;
};

export const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
  });
  return shop;
};

// STATS with benefit
export const getShopsByUserIDWithStats = async (
  userId: string,
  currency: "USD" | "CDF",
) => {
  const shops = await prisma.shop.findMany({
    where: { userId },
    include: {
      orders: true,
      shopProfitWaited: true,
      withdrawalHistory: {
        orderBy: {
          date: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const filteredShops = shops.map((shop) => {
    const { orders, shopProfitWaited, withdrawalHistory } = shop;
    const profitsTable = shopProfitWaited.filter(
      (profit) => profit.isProcessed && profit.currency === currency,
    );
    const salesCount = profitsTable.length;
    const totalProfit = profitsTable.reduce(
      (acc, profit) => acc + profit.amount,
      0,
    );
    const availableBalance =
      currency === "USD" ? shop.benefit : shop.benefitCDF;

    return {
      id: shop.id,
      salesCount,
      totalProfit,
      availableBalance,
      withdrawalHistory,
    };
  });

  return shops ? filteredShops : [];
};

// image cover update
export const updateShopLogo = async (
  shopId: string,
  logo: string | undefined | null,
) => {
  try {
    const user = await getUser();
    if (!user) {
      return {
        message: "Pas authorisé à faire ça!",
        error: true,
        data: null,
      };
    }

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return {
        message: "Cette boutique n'existe pas!",
        error: true,
        data: null,
      };
    }

    const isHisShop = shop.userId === user.id;

    if (!isHisShop) {
      return {
        message: "Pas authorisé à faire ça!",
        error: true,
        data: null,
      };
    }
    if (!logo) {
      return {
        message: "Logo invalide",
        error: true,
        data: null,
      };
    }
    const updateShop = await prisma.shop.update({
      where: { id: shopId },
      data: { logo: logo },
    });
    return {
      message: "Logo mis à jour avec succès",
      error: false,
      data: updateShop,
    };
  } catch (error) {
    console.error("Error updating shop logo:", error);
    return {
      message: "Erreur lors de la mise à jour du logo",
      error: true,
      data: null,
    };
  }
};

// image cover update
export const updateShopCover = async (
  shopId: string,
  cover: string | undefined | null,
) => {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    return null;
  }

  const isHisShop = shop.userId === user.id;

  if (!isHisShop) {
    return null;
  }
  if (!cover) {
    const updateShop = await prisma.shop.update({
      where: { id: shopId },
      data: { cover: null },
    });
    return updateShop;
  }
  const updateShop = await prisma.shop.update({
    where: { id: shopId },
    data: { cover: cover },
  });
  return updateShop;
};

// product shop add
type addItemShopType = {
  shopId: string;
  productId: string;
  price: number;
  percentage: number;
};
export const addItemToShop = async ({
  percentage,
  price,
  productId,
  shopId,
}: addItemShopType) => {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    return {
      message: "Cette boutique n'existe pas!",
      error: true,
    };
  }

  const isHisShop = shop.userId === user.id;

  if (!isHisShop) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const item = await prisma.productShop.create({
    data: {
      shopId,
      productId,
      price,
      percentage,
    },
  });
  return {
    message: "Article ajouté avec succès!",
    data: item,
    error: false,
  };
};

// product shop delete
type deleteItemShopType = {
  productShopId: string;
  shopId: string;
};

export const deleteItemToShop = async ({
  productShopId,
  shopId,
}: deleteItemShopType) => {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const isShopExist = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!isShopExist) {
    return {
      message: "Cette boutique n'existe pas ou a ete suspendue!",
      error: true,
    };
  }

  if (user.id !== isShopExist.userId) {
    return {
      message: "Impossible de continuer, vous n'etes pas authorisé!",
      error: true,
    };
  }

  const itemShop = await prisma.productShop.findUnique({
    where: { id: productShopId },
  });
  if (!itemShop) {
    return {
      message: "Cet article ne fait pas partie de cette boutique!",
      error: true,
    };
  }

  const item = await prisma.productShop.delete({
    where: {
      id: productShopId,
    },
  });

  return {
    message: "Article supprimé avec succès!",
    error: false,
    data: item,
  };
};
// modify product shop
type modifyItemShopType = {
  productShopId: string;
  percentage: number;
  price: number;
  promotion: number;
};

export const modifyItemToShop = async ({
  productShopId,
  percentage,
  price,
  promotion,
}: modifyItemShopType) => {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const itemShop = await prisma.productShop.findUnique({
    where: { id: productShopId },
  });
  if (!itemShop) {
    return {
      message: "Cet article ne fait pas partie de cette boutique!",
      error: true,
    };
  }

  const item = await prisma.productShop.update({
    where: {
      id: productShopId,
    },
    data: {
      price,
      percentage,
      promotion,
    },
  });

  return {
    message: "Article modifié avec succès!",
    error: false,
    data: item,
  };
};

// get product shop by shopId
export const getProductShopByShopId = async (shopId: string) => {
  const items = await prisma.productShop.findMany({
    where: { shopId },
    orderBy: { createdAt: "desc" },
    include: { Product: true },
  });
  return items;
};

// add product to Cart
type AddToCartType = {
  articleId: string;
  productShopId: string;
  quantity: number;
  cartId?: string;
};

export const addToCart = async ({
  articleId,
  productShopId,
  quantity,
  cartId,
}: AddToCartType) => {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const productShop = await prisma.productShop.findUnique({
    where: { id: productShopId },
    include: { Product: true },
  });

  if (!productShop) {
    return {
      message: "Cet article ne fait pas partie de cette boutique!",
      error: true,
    };
  }

  const isStockAvailable = await prisma.article.findUnique({
    where: { id: articleId },
    select: { stock: true },
  });

  if (!isStockAvailable || isStockAvailable.stock < quantity) {
    return {
      message: "Stock insuffisant!",
      error: true,
    };
  }

  if (!cartId) {
    const item = await prisma.cart.create({
      data: { userId: user.id, productShopId, quantity, articleId },
    });
    if (!item) {
      return {
        message: "Erreur lors de l'ajout au panier!",
        error: true,
        data: null,
      };
    }

    return {
      message: "Article ajouté au panier avec succès!",
      error: false,
      data: item,
    };
  }
  // update

  const item = await prisma.cart.update({
    where: { id: cartId },
    data: { quantity },
  });

  if (!item) {
    return {
      message: "Erreur lors de la modification au panier!",
      error: true,
      data: null,
    };
  }

  return {
    message: "Article modifié au panier avec succès!",
    error: false,
    data: item,
  };
};

export const deleteItemToCart = async (cartId: string) => {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const item = await prisma.cart.findUnique({
    where: { id: cartId },
  });

  if (!item) {
    return {
      message: "Erreur lors de la suppression de l'article!",
      error: true,
      data: null,
    };
  }
  if (item.userId !== user.id) {
    return {
      message: "Cet article ne vous appartient pas!",
      error: true,
    };
  }

  const _deleteItem = await prisma.cart.delete({
    where: { id: cartId },
  });

  return {
    message: "Article supprimé du panier avec succès!",
    error: false,
  };
};

// seller ban or publish
type SellerBanOrPublishType = {
  shopId: string;
  isPublished: boolean;
};

export const sellerBanOrPublish = async ({
  shopId,
  isPublished,
}: SellerBanOrPublishType) => {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    return {
      message: "Cette boutique n'existe pas!",
      error: true,
    };
  }

  const isHisShop = shop.userId === user.id;

  if (!isHisShop) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const updateShop = await prisma.shop.update({
    where: { id: shopId },
    data: { isPublished: isPublished },
  });

  return {
    message: !updateShop.isPublished
      ? "Boutique suspendue avec succès!"
      : "Boutique publiée",
    error: false,
    data: updateShop,
  };
};

export const deleteShop = async (shopId: string) => {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas autorisé à faire ça !",
      error: true,
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      orders: true,
      user: true, // propriétaire de la boutique
    },
  });

  if (!shop) {
    return {
      message: "Cette boutique n'existe pas !",
      error: true,
    };
  }

  const isOwner = shop.userId === user.id;
  const isUserSuperAdmin = user.role === "super_admin";
  const isShopOwnerSuperAdmin = shop.user.role === "super_admin";

  /**
   * LOGIQUE :
   * - Le propriétaire peut TOUJOURS supprimer sa boutique (même s’il est super admin)
   * - Un super_admin peut supprimer une boutique SEULEMENT si le propriétaire n'est PAS super_admin
   * - Sinon → interdit
   */
  if (
    !isOwner && // pas le propriétaire
    !(isUserSuperAdmin && !isShopOwnerSuperAdmin) // super admin mais boutique d'un autre super admin => interdit
  ) {
    return {
      message: "Pas autorisé à faire ça !",
      error: true,
    };
  }

  // Protection : commandes en cours
  const ORDERS_STATUS = [
    "en attente de traitement",
    "en cours de traitement",
    "en attente de livraion",
    "en cours de livraison",
    "en cours de remboursement",
    "en cours d'annulation",
  ];

  const ordersInProgress = shop.orders.filter((order) =>
    ORDERS_STATUS.includes(order.status),
  );

  if (ordersInProgress.length > 0) {
    return {
      message:
        "Cette boutique a des commandes en cours, vous ne pouvez pas la supprimer !",
      error: true,
    };
  }

  await prisma.shop.delete({
    where: { id: shopId },
  });

  const Usershops = await prisma.shop.findMany({
    where: { userId: shop.userId },
  });

  if (Usershops.length === 0 && shop.user.role === "seller") {
    await prisma.user.update({
      where: { id: shop.userId },
      data: { role: "user" },
    });
  }

  return {
    message: "Boutique supprimée avec succès !",
    error: false,
  };
};

// Actions delete all products from the shop
export async function deleteAllProds({ shopId }: { shopId: string }) {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    return {
      message: "Cette boutique n'existe pas!",
      error: true,
    };
  }

  const isHisShop = shop.userId === user.id;
  if (!isHisShop) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const products = await prisma.productShop.findMany({
    where: { shopId },
  });

  if (products.length > 0) {
    await prisma.productShop.deleteMany({
      where: { shopId },
    });
    return {
      message: "Tous les produits ont été supprimés avec succès!",
      error: false,
    };
  } else {
    return {
      message: "Il n'y a aucun produit à supprimer!",
      error: true,
    };
  }
}

// Actions set all products to same percentage from the shop
export async function setSamePercentage({
  percentage,
  shopId,
}: {
  shopId: string;
  percentage: number;
}) {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    return {
      message: "Cette boutique n'existe pas!",
      error: true,
    };
  }

  const isHisShop = shop.userId === user.id;
  if (!isHisShop) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const productsShop = await prisma.productShop.findMany({
    where: { shopId },
  });

  const products = await prisma.product.findMany();

  await prisma.shop.update({ where: { id: shopId }, data: { percentage } });

  if (productsShop.length > 0) {
    for (const prod of productsShop) {
      const product = products.find((p) => p.id === prod.productId);

      if (!product) {
        console.log(`Product ${prod.productId} not found in products array`);
        continue;
      }

      const benefit = Number(Math.round((percentage * product.price) / 100));
      const updatedPrice = product.price + benefit;

      await prisma.productShop.update({
        where: { id: prod.id },
        data: { price: updatedPrice, percentage },
      });
    }

    return {
      message: `Tous les prix ont été mis à ${percentage}% avec succès!`,
      error: false,
      // data: updatedProducts,
    };
  } else {
    return {
      message: "Il n'y a aucun produit à mettre à la même pourcentage!",
      error: true,
    };
  }
}

// set add type manuel or automatically

export async function addTypeProducts({
  percentage,
  shopId,
  addType,
}: {
  shopId: string;
  percentage: number;
  addType: "auto" | "self";
}) {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    return {
      message: "Cette boutique n'existe pas!",
      error: true,
    };
  }

  const isHisShop = shop.userId === user.id;
  if (!isHisShop) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  await prisma.shop.update({
    where: { id: shopId },
    data: { ajout: addType, percentage },
  });

  if (addType === "auto") {
    const productsShop = await prisma.productShop.findMany({
      where: { shopId },
    });

    const products = await prisma.product.findMany();

    for (const prod of productsShop) {
      const product = products.find((p) => p.id === prod.productId);

      if (!product) {
        console.log(`Product ${prod.productId} not found in products array`);
        continue;
      }

      const benefit = Number(Math.round((percentage * product.price) / 100));
      const updatedPrice = product.price + benefit;

      await prisma.productShop.update({
        where: { id: prod.id },
        data: { price: updatedPrice, percentage },
      });
    }

    const otherProductsShop = products
      .filter(
        (product) =>
          !productsShop.some(
            (shopProduct) => shopProduct.productId === product.id,
          ),
      )
      .filter((pr) => pr.category === shop.category);

    if (otherProductsShop.length > 0) {
      for (const prod of otherProductsShop) {
        const product = products.find((p) => p.id === prod.id);

        if (!product) {
          console.log(`Product ${prod.id} not found in products array`);
          continue;
        }

        const benefit = Number(Math.round((percentage * product.price) / 100));
        const updatedPrice = product.price + benefit;
        await prisma.productShop.create({
          data: {
            productId: prod.id,
            shopId,
            price: updatedPrice,
            percentage,
          },
        });
      }
    }
  }

  return {
    message: "Type d'ajout mis à jour avec succès!",
    error: false,
  };
}

export const updateSellerTerms = async (shopId: string) => {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    return {
      message: "Cette boutique n'existe pas!",
      error: true,
    };
  }

  const isHisShop = shop.userId === user.id;

  if (!isHisShop) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const updateShop = await prisma.shop.update({
    where: { id: shopId },
    data: { isSellerTermsAccepted: true },
  });

  return {
    message: "Termes et conditions acceptés avec succès!",
    error: false,
    data: updateShop,
  };
};

// CAN USER CREATE A SHOP
export const canUserCreateShop = async () => {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const shop = await prisma.shop.findFirst({
    where: { userId: user.id },
  });

  if (shop) {
    return {
      message: "Vous avez déjà une boutique!",
      error: true,
    };
  }

  return true;
};
