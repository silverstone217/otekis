import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Facebook from "next-auth/providers/facebook";
import { prisma } from "./lib/prisma";
import Apple from "next-auth/providers/apple";
import { roleUserType } from "./types/auth";

const ResendApiKey = process.env.AUTH_RESEND_KEY!;

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as import("@auth/core/adapters").Adapter,
  pages: {
    signIn: "/connexion",
    verifyRequest: "/verif-email-sent",
    error: "/auth-error",
  },
  providers: [
    Resend({
      apiKey: ResendApiKey,
      from: "onboarding@resend.dev",
    }),
    Google({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Facebook,
    Apple,
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.SECRET_KEY,
  callbacks: {
    async session({ session, token }) {
      try {
        if (token?.sub && session?.user) {
          const user = await prisma.user.findUnique({
            where: { id: token.sub },
          });

          // Si l'utilisateur n'existe plus → nettoyer la session sans casser le typage
          if (!user) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            session.user = null as any;
            return session;
          }

          // Mise à jour du user dans la session
          session.user = {
            id: user.id,
            name: user.name ?? "",
            email: user.email ?? "",
            emailVerified: user.emailVerified ?? null,
            image: user.image ?? "",
            role: (user.role as roleUserType) ?? "USER",
            tel: user.tel ?? "",
            address: user.address ?? "",
            createdAt: user.createdAt ?? new Date(),
            updatedAt: user.updatedAt ?? new Date(),
            isBanned: user.isBanned ?? false,
            isBuyingGeneralTermsAccepted:
              user.isBuyingGeneralTermsAccepted ?? false,
          };
        }
      } catch (err) {
        console.error("SESSION ERROR:", err);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user = null as any;
      }

      return session;
    },
  },
});
