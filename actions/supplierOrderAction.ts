"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "./actions";
import { exChangeRate, getCurrencySymbol } from "./companyAction";

type canThisOrderBeProccessedType = {
  productShopId: string;
  quantity: number;
  articleId: string;
  amount: number;
};

export const canThisOrderBeProccessed = async ({
  articleId,
  productShopId,
  quantity,
  amount,
}: canThisOrderBeProccessedType) => {
  try {
    const user = await getUser();

    // 1. USER CHECK
    if (!user || user.isBanned) {
      return {
        error: true,
        message:
          "Accès refusé. Vous devez être connecté et autorisé pour continuer.",
      };
    }

    // 2. PRODUCT SHOP CHECK (avec shop + supplier + product)
    const productShop = await prisma.supplierProductShop.findUnique({
      where: { id: productShopId },
      include: {
        shop: true,
        Product: {
          include: {
            Article: true,
            Supplier: true,
          },
        },
      },
    });

    if (!productShop) {
      return {
        error: true,
        message: "Ce produit n'existe plus ou a été retiré.",
      };
    }

    // 3. SHOP CHECK
    if (!productShop.shop || productShop.shop.isBanned) {
      return {
        error: true,
        message: "Cette boutique est indisponible ou suspendue.",
      };
    }

    // 4. ARTICLE CHECK
    const article = productShop.Product.Article.find((a) => a.id === articleId);

    if (!article) {
      return {
        error: true,
        message: "Cette variante de produit n'existe pas.",
      };
    }

    // 5. STOCK CHECK
    if (article.stock < quantity) {
      return {
        error: true,
        message: `Stock insuffisant. Disponible: ${article.stock}`,
      };
    }

    if (article.stock <= 0) {
      return {
        error: true,
        message: "Produit temporairement indisponible.",
      };
    }

    const exchange = await exChangeRate();

    // 6. PRICE VALIDATION (anti manipulation côté client)
    const expectedPrice = productShop.price * quantity * exchange;

    // tolérance optionnelle (arrondi / exchange / promo)
    const tolerance = expectedPrice * 0.05;

    const min = expectedPrice - tolerance;
    const max = expectedPrice + tolerance;

    if (amount < min || amount > max) {
      return {
        error: true,
        message: "Le montant est incorrect. Rechargez la page et réessayez.",
      };
    }

    // console.log({
    //   amount,
    //   expectedPrice,
    //   min,
    //   max,
    // });

    // 7. OK
    return {
      error: false,
      message: "Commande validée, vous pouvez procéder au paiement.",
      data: {
        productShop,
        article,
        shopId: productShop.shopId,
        exchange,
        supplierId: productShop.Product.supplierId,
      },
    };
  } catch (error) {
    return {
      error: true,
      message: "Impossible d'effectuer cette action, réessayez ultérieurement.",
    };
  }
};

export interface CreateSupplierOrderType {
  productId: string;
  articleId: string;
  productShopId: string;

  quantity: number;
  amount: number;

  receiver: {
    name: string;
    number: string;
    address: string;
  };

