import { z } from "zod";

export const NewSupplierProductSchema = z
  .object({
    image: z.url("L'image doit être une URL valide"),

    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),

    description: z
      .string()
      .min(5, "La description doit contenir au moins 5 caractères"),

    brand: z.string().optional(),

    price: z
      .string()
      .min(1, "Le prix est requis")
      .refine((val) => !isNaN(Number(val)), {
        message: "Le prix doit être un nombre valide",
      }),

    category: z.string().min(1, "La catégorie est requise"),
    type: z.string().min(1, "Le type est requis"),
    state: z.string().min(1, "L'état est requis"),
    target: z.string().min(1, "La cible est requise"),

    isAvailable: z.enum(
      ["for_all", "specific_sellers", "only_self", "not_available"],
      {
        error: "La disponibilité est requise",
      },
    ),
    permittedSellers: z.array(z.string()),

    articles: z.array(
      z.object({
        color: z.string().min(1, "La couleur est requise"),
        size: z.string().min(1, "La taille est requise"),
        quantity: z.number().min(1, "Quantité invalide"),
      }),
    ),

    commune: z.string().min(1, "La commune est requise"),
    quartier: z.string().min(1, "Le quartier est requis"),

    avenue: z.string().regex(/^.+,\s*\d+[a-zA-Z]?$/, {
      message: "Format invalide (ex: Samba, 12 ou Samba, 12C)",
    }),
  })
  .refine(
    (data) => {
      if (data.isAvailable === "specific_sellers") {
        return data.permittedSellers.length > 0;
      }
      return true;
    },
    {
      message: "Veuillez sélectionner au moins un vendeur",
      path: ["permittedSellers"],
    },
  );

export type NewSupplierProductType = z.infer<typeof NewSupplierProductSchema>;
