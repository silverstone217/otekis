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
    async session({ token, session }) {
      if (token && session.user) {
        const tokenId = token.sub;
        if (tokenId) {
          const user = await prisma.user.findUnique({
            where: {
              id: tokenId,
            },
          });
          if (user) {
            session.user = {
              id: user.id,
              name: user.name,
              email: user.email ? user.email : "",
              emailVerified: user.emailVerified,
              image: user.image,
              role: user.role as roleUserType,
              tel: user.tel || "",
              address: user.address || "",
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
              isBanned: user.isBanned,
              isBuyingGeneralTermsAccepted: user.isBuyingGeneralTermsAccepted,
            };
          }
        }
      }
      return session;
    },
  },
});
