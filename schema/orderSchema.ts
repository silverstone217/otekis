import { z } from "zod";

export const orderStatusEnum = [
  "en cours de traitement",
  "livré",
  "annulé",
  "refusé",
  "reporté",
  "en attente de livraison",
  "en cours de livraison",
] as const;

export const PaymentStatusEnum = [
  "en attente de paiement",
  "payé",
  "annulé",
  "en cours de confirmation",
  "remboursé",
] as const;

export const paymentMethodEnum = [
  "cinetpay",
  "mpesa",
  "cash",
  "bank",
  "flexpaie",
] as const;

export const OrderCinetPaySchema = z.object({
  totalAmount: z.number().min(0),
  deliveryPrice: z.number().min(0).default(0),
  shopId: z.string().min(2).max(50),

  status: z.enum([...orderStatusEnum]),
  paymentStatus: z.enum([...PaymentStatusEnum]),
  paymentMethod: z.enum([...paymentMethodEnum]),
  paymentRef: z.string(),

  receiverAddress: z.string().min(2).max(200),
  receiverName: z.string().min(2).max(100),
  receiverTel: z.string().min(9).max(10),
  description: z.string().max(400).optional(),
  deliveryChoiceId: z.string().optional(),
  isBuyingGeneralTermsAccepted: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les termes et conditions",
  }),

  orderItems: z
    .object({
      articleId: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0),
      productId: z.string(),
    })
    .array(),
});

export const ModifyUserOrderInfoSchema = z.object({
  // totalAmount: z.number().min(0),
  // deliveryPrice: z.number().min(0).default(0),
  shopId: z.string().min(2).max(50),
  orderId: z.string().min(2).max(50),

  // status: z.enum([...orderStatusEnum]),
  // paymentStatus: z.enum([...PaymentStatusEnum]),
  // paymentMethod: z.enum([...paymentMethodEnum]),
  // paymentRef: z.string().optional(),

  receiverAddress: z.string().min(2).max(400),
  receiverName: z.string().min(2).max(100),
  receiverTel: z.string().min(9).max(10),
  description: z.string().max(200).optional(),
});

export const CancelOrderByUserSchema = z.object({
  orderId: z.string().min(2).max(50),
  status: z.string().default("en cours d'annulation"),
  refundPhoneNumber: z.string().min(9).max(10),
  refundReceiverName: z.string().min(2).max(60),
  paymentMethodRefund: z.string().default("mpesa"),
});
