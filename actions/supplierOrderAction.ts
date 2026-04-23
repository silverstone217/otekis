"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "./actions";
import { exChangeRate, getCurrencySymbol } from "./companyAction";
import {
  FLEXPAIE_MERCHANT_CODE,
  FLEXPAIE_TOKEN,
  FLEXPAIE_URL_API,
} from "@/utils/envVariables";
import { v4 } from "uuid";
import { checkFlexpaiePaymentAfterDelais } from "./flexpaieAction";
import {
  PaymentFlexpaieDataType,
  PaymentFlexpaieResponseType,
} from "./OrderPaymentAction";
import { OrderStatusType } from "@/types/orders";

// -------- CAN THIS ORDER BE PROCESSED ---------
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

// -------- CREATE AN ORDER ---------
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
    // proceed to create order
    const transaction_id = v4().toString().replace(/-/g, "");
    /*  const flexpaieApiToken = FLEXPAIE_TOKEN;
    const flexpaieApiUrl = FLEXPAIE_URL_API;

    // URL to notify
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://otekis.com"
        : "http://localhost:3000";

    const notify_url = `${baseUrl}/panier`;

    // AMOUNT BASED ON DELIVERY METHOD
    const amountFlexpaie = delivery.name.includes("otekis")
      ? totalAmount
      : totalAmount + deliveryPrice;

    // FLEXPAIE PAYMENT DATA
    const flexpaieData: PaymentFlexpaieDataType = {
      merchant: FLEXPAIE_MERCHANT_CODE,
      type: "1",
      phone:
        receiver.number.length === 9 ? "243" + receiver.number : paymentNumber,
      reference: transaction_id,
      amount: amountFlexpaie.toString(),
      currency: currency,
      callbackUrl: notify_url,
    };

    // call flexpaie api to init payment
    const response = await fetch(flexpaieApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${flexpaieApiToken}`,
      },
      body: JSON.stringify(flexpaieData),
    });

    // console.log("Flexpaie response:", response);

    if (!response.ok) {
      throw new Error("Erreur lors de l'initialisation du paiement");
    }

    //   GET RESPONSE
    const dataResponse = (await response.json()) as PaymentFlexpaieResponseType;

    // console.log("Flexpaie data:", data);

    // Paiement accepté, préparer les données de commande
    const paymentCode = dataResponse.code;

    if (paymentCode !== "0") {
      return {
        error: true,
        message: `Le paiement a échoué: ${dataResponse.message}`,
        data: null,
      };
    }

    const paymentRef = dataResponse.orderNumber;

    // WAIT 30 SECONDS BEFORE CALLING THE NEW ORDER ACTION TO ENSURE PAYMENT IS PROCESSED
    const isPaymentSuccessful = await checkFlexpaiePaymentAfterDelais(
      paymentRef,
      35,
    );
    if (!isPaymentSuccessful) {
      return {
        error: true,
        message: "Le paiement n'a pas été confirmé. Veuillez réessayer.",
        data: null,
      };
    } */

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
        paymentRef: /*paymentRef ||*/ transaction_id,
        deliveryCompanyId: delivery.id,
        status: "en cours de traitement",
        productShopId,
        articleId,
        deliveryPrice,
        paymentStatus: "payé",

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
      },
    });

    // ------ OTEKIS EARNING
    if (delivery.name.includes("otekis")) {
      await prisma.otekisEarning.create({
        data: {
          amount: deliveryPrice,
          exchangeRate: exchange,
          currency,
          type: "delivery",
          orderId: order.id,
        },
      });
    }

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
        paymentRef: /*paymentRef ||*/ transaction_id,

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
      data: order,
    };
  } catch (error) {
    console.error("Erreur commande", error);
    return {
      error: true,
      message: "Impossible d'effectuer cette action, reessayer ulterieurement!",
    };
  }
};

// -------- UPDATE STATUS OF AN ORDER ---------
export type UpdateStatusType = {
  orderId: string;
  status: OrderStatusType;
};

export const updateStatusSupplierOrder = async ({
  orderId,
  status,
}: UpdateStatusType) => {
  try {
    // AUTH
    const user = await getUser();
    if (!user || user.isBanned) {
      return {
        error: true,
        message: "Acces refusé ! ",
      };
    }

    // IS ORDER EXIST
    const order = await prisma.supplierOrder.findUnique({
      where: { id: orderId },
      include: {
        supplierEarning: {
          select: { supplierId: true },
        },
      },
    });

    if (!order) {
      return {
        error: true,
        message: "Cette commande n'est plus disponible ! ",
      };
    }

    // IS STATUS SAME ?
    if (status === order.status) {
      return {
        error: true,
        message: "Cette commande a deja ce status! ",
      };
    }

    // IS USER SUPPLIER OR CLIENT TO THIS ORDER OR ADMIN ?
    const supplierId = order.supplierEarning?.supplierId;
    const clientId = order.clientId;
    const isAdmin = user.role.includes("admin");

    // 🔒 AUTHORIZATION PAR ROLE
    let isAllowed = false;

    // SUPPLIER
    if (user.id === supplierId) {
      isAllowed = [
        "en cours de traitement",
        "en attente de livraison",
        "en cours de livraison",
      ].includes(status);
    }

    // CLIENT
    if (user.id === clientId) {
      isAllowed = status === "annulé";
    }

    // ADMIN
    if (isAdmin) {
      isAllowed = true;
    }

    if (!isAllowed) {
      return {
        error: true,
        message: "Vous ne pouvez pas effectuer cette action",
      };
    }

    // 🔁 WORKFLOW CONTROL
    const forbiddenTransitions = [
      ["livré", "en cours de traitement"],
      ["annulé", "en cours de traitement"],
    ];

    if (
      forbiddenTransitions.some(
        ([from, to]) => order.status === from && status === to,
      )
    ) {
      return {
        error: true,
        message: "Transition de statut invalide",
      };
    }
    // UPDATE NOW
    // ✅ UPDATE
    await prisma.supplierOrder.update({
      where: { id: order.id },
      data: {
        status,
        paymentStatus:
          status === "annulé"
            ? "en attente de remboursement"
            : order.paymentStatus,
      },
    });

    // 💰 GESTION FACTURE
    if (status === "annulé" && order.paymentRef) {
      await prisma.$transaction(async (tx) => {
        // 1. UPDATE INVOICE
        const invoice = await tx.supplierInvoice.findFirst({
          where: { paymentRef: order.paymentRef },
        });

        if (invoice) {
          await tx.supplierInvoice.update({
            where: { id: invoice.id },
            data: {
              status: "rembourse", // "remboursé",
            },
          });
        }

        // 2. DELETE EARNINGS (SAFE)
        await tx.supplierShopEarning.deleteMany({
          where: { orderId: order.id },
        });

        await tx.supplierEarning.deleteMany({
          where: { orderId: order.id },
        });

        await tx.otekisEarning.deleteMany({
          where: { orderId: order.id },
        });
      });
    }

    return {
      error: false,
      message: "Statut mis à jour avec succès",
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: "Erreur serveur",
    };
  }
};
