import { z } from "zod";

export const addProductByAdminSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().min(0),
  stock: z.number().min(0).default(0),
  description: z.string().min(10).max(10000),
  category: z.string().min(3).max(50),
  state: z.string().min(2).max(50),
  quality: z.string().min(3).max(50),
  type: z.string().min(2).max(50).default("other"),
  material: z.string().max(50).optional().default("other"),
  brand: z.string().max(50).optional(),
  target: z.string().min(3).max(50),
  image: z.string(),
  images: z.array(z.string()).optional(),
});

export const modifyProductByAdminSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().min(0),
  stock: z.number().min(0),
  description: z.string().min(10).max(10000),
  category: z.string().min(3).max(50),
  state: z.string().min(2).max(50),
  quality: z.string().min(3).max(50),
  type: z.string().min(2).max(50),
  material: z.string().max(50).optional().default("other"),
  brand: z.string().max(50).optional(),
  target: z.string().min(3).max(50),
  id: z.string(),
});

export const modifyProductImagesByAdminSchema = z.object({
  id: z.string(),
  images: z.array(z.string()),
});

export const deleteProductByAdminSchema = z.object({
  id: z.string(),
  description: z.string().max(600),
});
