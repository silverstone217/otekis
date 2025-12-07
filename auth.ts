export const dynamic = "force-dynamic";

import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
// import Facebook from "next-auth/providers/facebook";
import { prisma } from "./lib/prisma";
import { roleUserType } from "./types/auth";
// import Apple from "next-auth/providers/apple";
import type { Adapter } from "next-auth/adapters";

const ResendApiKey = process.env.AUTH_RESEND_KEY!;

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma as any),
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
    // Facultatif, commenter si pas configuré
    // Facebook({
    //   clientId: process.env.FB_CLIENT_ID!,
    //   clientSecret: process.env.FB_CLIENT_SECRET!,
    // }),

    // Apple({
    //   clientId: process.env.APPLE_CLIENT_ID!,
    //   clientSecret: process.env.APPLE_CLIENT_SECRET!,
    // }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.SECRET_KEY,
  callbacks: {
    async session({ session, token }) {
      if (!token?.sub) return session;

      const user = await prisma.user.findUnique({
        where: { id: token.sub },
      });

      if (!user) {
        return {
          ...session,
          user: null,
        };
      }

      session.user = {
        id: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
        image: user.image ?? "",
        tel: user.tel ?? "",
        address: user.address ?? "",
        role: (user.role as roleUserType) ?? "user",
        isBanned: user.isBanned ?? false,
        emailVerified: user.emailVerified ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isBuyingGeneralTermsAccepted:
          user.isBuyingGeneralTermsAccepted ?? false,
      };

      return session;
    },
  },
});
