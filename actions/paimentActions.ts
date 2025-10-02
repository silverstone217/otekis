"use server";
import { prisma } from "@/lib/prisma";
import { OrderCinetPaySchema } from "@/schema/orderSchema";
import { z } from "zod";
import { getUser } from "./actions";
import {
  generateRandomOrderId,
  returnDataValue,
  returnNumberByPercent,
} from "@/utils/functions";
import { ColorsData } from "@/utils/dataAdd";
import { pusher } from "@/lib/pusher-server";
import { exChangeRate, getCurrencySymbol } from "./companyAction";

type ItemTypeToBuy = {
  productId: string;
  price: number;
  articleId: string;
  quantity: number;
};

export type CanProcessOrderType = {
  item: ItemTypeToBuy[];
  shopId: string;
};

export const canProcessOrder = async (data: CanProcessOrderType) => {
  const isShopExist = await prisma.shop.findUnique({
    where: {
      id: data.shopId,
    },
  });
  if (!isShopExist || isShopExist.isBanned) {
    return "Cette boutique n'existe pas!";
  }

  for (const item of data.item) {
    const isProductExist = await prisma.product.findUnique({
      where: {
        id: item.productId,
      },
    });
    if (!isProductExist) {
      return "un des produits n'existe plus ou été retiré!";
    }

    const isArticleExist = await prisma.article.findUnique({
      where: {
        id: item.articleId,
      },
    });
    if (!isArticleExist) {
      return "un des articles n'existe plus ou été retiré!";
    }
    if (isArticleExist.stock < item.quantity) {
      return "le stock de l'article est insuffisant!";
    }
  }
  return "success";
};

export type OrderCinetPaytype = z.infer<typeof OrderCinetPaySchema>;

