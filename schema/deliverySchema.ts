import z from "zod";

export const AddAgentSchema = z.object({
  name: z.string().min(1).max(60).trim().toLowerCase(),
  email: z.email().max(60).optional().or(z.literal("")),
  phone: z.string().min(9).max(10),
  address: z.string().min(1).max(100).trim(),
});

export const ModifyAgentSchema = z.object({
  name: z.string().min(1).max(60).trim().toLowerCase(),
  email: z.email().max(60).optional().or(z.literal("")),
  phone: z.string().min(9).max(10),
  address: z.string().min(1).max(100).trim(),
  id: z.cuid(),
});

export const AddCompanySchema = z.object({
  name: z.string().min(1).max(60).trim().toLowerCase(),
  email: z.email().max(60).optional().or(z.literal("")),
  phone: z.string().min(9).max(10),
  address: z.string().min(1).max(100).trim(),
  validationPossible: z.boolean(),
});

export const ModifyCompanySchema = z.object({
  name: z.string().min(1).max(60).trim().toLowerCase(),
  email: z.email().max(60).optional().or(z.literal("")),
  phone: z.string().min(9).max(10),
  address: z.string().min(1).max(100).trim(),
  id: z.cuid(),
  isAvailable: z.boolean(),
  validationPossible: z.boolean(),
});
