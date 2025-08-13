import { z } from "zod";

export const addShopBySellerSchema = z.object({
  name: z.string().min(3).max(40),
  description: z.string().min(10).max(5000),
  category: z.string().min(3).max(50),
  logo: z.string(),
  cover: z.string().optional(),
  paymentName: z.string().min(3).max(40),
  paymentPhone: z.string().min(9).max(9),
});

export const modifyShopBySellerSchema = z.object({
  name: z.string().min(3).max(40),
  description: z.string().min(10).max(5000),
  category: z.string().min(3).max(50),
  shopId: z.string(),
  paymentName: z.string().min(3).max(40),
  paymentPhone: z.string().min(9).max(9),
});
