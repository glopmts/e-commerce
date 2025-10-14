import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  // plugins: [
  //   emailOTP({
  //     overrideDefaultEmailVerification: true,
  //     otpLength: 6,
  //     expiresIn: 10 * 60,
  //     sendVerificationOnSignUp: false,
  //     async sendVerificationOTP({ email, otp, type }) {
  //       let subject = "";
  //       let html = "";

  //       switch (type) {
  //         case "sign-in":
  //           subject = "Seu código de login";
  //           html = `
  //             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  //               <h2>Olá!</h2>
  //               <p>Seu código de login é:</p>
  //               <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px;">
  //                 <h1 style="font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
  //               </div>
  //               <p style="margin-top: 20px;">Esse código expira em 10 minutos.</p>
  //               <p style="color: #666; font-size: 14px;">Se você não solicitou este código, ignore este e-mail.</p>
  //             </div>
  //           `;
  //           break;

  //         case "email-verification":
  //           subject = "Verifique seu e-mail";
  //           html = `
  //             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  //               <h2>Verificação de E-mail</h2>
  //               <p>Use o código abaixo para confirmar seu e-mail:</p>
  //               <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px;">
  //                 <h1 style="font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
  //               </div>
  //               <p style="margin-top: 20px;">Esse código expira em 10 minutos.</p>
  //             </div>
  //           `;
  //           break;

  //         case "forget-password":
  //           subject = "Redefinição de senha";
  //           html = `
  //             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  //               <h2>Redefinir Senha</h2>
  //               <p>Use o código abaixo para redefinir sua senha:</p>
  //               <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px;">
  //                 <h1 style="font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
  //               </div>
  //               <p style="margin-top: 20px;">Esse código expira em 10 minutos.</p>
  //             </div>
  //           `;
  //           break;

  //         default:
  //           subject = "Código de verificação";
  //           html = `<h1>${otp}</h1>`;
  //       }

  //       await sendEmail({ to: email, subject, html });
  //     },
  //   }),
  // ],
  trustHost: true,
});

export type Auth = typeof auth;
export type Session = Auth["$Infer"]["Session"];
export type User = Session["user"];
