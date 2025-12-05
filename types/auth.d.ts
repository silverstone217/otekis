export type roleUserType =
  | "user"
  | "admin"
  | "super_admin"
  | "seller"
  | "employee"
  | "other";

declare module "next-auth" {
  interface User {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    role: roleUserType;
    tel: string;
    address: string;
    isBanned: boolean;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;
    isBuyingGeneralTermsAccepted: boolean;
  }

  interface Session {
    user: User | null; // ⬅️ Important
  }

  interface JWT {
    sub?: string;
    role?: roleUserType;
  }
}
