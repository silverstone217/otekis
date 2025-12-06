import { getUser } from "@/actions/actions";
import { User } from "@prisma/client";
// import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type UserAuthType = Omit<User, "password"> | null;

export const useCurrentUser = () => {
  // const { data: session, status } = useSession();

  const [user, setUser] = useState<UserAuthType>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  // Retourne null si l'utilisateur n'est pas authentifié ou si la session est en cours de chargement
  return user;
};
