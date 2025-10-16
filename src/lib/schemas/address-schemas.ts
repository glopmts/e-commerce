import { z } from "zod";

export const createAddressInput = z.object({
  userId: z.string(),
  zipCode: z.string().min(8).max(9),
  street: z.string().min(1).max(255),
  number: z.string().min(1).max(10),
  complement: z.string().max(255).optional().nullable(),
  neighborhood: z.string().min(1).max(255),
  city: z.string().min(1).max(255),
  state: z.string().min(2).max(2),
  country: z.string().min(1).max(255).default("Brasil"),
  isDefault: z.boolean().default(false),
});

export const updateAddressInput = z.object({
  id: z.string(),
  zipCode: z.string().min(8).max(9).optional(),
  street: z.string().min(1).max(255).optional(),
  number: z.string().min(1).max(10).optional(),
  complement: z.string().max(255).optional().nullable(),
  neighborhood: z.string().min(1).max(255).optional(),
  city: z.string().min(1).max(255).optional(),
  state: z.string().min(2).max(2).optional(),
  country: z.string().min(1).max(255).optional(),
  isDefault: z.boolean().optional(),
});

export const deleteAddressInput = z.object({
  id: z.string(),
  userId: z.string(),
});

export const setDefaultAddressInput = z.object({
  id: z.string(),
  userId: z.string(),
});

export const addressOutput = z.object({
  id: z.string(),
  number: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  state: z.string(),
  userId: z.string(),
  zipCode: z.string(),
  street: z.string(),
  complement: z.string().nullable(),
  neighborhood: z.string(),
  city: z.string(),
  country: z.string(),
  isDefault: z.boolean(),
});

export const addressListOutput = z.array(addressOutput);
export const addressMutationOutput = z.object({
  success: z.boolean(),
  message: z.string(),
  address: addressOutput.optional(),
});
