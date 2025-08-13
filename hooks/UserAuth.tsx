import { useSession } from "next-auth/react";

/**
 * Custom hook pour récupérer l'utilisateur actuel.
 * @returns L'utilisateur actuel (user) ou null si non connecté.
 */
export const useCurrentUser = () => {
  const { data: session, status } = useSession();

  // Vérifie si la session est chargée et l'utilisateur est authentifié
  if (status === "authenticated" && session?.user) {
    return session.user; // Retourne l'objet utilisateur
  }

  // Retourne null si l'utilisateur n'est pas authentifié ou si la session est en cours de chargement
  return null;
};
