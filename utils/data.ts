import {
  ShoppingBag,
  ShieldEllipsis,
  Home,
  ChartNoAxesGantt,
  ScanBarcode,
  UsersRound,
  Shirt,
  Watch,
  SprayCan,
  MonitorSmartphone,
  Banana,
  Hexagon,
  Store,
  Settings2,
  Contact,
  Layers,
  ShieldUser,
  Truck,
  ChartNoAxesCombined,
  BadgeDollarSign,
} from "lucide-react";

export const siteName = process.env.SITE_NAME;

export const linksPage = [
  // {
  //   name: "Services",
  //   path: "/services",
  //   icon: ShoppingBag,
  // },

  {
    name: "Accueil",
    path: "/",
    icon: Home,
  },
  {
    name: "A propos",
    path: "/a-propos",
    icon: ShieldEllipsis,
  },
];

export const AdminLinksPage = [
  {
    name: "Overview",
    path: "/overview",
    icon: ChartNoAxesGantt,
    roles: ["super_admin", "admin", "employee"],
  },
  {
    name: "Produits",
    path: "/produits",
    icon: ScanBarcode,
    roles: ["super_admin", "admin", "employee"],
  },
  {
    name: "Historiques de commandes",
    path: "/historiques",
    icon: Layers,
    roles: ["super_admin", "admin", "employee"],
  },
  {
    name: "Traitement et commandes",
    path: "/commandes/status/en_cours_de_traitement",
    icon: ShoppingBag,
    roles: ["super_admin", "admin", "employee"],
  },
  {
    name: "Livraisons",
    path: "/livraisons",
    icon: Truck,
    roles: ["super_admin", "admin", "employee"],
  },
  {
    name: "Finances",
    path: "/finances/transfert",
    icon: BadgeDollarSign,
    roles: ["super_admin", "admin"],
  },

  {
    name: "Utilisateurs",
    path: "/utilisateurs",
    icon: UsersRound,
    roles: ["super_admin", "admin"],
  },
  {
    name: "Staffs",
    path: "/admins",
    icon: ShieldUser,
    roles: ["super_admin"],
  },
];

export const SellerLinksPage = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: ChartNoAxesGantt,
  },
  {
    name: "Ma boutique",
    path: "/ma-boutique",
    icon: Store,
  },
  {
    name: "Mes produits",
    path: "/mes-produits",
    icon: ShoppingBag,
  },
  {
    name: "Preferences",
    path: "/preferences",
    icon: Settings2,
  },
  {
    name: "Mes contacts",
    path: "/mes-contacts",
    icon: Contact,
  },
  {
    name: "Stats et benefices",
    path: "/stats-et-benefices",
    icon: ChartNoAxesCombined,
  },
];

export const CategoriesData = [
  {
    value: "vetements",
    label: "Vetements et chaussures",
    icon: Shirt,
  },
  {
    value: "accessoires",
    label: "Accessoires et Bijoux",
    icon: Watch,
  },
  {
    value: "cosmetiques",
    label: "Cosmetiques et Beauté",
    icon: SprayCan,
  },
  {
    value: "electroniques",
    label: "Electroniques",
    icon: MonitorSmartphone,
  },
  {
    value: "aliments",
    label: "Nourriture et boissons",
    icon: Banana,
  },
  {
    value: "autres",
    label: "Autres",
    icon: Hexagon,
  },
];

export const StatesData = [
  {
    value: "nouveau",
    label: "Nouveau",
  },
  {
    value: "use",
    label: "Usé",
  },
  {
    value: "reconditionne",
    label: "Reconditionné",
  },
];

export const QualitiesData = [
  {
    value: "original",
    label: "Original",
  },
  {
    value: "good",
    label: "Bonne qualité",
  },
  {
    value: "bad",
    label: "Contrafaçon",
  },
];

