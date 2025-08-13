import { z } from "zod";

export const transfertShopSchema = z.object({
  shopId: z.string().cuid(),
  amount: z.number().positive(),
  currency: z.string(),
  paymentPhone: z.string().min(9).max(9),
  paymentName: z.string().max(50),
  transfertID: z.string().cuid(),
});

export const transfertShopArraySchema = transfertShopSchema.array();
