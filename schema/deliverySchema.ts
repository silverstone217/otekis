import z from "zod";

export const AddAgentSchema = z.object({
  name: z.string().min(1).max(60).trim().toLowerCase(),
  email: z.string().email().max(60).optional().or(z.literal("")),
  phone: z.string().min(9).max(10),
  address: z.string().min(1).max(100).trim(),
});

export const ModifyAgentSchema = z.object({
  name: z.string().min(1).max(60).trim().toLowerCase(),
  email: z.string().email().max(60).optional().or(z.literal("")),
  phone: z.string().min(9).max(10),
  address: z.string().min(1).max(100).trim(),
  id: z.string().cuid(),
});

export const ModifyCompanySchema = z.object({
  name: z.string().min(1).max(60).trim().toLowerCase(),
  email: z.string().email().max(60).optional().or(z.literal("")),
  phone: z.string().min(9).max(10),
  address: z.string().min(1).max(100).trim(),
  id: z.string().cuid(),
  isAvailable: z.boolean(),
});
