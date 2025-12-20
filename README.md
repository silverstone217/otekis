# 📦 Otekis - Solution E-commerce Clé en Main

**Otekis** est une plateforme SaaS (Software as a Service) innovante conçue pour permettre aux entrepreneurs de lancer leur boutique en ligne instantanément. Notre mission est de supprimer les barrières logistiques : les utilisateurs créent leur boutique et vendent, tandis qu'**Otekis** gère le stockage, les produits et la livraison.

---

## 🌟 Concept & Valeurs

Le modèle d'Otekis repose sur la simplification extrême du e-commerce :

- **Vendez sans stock :** Accédez à un catalogue de produits sélectionnés par nos soins.
- **Personnalisation No-Code :** Modifiez l'apparence de votre boutique via un dashboard intuitif.
- **Logistique Intégrée :** Nous gérons l'entreposage et l'expédition avec nos partenaires certifiés.
- **Focus Business :** Concentrez-vous sur le marketing et la relation client, nous faisons le reste.

---

## 🛠 Stack Technique

Ce projet est bâti sur une architecture moderne privilégiant la vitesse et la sécurité :

| Technologie      | Usage                                                |
| :--------------- | :--------------------------------------------------- |
| **Next.js v16**  | Framework React (App Router, Server Components)      |
| **TypeScript**   | Typage statique pour un code robuste                 |
| **Prisma**       | ORM pour la gestion de la base de données PostgreSQL |
| **NextAuth.js**  | Authentification sécurisée des marchands             |
| **Tailwind CSS** | Design responsive et utilitaire                      |
| **Shadcn UI**    | Composants d'interface haut de gamme                 |
| **Lucide React** | Bibliothèque d'icônes modernes                       |
| **Vercel**       | Déploiement et infrastructure Edge                   |

---

## 🚀 Fonctionnalités Clés

### 1. Espace Marchand (Dashboard)

- **Customizer :** Modification des thèmes, logos et couleurs de la boutique.
- **Gestion du Catalogue :** Sélection de produits parmi la liste mise à disposition par Otekis.
- **Suivi des Ventes :** Analyse des revenus et des commandes en temps réel.

### 2. Infrastructure Otekis

- **Sourcing :** Produits de haute qualité déjà intégrés.
- **Fullfillment :** Automatisation de la transmission des commandes vers la logistique.
- **Livraison :** Suivi automatisé des colis via nos partenaires.

---

## 💻 Installation (Développement)

Pour configurer l'environnement de développement local :

1.  **Cloner le dépôt**

    ```bash
    git clone [https://github.com/silverstone217/otekis.git](https://github.com/silverstone217/otekis.git)
    cd otekis-web
    ```

2.  **Installer les dépendances**

    ```bash
    npm install
    ```

3.  **Configuration de l'environnement**
    Créez un fichier `.env` à la racine :

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/otekis"
    NEXTAUTH_SECRET="votre_secret_ici"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4.  **Base de données**

    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Lancer l'application**
    ```bash
    npm run dev
    ```

---

## 📂 Structure du Projet

```text
├── actions/          # Les actions ou fonctions server pour palier aux API Rest
├── app/              # Routes Next.js (Admin, Storefront, API)
├── components/       # UI Components (Shadcn + Custom)
├── hooks/            # Logique React réutilisable
├── lib/              # Configuration Prisma, Auth et Utilitaires
├── prisma/           # Schéma de données et migrations
├── public/           # Assets statiques et images produits
├── schema/           # Schéma de données zod et validations des donnees
└── types/            # Définitions TypeScript
```

🛡️ Sécurité & Performance
Server Actions : Utilisation des dernières fonctionnalités de Next.js pour sécuriser les mutations de données.

Zod Validation : Validation stricte des schémas de données côté client et serveur.

Optimisation Image : Traitement dynamique des images produits pour un score Core Web Vitals optimal.

📄 Licence
Ce logiciel est la propriété exclusive de Otekis. Toute reproduction ou distribution non autorisée est strictement interdite.

© 2025 Otekis. Propulsé par l'innovation. by SERVI Group
