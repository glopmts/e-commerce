import { db } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { object, z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../init";

import { randomInt } from "crypto";
import { sendEmail } from "../../../lib/email";

const generateVerificationCode = (): string => {
  return randomInt(100000, 999999).toString();
};

export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        if (!input.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Você precisa estar logado",
          });
        }

        const user = await db.user.findUnique({
          where: {
            id: input.id,
          },
        });

        return user;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar usuário" + error,
        });
      }
    }),

  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await db.user.findUnique({
        where: {
          id: ctx.session?.user.id,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      return user;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao buscar usuário",
      });
    }
  }),

  updaterUser: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!input.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Você precisa estar logado para atualizar perfil!",
          });
        }

        const user = await db.user.findUnique({
          where: {
            id: input.id,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuario não encontrado!",
          });
        }

        const userData = await db.user.update({
          where: {
            id: input.id,
          },
          data: {
            ...input,
          },
        });

        return userData;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar usuário" + error,
        });
      }
    }),
  updateEmail: publicProcedure
    .input(
      object({
        email: z.email(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!input.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Você precisa estar logado para atualizar email!",
          });
        }

        const user = await db.user.findUnique({
          where: {
            email: input.email,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuario não encontrado!",
          });
        }

        const response = await db.user.update({
          where: {
            email: input.email,
          },
          data: {
            email: input.email,
            emailVerified: true,
          },
        });

        return response;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar email usuário" + error,
        });
      }
    }),
  requestEmailVerification: publicProcedure
    .input(
      z.object({
        newEmail: z.string().email("Email inválido"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await db.verificationCode.upsert({
          where: {
            email: input.newEmail,
          },
          update: {
            code: verificationCode,
            expiresAt,
            attempts: 0,
          },
          create: {
            email: input.newEmail,
            code: verificationCode,
            expiresAt,
            attempts: 0,
          },
        });

        const emailSent = await sendEmail({
          to: input.newEmail,
          subject: "Código de Verificação - Alteração de Email",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Código de Verificação</h2>
              <p>Use o código abaixo para verificar seu novo email:</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                ${verificationCode}
              </div>
              <p style="color: #666; font-size: 14px;">
                Este código expira em 15 minutos. Se você não solicitou esta alteração, ignore este email.
              </p>
            </div>
          `,
        });

        if (!emailSent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Falha ao enviar código de verificação",
          });
        }

        return { success: true, message: "Código enviado com sucesso" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao solicitar verificação de email: " + error,
        });
      }
    }),

  verifyAndUpdateEmail: publicProcedure
    .input(
      z.object({
        currentEmail: z.string().email(),
        newEmail: z.string().email(),
        code: z.string().length(6, "Código deve ter 6 dígitos"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const verificationRecord = await db.verificationCode.findUnique({
          where: {
            email: input.newEmail,
          },
        });

        if (!verificationRecord) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Código de verificação não encontrado",
          });
        }

        if (verificationRecord.expiresAt < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Código expirado",
          });
        }

        if (verificationRecord.attempts >= 5) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Muitas tentativas falhas. Solicite um novo código.",
          });
        }

        // Verificar se o código está correto
        if (verificationRecord.code !== input.code) {
          // Incrementar tentativas falhas
          await db.verificationCode.update({
            where: { email: input.newEmail },
            data: { attempts: verificationRecord.attempts + 1 },
          });

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Código inválido",
          });
        }

        // Buscar usuário pelo email atual
        const user = await db.user.findUnique({
          where: {
            email: input.currentEmail,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado",
          });
        }

        // Verificar se o novo email já está em uso
        const existingUser = await db.user.findUnique({
          where: {
            email: input.newEmail,
          },
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este email já está em uso",
          });
        }

        // Atualizar o email do usuário
        const updatedUser = await db.user.update({
          where: {
            email: input.currentEmail,
          },
          data: {
            email: input.newEmail,
            emailVerified: true,
          },
        });

        // Limpar o código de verificação após uso bem-sucedido
        await db.verificationCode.delete({
          where: {
            email: input.newEmail,
          },
        });

        return {
          success: true,
          message: "Email atualizado com sucesso",
          user: updatedUser,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao verificar código e atualizar email: " + error,
        });
      }
    }),
});