// create order
export const newOrderAction = async (data: OrderCinetPaytype) => {
  // check user
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
      data: null,
    };
  }

  //   validate data
  const validationResult = OrderCinetPaySchema.safeParse(data);

  if (!validationResult.success) {
    console.log(validationResult.error.issues, "erreurs survenues");
    return {
      error: true,
      message: "Erreur de validation des informations",
      errors: validationResult.error.issues, // Important: Retourner les erreurs Zod
      data: null,
    };
  }

  const validated = validationResult.data;

  if (!validated.paymentRef) {
    return {
      error: true,
      message: "Pas de référence de paiement",
      data: null,
    };
  }

  // Fonction pour générer un ID unique
  async function generateUniqueOrderId(): Promise<string> {
    let idOrder: string = "";
    let exists = true;

    // Boucle tant que l'ID existe en base
    while (exists) {
      idOrder = await generateRandomOrderId(); // ta fonction existante
      const order = await prisma.order.findUnique({ where: { id: idOrder } });
      exists = order !== null;
    }

    return idOrder;
  }

  const generateID = await generateUniqueOrderId();

  let totalProdMinPrice = 0;

  for (const item of validated.orderItems) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (product) {
      totalProdMinPrice += product.price * item.quantity;
    }
  }

  const companyPrefs = await prisma.otekisPreferences.findFirst();
  const cinetPayPercentage = companyPrefs?.cinetPayPercentage || 0;
  const currency = (await getCurrencySymbol()) === "$" ? "USD" : "CDF";
  const exChange = await exChangeRate();
  const compBenefit =
    currency === "USD" ? totalProdMinPrice : totalProdMinPrice * exChange;

  // shop amount calcuate after benefit and perecntage cinetpay
  const shopAmount = validated.totalAmount - totalProdMinPrice * exChange;
  const shopAmountReducedPercentage = returnNumberByPercent(
    cinetPayPercentage,
    shopAmount
  );

  // company amount calculate total amount after cinetpay percentage taken
  const compAmount = validated.totalAmount;
  const compAmountReducedPercentage = returnNumberByPercent(
    cinetPayPercentage,
    compAmount
  );

  // deliveryPrice after cinetpay percentage taken
  const deliveryAmount = validated.deliveryPrice;
  const deliveryAmountReducedPercentage = returnNumberByPercent(
    cinetPayPercentage,
    deliveryAmount
  );

  // company benefit after cinetpay percentage taken
  const companyBenefit = returnNumberByPercent(cinetPayPercentage, compBenefit);

  //   create order
  const newOrder = await prisma.order.create({
    data: {
      id: generateID,
      totalAmount: validated.totalAmount,
      currency,
      status: validated.status,
      clientId: user.id,

      paymentMethod: validated.paymentMethod,
      paymentRef: validated.paymentRef,
      paymentStatus: validated.paymentStatus,

      receiverName: validated.receiverName,
      receiverAddress: validated.receiverAddress,
      receiverTel: validated.receiverTel,
      description: validated.description ?? undefined,

      shopId: validated.shopId,
      deliveryPrice: validated.deliveryPrice,
      exchange: currency === "USD" ? 1 : exChange,

      orderItems: {
        createMany: {
          data: validated.orderItems.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            articleId: item.articleId,
            currency,
          })),
        },
      },

      deliveryOrder: {
        create: {
          clientId: user.id,
          receiverName: validated.receiverName,
          receiverTel: validated.receiverTel,
          deliveryAddress: validated.receiverAddress,
          description: validated.description ?? undefined,
          deliveryCompanyId: validated.deliveryChoiceId,

          deliveryPrice: validated.deliveryPrice,
          currency,
          exchange: currency === "USD" ? 1 : exChange,
        },
      },
      shopProfitWaited: {
        create: {
          shopId: validated.shopId,
          amount: shopAmountReducedPercentage,
          currency,
          exchange: currency === "USD" ? 1 : exChange,
        },
      },
      otekisProfitWaited: {
        create: {
          amount: compAmountReducedPercentage,
          deliveryPrice: deliveryAmountReducedPercentage,
          currency,
          benefit: companyBenefit,
          exchange: currency === "USD" ? 1 : exChange,
        },
      },
    },
  });

  if (!newOrder) {
    return {
      error: true,
      message: "Une erreur est survenue lors de la création de la commande",
      data: null,
    };
  }

  // reduce quantity for bougth items
  for (const items of validated.orderItems) {
    const article = await prisma.article.findUnique({
      where: {
        id: items.articleId,
      },
    }); // get article

    if (article) {
      const updateArticle = await prisma.article.update({
        where: { id: items.articleId },
        data: { stock: article.stock - items.quantity },
      });
    }
  }

  //   remove added product in cartshop
  const orderItems = validated.orderItems;
  for (const item of orderItems) {
    // get productShop with shopID and productId
    const productShop = await prisma.productShop.findFirst({
      where: {
        shopId: validated.shopId,
        productId: item.productId,
      },
    });
    if (productShop) {
      // remove product from cartShop
      await prisma.cart.deleteMany({
        where: {
          productShopId: productShop.id,
          articleId: item.articleId,
          userId: user.id,
        },
      });
    }
  }

  // make invoices
  const invoice = await prisma.facture.create({
    data: {
      orderId: newOrder.id,
      totalAmount: validated.totalAmount,
      status: validated.paymentStatus,
      PaymentRef: validated.paymentRef,
      address: user.address ?? validated.receiverAddress,
      deliveryPrice: validated.deliveryPrice,
      paymentMethod: validated.paymentMethod,
      currency,
      exchange: currency === "USD" ? 1 : exChange,
    },
  });
  // create invoice items
  for (const item of orderItems) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    const article = await prisma.article.findUnique({
      where: { id: item.articleId },
    });

    const invoiceItems = await prisma.productFacture.create({
      data: {
        factureId: invoice.id,
        price: item.price,
        quantity: item.quantity,
        currency,
        productName: product?.name ?? "produit indisponible",
        productInfo: `${
          article &&
          article.color &&
          returnDataValue(article?.color, ColorsData)
        } ${article?.size} `,
      },
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isBuyingGeneralTermsAccepted: validated.isBuyingGeneralTermsAccepted,
    },
  });

  console.log("Order complete!");
  const count = await prisma.order.count({
    where: { status: "en cours de traitement" },
  });
  await pusher.trigger("orders-channel", "order-count-updated", { count });
  return {
    error: false,
    message: "Commande créée avec succès",
    data: newOrder,
  };
};