  deliveryId: string;
  paymentNumber: string;
}
export const createSupplierOrder = async ({
  amount,
  articleId,
  deliveryId,
  paymentNumber,
  productId,
  productShopId,
  quantity,
  receiver,
}: CreateSupplierOrderType) => {
  try {
    const user = await getUser();

    // 1. USER CHECK
    if (!user || user.isBanned) {
      return {
        error: true,
        message:
          "Accès refusé. Vous devez être connecté et autorisé pour continuer.",
      };
    }

    // 2. CHECK F THIS ORDER IS CORRECT
    const result = await canThisOrderBeProccessed({
      amount: amount,
      articleId: articleId,
      quantity,
      productShopId: productShopId,
    });

    if (result.error) {
      return {
        error: true,
        message: result.message || "Commande invalide!",
      };
    }

    const existingProductShop = result.data;

    if (!existingProductShop) {
      return {
        error: true,
        message: "Commande invalide!",
      };
    }

    const { article, productShop, shopId, exchange, supplierId } =
      existingProductShop;

    // 3. GET INFOS
    const shop = await prisma.shop.findUnique({
      where: {
        id: shopId,
      },
      select: {
        user: {
          select: {
            name: true,
            email: true,
            tel: true,
          },
        },
        slug: true,
        name: true,
        id: true,
      },
    });

    if (!shop || !shop.user) {
      return {
        error: true,
        message: "Commande invalide!",
      };
    }

    // SHOP OWNER
    const { user: owner } = shop;

    // PREFS
    // ------CURRENCY
    const currency = (await getCurrencySymbol()) === "$" ? "USD" : "CDF";

    // SIMULATION DE LIVRAISON ET PRIX DE LIVRAISON
    // DELIVERY INFO
    const delivery = await prisma.deliveryCompany.findFirst({
      where: {
        name: {
          contains: "otekis",
        },
      },
    });

    const deliveryPrice = 5000; // en CDF

    if (!delivery) {
      return {
        error: true,
        message: "Livreur non trouvé!",
      };
    }

    // 4.PAIEMENT SUR FLEXPAIE MOBILE
    const totalAmount = deliveryPrice + amount;
    // FONCTION FLEXPAIE

    // SHARES MONEY
    const supplierAmount = productShop.Product.price * quantity * exchange;
    const shopProfit = amount - supplierAmount;

    // 5. CREATE SUPPLIER ORDER
    const order = await prisma.supplierOrder.create({
      data: {
        clientId: user.id,
        exchange: exchange,
        quantity,
        receiverAddress: receiver.address,
        receiverName: receiver.name,
        receiverTel: receiver.number,
        shopId: shopId,
        totalAmount: amount,
        currency,
        paymentMethod: "flexpaie",
        paymentRef: "FLEXPAIE-456",
        deliveryCompanyId: delivery.id,
        status: "en cours de traitement",
        productShopId,
        deliveryPrice,
        paymentStatus: "paye",

        // EARNINGS
        // ----------SUPPLIER
        supplierEarning: {
          create: {
            amount: supplierAmount,
            exchangeRate: exchange,
            currency,
            supplierId,
          },
        },
        // ------ SHOP
        supplierShopEarning: {
          create: {
            amount: shopProfit,
            exchangeRate: exchange,
            currency,
            shopId,
          },
        },
        // ------ OTEKIS
        otekisEarning: {
          create: {
            amount: deliveryPrice,
            exchangeRate: exchange,
            currency,
            type: "delivery",
          },
        },
      },
    });

    // if(!order){}

    // 6. CREATE INVOICES AFTER PAYMENT
    const invArticle = `${productShop.Product.type} - ${article.color} - ${article.size}`;

    //   const invoices =
    await prisma.supplierInvoice.create({
      data: {
        clientEmail: user.email!,
        clientName: user.name || user.email!,

        shopId,
        ownerName: shop.name,
        ownerNumber: shop.user.tel ?? "Non fourni",

        paymentNumber,
        amount,
        deliveryPrice,
        exchange: exchange,
        currency,
        paymentMethod: "flexpaie",
        paymentRef: "FLEXPAIE-456",

        productName: productShop.Product.name,
        productUid: productShop.Product.uid,
        article: invArticle,
        quantity,

        receiverName: receiver.name,
        receiverNumber: receiver.number,
        receiverAddress: receiver.address,

        deliveryName: delivery.name,
        deliveryNumber: delivery.phone,
      },
    });

    // 7. reduce ARticle stock
    await prisma.$transaction(async (tx) => {
      const article = await tx.supplierArticle.findUnique({
        where: { id: articleId },
        select: { stock: true, productId: true },
      });

      if (article && article.stock >= quantity) {
        // 1. Update article stock (sécurisé)
        await tx.supplierArticle.update({
          where: { id: articleId },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });

        // 2. Update product stock (global)
        await tx.supplierProduct.update({
          where: { id: article.productId },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });
      }
    });

    // 8. Add notifications for client. shop, suppliers et admins

    return {
      error: false,
      message: "Commande envoyée!",
    };
  } catch (error) {
    console.error("Erreur commande", error);
    return {
      error: true,
      message: "Impossible d'effectuer cette action, reessayer ulterieurement!",
    };
  }
};
