import crypto from "crypto";
import { z } from "zod";
import { protectedProcedure, router } from "../init";

// Encryption helpers
const ENCRYPTION_KEY =
  process.env.CARD_ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const ALGORITHM = "aes-256-cbc";

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.slice(0, 64), "hex"),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text: string): string {
  const parts = text.split(":");
  const iv = Buffer.from(parts.shift()!, "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.slice(0, 64), "hex"),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export const cardRouter = router({
  // Save a new card
  saveCard: protectedProcedure
    .input(
      z.object({
        cardNumber: z.string().min(13).max(19),
        holderName: z.string().min(3),
        expiryMonth: z.number().min(1).max(12),
        expiryYear: z.number().min(new Date().getFullYear()),
        cvv: z.string().min(3).max(4),
        brand: z.string(),
        token: z.string().optional(),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id;

      // Encrypt sensitive data
      const encryptedCardNumber = encrypt(input.cardNumber);
      const encryptedCvv = encrypt(input.cvv);

      // If this card is set as default, unset other defaults
      if (input.isDefault) {
        await ctx.db.cardPayment.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const card = await ctx.db.cardPayment.create({
        data: {
          userId,
          cardNumber: encryptedCardNumber,
          holderName: input.holderName,
          expiryMonth: input.expiryMonth,
          expiryYear: input.expiryYear,
          cvv: encryptedCvv,
          brand: input.brand,
          token: input.token,
          isDefault: input.isDefault,
          isActive: true,
        },
      });

      return {
        id: card.id,
        brand: card.brand,
        lastFourDigits: input.cardNumber.slice(-4),
        holderName: card.holderName,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        isDefault: card.isDefault,
      };
    }),

  // Get all user cards
  getUserCards: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session!.user.id;

    const cards = await ctx.db.cardPayment.findMany({
      where: { userId, isActive: true },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return cards.map((card) => {
      const decryptedCardNumber = decrypt(card.cardNumber);
      return {
        id: card.id,
        brand: card.brand,
        lastFourDigits: decryptedCardNumber.slice(-4),
        holderName: card.holderName,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        isDefault: card.isDefault,
        createdAt: card.createdAt,
      };
    });
  }),

  getCardForPayment: protectedProcedure
    .input(z.object({ cardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id;

      const card = await ctx.db.cardPayment.findFirst({
        where: { id: input.cardId, userId, isActive: true },
      });

      if (!card) {
        throw new Error("Card not found");
      }

      if (!card.token) {
        throw new Error("Token do cartão não encontrado");
      }

      return {
        id: card.id,
        cardNumber: decrypt(card.cardNumber),
        holderName: card.holderName,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        cvv: decrypt(card.cvv!),
        brand: card.brand,
        token: card.token,
      };
    }),

  // Set default card
  setDefaultCard: protectedProcedure
    .input(z.object({ cardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id;

      // Unset all defaults
      await ctx.db.cardPayment.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      // Set new default
      await ctx.db.cardPayment.update({
        where: { id: input.cardId, userId },
        data: { isDefault: true },
      });

      return { success: true };
    }),

  // Delete card
  deleteCard: protectedProcedure
    .input(z.object({ cardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id;

      await ctx.db.cardPayment.update({
        where: { id: input.cardId, userId },
        data: { isActive: false },
      });

      return { success: true };
    }),
});
