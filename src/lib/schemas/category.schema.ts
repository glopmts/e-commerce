import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  description: z.string().max(500).optional().nullable(),
  slug: z
    .string()
    .min(1, "Slug é obrigatório")
    .max(100, "Slug muito longo")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug deve conter apenas letras minúsculas, números e hífens"
    ),
  image: z.string().url("URL da imagem deve ser válida").optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
  parentId: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createCategorySchema = categorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().cuid("ID da categoria inválido"),
});

export const categoryQuerySchema = z.object({
  isActive: z.boolean().optional(),
  includeInactive: z.boolean().optional(),
  parentId: z.string().optional().nullable(),
});

const baseCategoryResponseSchema = categorySchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  _count: z
    .object({
      products: z.number().int().min(0),
    })
    .optional(),
});

export type CategoryResponse = z.infer<typeof baseCategoryResponseSchema> & {
  parent?: CategoryResponse | null;
  children?: CategoryResponse[];
};

export const categoryResponseSchema: z.ZodType<CategoryResponse> =
  baseCategoryResponseSchema.extend({
    parent: z.lazy(() => categoryResponseSchema.optional().nullable()),
    children: z.lazy(() => z.array(categoryResponseSchema).optional()),
  });

export const categoryListResponseSchema = baseCategoryResponseSchema.extend({
  parent: z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    })
    .optional()
    .nullable(),
  children: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        isActive: z.boolean(),
        sortOrder: z.number(),
        _count: z
          .object({
            products: z.number().int().min(0),
          })
          .optional(),
      })
    )
    .optional(),
});

// Types
export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
export type CategoryListResponse = z.infer<typeof categoryListResponseSchema>;
