"use client";
import { getUser } from "@/actions/actions";
import { User } from "@/lib/generated/prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type UserAuthType =
  | (Omit<
      User,
      "password" | "supplierBenefitAmount" | "supplierBenefitAmountCDF"
    > & {
      supplierBenefitAmount: number;
      supplierBenefitAmountCDF: number;
    })
  | null;

export const useCurrentUser = () => {
  const [user, setUser] = useState<UserAuthType>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      const serializedUser = user
        ? {
            ...user,
            supplierBenefitAmount: Number(user.supplierBenefitAmount),
            supplierBenefitAmountCDF: Number(user.supplierBenefitAmountCDF),
          }
        : null;

      setUser(serializedUser);
    };

    fetchUser();
  }, [session?.user]);

  return user;
};
