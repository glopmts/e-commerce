import { z } from "zod";

// Schema para ProductImage
export const productImageSchema = z.object({
  id: z.string(),
  url: z.string().url("URL da imagem deve ser válida"),
  altText: z.string().max(255).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
  productId: z.string(),
  createdAt: z.date().optional(),
});

export const createProductImageSchema = productImageSchema.omit({
  id: true,
  productId: true,
  createdAt: true,
});

// Schema para ProductAttribute
export const productAttributeSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100, "Nome do atributo muito longo"),
  value: z.string().min(1).max(255, "Valor do atributo muito longo"),
  productId: z.string(),
  createdAt: z.date().optional(),
});

export const createProductAttributeSchema = productAttributeSchema.omit({
  id: true,
  productId: true,
  createdAt: true,
});

// Schema para ProductVariant
export const productVariantSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100, "Nome da variante muito longo"),
  sku: z.string().max(100).optional().nullable(),
  price: z.number().positive("Preço deve ser positivo").optional().nullable(),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  productId: z.string(),
  sizeId: z.string().optional().nullable(),
  colorId: z.string().optional().nullable(),
  size: z
    .object({
      id: z.string(),
      name: z.string(),
      value: z.string().nullable(),
      sortOrder: z.number(),
      createdAt: z.date(),
    })
    .optional()
    .nullable(),
  color: z
    .object({
      id: z.string(),
      name: z.string(),
      value: z.string(),
      sortOrder: z.number(),
      createdAt: z.date(),
    })
    .optional()
    .nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createProductVariantSchema = productVariantSchema.omit({
  id: true,
  productId: true,
  size: true,
  color: true,
  createdAt: true,
  updatedAt: true,
});

// Schema para Review (se necessário)
export const reviewSchema = z.object({
  id: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional().nullable(),
  isApproved: z.boolean().default(false),
  userId: z.string(),
  productId: z.string(),
  user: z
    .object({
      id: z.string(),
      name: z.string().optional().nullable(),
    })
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema principal do Product
export const productSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(255, "Título muito longo"),
  description: z.string().max(2000).optional().nullable(),
  price: z
    .number()
    .positive("Preço deve ser positivo")
    .max(999999.99, "Preço muito alto"),
  comparePrice: z
    .number()
    .positive("Preço de comparação deve ser positivo")
    .max(999999.99, "Preço de comparação muito alto")
    .optional()
    .nullable(),
  costPrice: z
    .number()
    .positive("Preço de custo deve ser positivo")
    .max(999999.99, "Preço de custo muito alto")
    .optional()
    .nullable(),
  slug: z.string().max(100),
  barcode: z.string().max(100).optional().nullable(),
  weight: z
    .number()
    .positive("Peso deve ser positivo")
    .max(999999, "Peso muito alto")
    .optional()
    .nullable(),
  height: z
    .number()
    .positive("Altura deve ser positiva")
    .max(9999, "Altura muito alta")
    .optional()
    .nullable(),
  width: z
    .number()
    .positive("Largura deve ser positiva")
    .max(9999, "Largura muito alta")
    .optional()
    .nullable(),
  depth: z
    .number()
    .positive("Profundidade deve ser positiva")
    .max(9999, "Profundidade muito alta")
    .optional()
    .nullable(),
  content: z
    .string()
    .min(30, "Necessário pelo menos 30 caracteres no conteúdo!"),
  stock: z.number().int().min(0, "Estoque não pode ser negativo").default(0),
  trackStock: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  categoryId: z.string(),
});

// Schema para criação
export const createProductSchema = productSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    images: z.array(createProductImageSchema).optional(),
    variants: z.array(createProductVariantSchema).optional(),
    attributes: z.array(createProductAttributeSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.images && data.images.length > 0) {
        const primaryImages = data.images.filter((img) => img.isPrimary);
        return primaryImages.length <= 1;
      }
      return true;
    },
    {
      message: "Apenas uma imagem pode ser marcada como primária",
      path: ["images"],
    }
  );

// Schema para atualização
export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string(),
});

// Schema de resposta completo
export const productResponseSchema = productSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  images: z.array(productImageSchema).optional(),
  variants: z.array(productVariantSchema).optional(),
  attributes: z.array(productAttributeSchema).optional(),
  reviews: z.array(reviewSchema).optional(),
  category: z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      isActive: z.boolean(),
    })
    .optional(),
  _count: z
    .object({
      wishlist: z.number().int().min(0),
      reviews: z.number().int().min(0),
    })
    .optional(),
});

// Schema para lista de produtos (resumo)
export const productListResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number(),
  comparePrice: z.number().nullable(),
  slug: z.string(),
  categoryId: z.string(),
  stock: z.number(),
  thumbnail: z.string().nullable(),
  isActive: z.boolean(),
  description: z.string().nullable(),
  isFeatured: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  category: z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    })
    .optional(),
  images: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        altText: z.string().nullable(),
        isPrimary: z.boolean(),
      })
    )
    .optional(),
  variants: z.array(productVariantSchema).optional(),
  _count: z
    .object({
      reviews: z.number().int().min(0),
      wishlist: z.number().int().min(0),
    })
    .optional(),
});

// Input schemas
export const productQuerySchema = z.object({
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  inStock: z.boolean().optional(),
  thumbnail: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(["title", "price", "createdAt", "updatedAt", "stock"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const getProductsInput = productQuerySchema;

export const getProductByIdInput = z.object({
  id: z.string(),
});

export const getProductBySlugInput = z.object({
  slug: z.string().min(1, "Slug é obrigatório"),
});

export const createProductInput = createProductSchema;

export const updateProductInput = updateProductSchema;

export const deleteProductInput = z.object({
  id: z.string(),
});

export const toggleProductStatusInput = z.object({
  id: z.string(),
  isActive: z.boolean(),
});

// Output schemas
export const productListOutput = z.array(productListResponseSchema);
export const productDetailOutput = productResponseSchema;
export const productCountOutput = z.object({
  count: z.number().int().min(0),
});
export const productMutationOutput = z.object({
  success: z.boolean(),
  message: z.string(),
  product: productResponseSchema.optional(),
});

// Types
export type Product = z.infer<typeof productSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
export type ProductListResponse = z.infer<typeof productListResponseSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type ProductAttribute = z.infer<typeof productAttributeSchema>;
export type Review = z.infer<typeof reviewSchema>;

export type GetProductsInput = z.infer<typeof getProductsInput>;
export type GetProductByIdInput = z.infer<typeof getProductByIdInput>;
export type GetProductBySlugInput = z.infer<typeof getProductBySlugInput>;
export type CreateProductInput = z.infer<typeof createProductInput>;
export type UpdateProductInput = z.infer<typeof updateProductInput>;
export type DeleteProductInput = z.infer<typeof deleteProductInput>;
export type ToggleProductStatusInput = z.infer<typeof toggleProductStatusInput>;