export const TypeClothesData = [
  {
    value: "shirt",
    label: "Chemise",
  },
  {
    value: "tshirt",
    label: "T-shirt et polo",
  },
  {
    value: "pant",
    label: "Pantalon",
  },
  {
    value: "skirt",
    label: "Jupe",
  },
  {
    value: "socks",
    label: "Chaussettes",
  },
  {
    value: "shoes",
    label: "Chaussures",
  },
  {
    value: "jacket",
    label: "Veste",
  },
  {
    value: "suit",
    label: "Costume",
  },
  {
    value: "sweatshirt",
    label: "Sweatshirt",
  },
  {
    value: "hoodies",
    label: "Hoodies",
  },
  {
    value: "dress",
    label: "Robe",
  },
  {
    value: "swimwear",
    label: "Bikini et swimwear",
  },
  {
    value: "short",
    label: "Short(cullotte)",
  },
  {
    value: "top",
    label: "Haut",
  },
  {
    value: "bottom",
    label: "Bas",
  },
  {
    value: "denim",
    label: "Denim",
  },
  {
    value: "tights",
    label: "Collants",
  },
  {
    value: "boots",
    label: "Bottes",
  },
  {
    value: "scarf",
    label: "Echarpe",
  },
  {
    value: "cap",
    label: "Casquette",
  },
  {
    value: "bag",
    label: "Sac à main",
  },
  {
    value: "coat",
    label: "Manteau",
  },
  {
    value: "hat",
    label: "Chapeau",
  },
  {
    value: "heels",
    label: "Tallons",
  },
  {
    value: "other",
    label: "Autre",
  },
];

export const TargetData = [
  {
    value: "men",
    label: "Hommes",
  },
  {
    value: "women",
    label: "Femmes",
  },
  {
    value: "children",
    label: "Enfants",
  },
  {
    value: "unisex",
    label: "Unisex",
  },
];

export const UserRoleData = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "super_admin",
    label: "Super Admin",
  },
  {
    value: "employee",
    label: "Employé",
  },
  {
    value: "seller",
    label: "Vendeur",
  },

  {
    value: "user",
    label: "Client",
  },
  {
    value: "other",
    label: "Autre",
  },
];

export const AccessoriesData = [
  {
    value: "earrings",
    label: "Boucles d'oreilles",
  },
  {
    value: "bracelets",
    label: "Bracelets",
  },
  {
    value: "necklaces",
    label: "Colliers",
  },
  {
    value: "collars",
    label: "Bagues",
  },
  {
    value: "bags",
    label: "Sac",
  },
  {
    value: "watch",
    label: "Montre",
  },
  {
    value: "piercings",
    label: "Piercings",
  },
  {
    value: "pins",
    label: "Epingles",
  },
  {
    value: "headbands",
    label: "Serre tete",
  },
  {
    value: "scarf",
    label: "Foulard",
  },
  {
    value: "other",
    label: "Autre",
  },
];

export const MaterialsAccData = [
  {
    value: "gold",
    label: "Or",
  },
  {
    value: "silver",
    label: "Argent",
  },
  {
    value: "copper",
    label: "Cuivre",
  },
  {
    value: "bronze",
    label: "Bronze",
  },
  {
    value: "titanium",
    label: "Titanium",
  },
  {
    value: "aluminium",
    label: "Aluminium",
  },
  {
    value: "iron",
    label: "Fer",
  },
  {
    value: "plastic",
    label: "Plastic",
  },
  {
    value: "leather",
    label: "Cuir",
  },
  {
    value: "ceramic",
    label: "Céramique",
  },
  {
    value: "wood",
    label: "Bois",
  },
  {
    value: "fabric",
    label: "Tissu",
  },
  {
    value: "other",
    label: "Autre",
  },
];

export const JewelryData = ["collars", "necklaces", "earrings"];

