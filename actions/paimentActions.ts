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
import {
  exChangeRate,
  getCompanyPreference,
  getCurrencySymbol,
} from "./companyAction";
import { Resend } from "resend";
import { RESEND_API_KEY } from "@/utils/envVariables";

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

  const prefs = await getCompanyPreference();

  if (!prefs) {
    return {
      error: true,
      message: "Mauvaise configuration. reessayer plus tard!",
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
    shopAmount,
  );

  // company amount calculate total amount after cinetpay percentage taken
  const compAmount = validated.totalAmount;
  const compAmountReducedPercentage = returnNumberByPercent(
    cinetPayPercentage,
    compAmount,
  );

  // deliveryPrice after cinetpay percentage taken
  const deliveryAmount = validated.deliveryPrice;
  const deliveryAmountReducedPercentage = returnNumberByPercent(
    cinetPayPercentage,
    deliveryAmount,
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
      cinetPayPercentage: prefs.cinetPayPercentage,
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
        exchange: prefs.exchangeRate,
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

  // SEND NOTIFICATION TO ADMIN ABOUT NEW ORDER WITH RESEND
  // Email d’alerte interne (admin / employés)
  sendNewOrderAlertEmail({
    orderId: newOrder.id,
    totalAmount: validated.totalAmount,
    currency,
    clientName: validated.receiverName,
    clientPhone: validated.receiverTel,
    shopId: validated.shopId,
  });

  return {
    error: false,
    message: "Commande créée avec succès",
    data: newOrder,
  };
};

// CALL RESEND

const resend = new Resend(RESEND_API_KEY);
interface SendNewOrderAlertProps {
  orderId: string;
  totalAmount: number;
  currency: string;
  clientName: string;
  clientPhone: string;
  shopId: string;
}

export async function sendNewOrderAlertEmail({
  orderId,
  totalAmount,
  currency,
  clientName,
  clientPhone,
  shopId,
}: SendNewOrderAlertProps) {
  try {
    await resend.emails.send({
      from: "Otekis <contact@otekis.com>",
      to: [
        "servigroup.social@gmail.com",
        "stephuni35@gmail.com",
        "ngabankumusalem@gmail.com",
      ], // employés / admins
      subject: `🛒 Nouvelle commande reçue — #${orderId}`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color:#f5f7fa; padding:24px;">
          <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:24px;">
            
            <h2 style="margin-top:0; color:#1f2937;">
              Nouvelle commande reçue
            </h2>

            <p style="color:#374151;">
              Une nouvelle commande vient d’être enregistrée sur la plateforme.
            </p>

            <table style="width:100%; border-collapse: collapse; margin-top:16px;">
              <tr>
                <td style="padding:8px 0; color:#6b7280;">Référence commande</td>
                <td style="padding:8px 0;"><strong>#${orderId}</strong></td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#6b7280;">Client</td>
                <td style="padding:8px 0;">${clientName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#6b7280;">Téléphone</td>
                <td style="padding:8px 0;">${clientPhone}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#6b7280;">Montant total</td>
                <td style="padding:8px 0;">
                  <strong>${totalAmount} ${currency}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#6b7280;">Boutique</td>
                <td style="padding:8px 0;">${shopId}</td>
              </tr>
            </table>

            <div style="margin-top:24px;">
              <a 
                href="https://www.otekis.com/commandes/id/${orderId}"
                style="
                  display:inline-block;
                  padding:12px 20px;
                  background:#2563eb;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:6px;
                  font-weight:600;
                "
              >
                Voir la commande
              </a>
            </div>

            <hr style="margin:32px 0; border:none; border-top:1px solid #e5e7eb;" />

            <p style="font-size:13px; color:#9ca3af;">
              Cet email est généré automatiquement par le système Otekis.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur envoi email alerte nouvelle commande :", error);
  }
}
