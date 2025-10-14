import { z } from "zod";

export const addShopBySellerSchema = z.object({
  name: z.string().min(3).max(60),
  description: z.string().min(10).max(5000),
  category: z.string().min(3).max(50),
  logo: z.string(),
  cover: z.string().optional(),
  paymentName: z.string().min(3).max(40),
  paymentPhone: z.string().min(9).max(9),
  isSellerTermsAccepted: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les termes et conditions pour continuer.",
  }),
});

export const modifyShopBySellerSchema = z.object({
  name: z.string().min(3).max(60),
  description: z.string().min(10).max(5000),
  category: z.string().min(3).max(50),
  shopId: z.string(),
  paymentName: z.string().min(3).max(40),
  paymentPhone: z.string().min(9).max(9),
  // isSellerTermsAccepted: z.boolean().refine((val) => val === true, {
  //   message: "Vous devez accepter les termes et conditions pour continuer.",
  // }),
});