import {
  HandCoins,
  PackageSearch,
  ShoppingCart,
  Store as StoreIcon,
  Headset,
  ChartNoAxesColumn,
} from "lucide-react";
export const OtekisDescData = [
  {
    title: "Créer votre boutique en ligne",
    icon: StoreIcon,
    description:
      "Avec Otekis, chaque utilisateur a la possibilité de lancer sa propre boutique personnalisée. Grâce à notre interface conviviale, vous pouvez choisir le nom de votre boutique, sélectionner des couleurs attrayantes et définir des polices d'écriture qui reflètent votre style unique. Cette personnalisation vous permet de créer une expérience de marque qui vous ressemble.",
  },
  {
    title: "Accès à un large éventail de produits",
    icon: PackageSearch,
    description:
      "Nous mettons à votre disposition une vaste sélection de produits soigneusement choisis par notre équipe. Vous pouvez facilement parcourir notre catalogue et choisir les articles que vous souhaitez vendre dans votre boutique. Chaque produit est accompagné d'informations détaillées pour vous aider à faire les meilleurs choix pour vos clients.",
  },
  {
    title: "Gérer vos ventes et vos statistiques",
    icon: ChartNoAxesColumn,
    description:
      "Otekis ne se limite pas à la création de boutiques ; nous fournissons également un tableau de bord complet où vous pouvez suivre vos ventes en temps réel. Vous aurez accès à des statistiques détaillées sur vos performances, ce qui vous permettra d'optimiser votre offre et d'améliorer vos résultats financiers. Cette transparence vous aide à prendre des décisions éclairées pour maximiser vos gains.",
  },
  {
    title: "Livraison gérée par Otekis",
    icon: ShoppingCart,
    description:
      "Nous comprenons que la logistique peut être un défi pour les nouveaux entrepreneurs. C'est pourquoi Otekis prend en charge la gestion des livraisons. Nous nous occupons de l'expédition des produits directement aux clients, vous permettant ainsi de vous concentrer sur la vente et le marketing de votre boutique sans vous soucier des détails logistiques.",
  },
  {
    title: "Un modèle économique avantageux",
    icon: HandCoins,
    description:
      "En tant que vendeur sur Otekis, vous bénéficiez d'un systeme unique de choix sur le prix du produit, mettez le prix que vous voulez dependamment du prix initial dont le sur-plus sera votre benefice !",
  },
  {
    title: "Support et assistance",
    icon: Headset,
    description:
      "Nous savons qu'il est crucial d'avoir du soutien lors du lancement d'une nouvelle entreprise. C'est pourquoi notre équipe est disponible pour répondre à toutes vos questions et vous guider tout au long du processus. Que ce soit pour des conseils sur la personnalisation de votre boutique ou des stratégies marketing, nous sommes là pour vous aider à réussir.",
  },
];

export const MakeupData = [
  {
    value: "lipstick",
    label: "Rouge à lèvres",
  },
  {
    value: "mascara",
    label: "Mascara",
  },
  {
    value: "foundation",
    label: "Fond de teint",
  },
  {
    value: "eye-shadows",
    label: "Ombres à paupières",
  },
  {
    value: "blush",
    label: "Blush",
  },
  {
    value: "nail-polish",
    label: "Vernis à ongles",
  },
  {
    value: "nail-polish-remover",
    label: "Dissolvant de vernis à ongles",
  },
  {
    value: "makeup-remover",
    label: "Dissolvant de maquillage",
  },
];

export const SkinsCareData = [
  {
    value: "moisturizer",
    label: "Crèmes hydratantes",
  },
  {
    value: "toner",
    label: "Toner",
  },
  {
    value: "serum",
    label: "Serum",
  },
  {
    value: "lotion",
    label: "Lotions",
  },
  {
    value: "shampoo",
    label: "Shampoing",
  },
  {
    value: "mask",
    label: "Masques",
  },
  {
    value: "shower-gel",
    label: "Gel douche",
  },
  {
    value: "soap",
    label: "Savons",
  },
];

export const ParfumsData = [
  {
    value: "perfume",
    label: "Parfums",
  },
  {
    value: "eaux-de-toilettes",
    label: "Eaux de toilettes",
  },
  {
    value: "deodorant",
    label: "Déodorants",
  },
];

export const CosmeticsData = [
  ...MakeupData,
  ...SkinsCareData,
  ...ParfumsData,
  {
    value: "other",
    label: "Autre",
  },
];

export const AllProductsTypes = [
  ...TypeClothesData,
  ...AccessoriesData,
  ...CosmeticsData,
];

export const AllProductsTypesWithCategory = [
  ...TypeClothesData.map((type) => ({ ...type, category: "vetements" })),
  ...AccessoriesData.map((type) => ({ ...type, category: "accessoires" })),
  ...CosmeticsData.map((type) => ({ ...type, category: "cosmetiques" })),
];

export const NewAllProductsTypesWithCategory = [
  ...TypeClothesData.filter((type) => type.value !== "other").map((type) => ({
    ...type,
    value: `vetements-${type.value}`,
    category: "vetements",
  })),
  ...AccessoriesData.filter((type) => type.value !== "other").map((type) => ({
    ...type,
    value: `accessoires-${type.value}`,
    category: "accessoires",
  })),
  ...CosmeticsData.filter((type) => type.value !== "other").map((type) => ({
    ...type,
    value: `cosmetiques-${type.value}`,
    category: "cosmetiques",
  })),
  {
    value: "autres-other",
    label: "Autre",
    category: "autres",
  },
];
