"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Ban,
  CheckCircle2,
  UserCheck,
  UserX,
  Settings2,
  Store,
} from "lucide-react";
import { ProductShop, Shop } from "@prisma/client";
import { banishUser, changeUserRole } from "@/utils/userFunction";
import Link from "next/link";
import { returnRoleWith } from "@/utils/functions";

type User = {
  name: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isBanned: boolean;
  role: string;
  address: string | null;
  image: string | null;
  email: string | null;
  emailVerified: Date | null;
  password: string | null;
  tel: string | null;
};

export type ShopWIthProductShopType = Shop & {
  ProductShop: ProductShop[];
};

type ShopWIthProductShopProps = {
  user: User;
  shops: ShopWIthProductShopType[];
};

const roles = [
  { value: "user", label: "Client" },
  { value: "seller", label: "Vendeur" },
  { value: "employee", label: "Employé" },
  { value: "admin", label: "Administrateur" },
  { value: "super_admin", label: "Super Admin" },
];

export default function UserDetailPage({
  user,
  shops,
}: ShopWIthProductShopProps) {
  const router = useRouter();
  const [role, setRole] = useState(user.role);
  const [isBanned, setIsBanned] = useState(user.isBanned);
  const [loading, setLoading] = useState(false);

  // Changer rôle utilisateur
  async function handleChangeRole(newRole: string) {
    setLoading(true);
    try {
      const formData = {
        id: user.id,
        role: newRole,
      };
      // TODO: Appeler API pour changer rôle
      const updatedUser = await changeUserRole(formData);
      if (updatedUser.error) {
        toast.error("Erreur", {
          description: updatedUser.message,
        });
        return;
      }

      // await api.changeUserRole(user.id, newRole);
      setRole(newRole);
      toast.success("Rôle modifié avec succès");
      router.refresh();
    } catch (error) {
      toast.error("Erreur lors de la modification du rôle");
    } finally {
      setLoading(false);
    }
  }

  // Bannir / débannir utilisateur
  async function handleToggleBan() {
    setLoading(true);
    try {
      // TODO: Appeler API pour bannir/débannir
      const updatedUser = await banishUser(user.id);
      // await api.toggleBanUser(user.id, !isBanned);

      if (updatedUser.error) {
        toast.error("Erreur", {
          description: updatedUser.message,
        });
        return;
      }
      if (updatedUser.data) setIsBanned(updatedUser.data?.isBanned);
      toast.success(isBanned ? "Utilisateur débanni" : "Utilisateur banni");
      router.refresh();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      {/* Section Utilisateur */}
      <section className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-24 h-24">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name || "Avatar"} />
            ) : (
              <AvatarFallback>
                {user.name?.[0].toUpperCase() || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">
              {user.name || "Utilisateur"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {user.email || "Email non renseigné"}
            </p>
            <p className="text-sm text-muted-foreground">
              {user.tel || "Téléphone non renseigné"}
            </p>
            <p className="text-sm text-muted-foreground">
              {user.address || "Adresse non renseignée"}
            </p>
            <Badge variant={"outline"} className="mt-2">
              {returnRoleWith(user.role)}
            </Badge>
            <Badge
              variant={isBanned ? "destructive" : "secondary"}
              className="mt-2"
            >
              {isBanned ? "Banni" : "Actif"}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Changer rôle */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings2 className="w-4 h-4" /> Modifier rôle
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Modifier le rôle</DialogTitle>
              </DialogHeader>
              <Select
                value={role}
                onValueChange={(val) => setRole(val)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button
                  disabled={loading || role === user.role}
                  onClick={() => handleChangeRole(role)}
                  className="w-full"
                >
                  {loading ? "Modification..." : "Valider"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bannir / débannir */}
          <Button
            variant={isBanned ? "secondary" : "destructive"}
            size="sm"
            onClick={handleToggleBan}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {isBanned ? (
              <>
                <UserCheck className="w-4 h-4" /> Débannir
              </>
            ) : (
              <>
                <UserX className="w-4 h-4" /> Bannir
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Section Boutiques */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Store className="w-6 h-6" /> Boutiques (
          {shops.length.toString().padStart(2, "0")})
        </h2>
        {shops.length === 0 ? (
          <p className="text-muted-foreground">
            Cet utilisateur ne possède pas de boutique.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/${shop.slug}`}
                className="border rounded-lg p-4 flex flex-col space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 relative rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={shop.logo}
                      alt={shop.name}
                      width={300}
                      height={300}
                      className="object-cover h-full w-full rounded-md"
                      priority
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold truncate capitalize">
                      {shop.name}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {shop.category}
                    </p>
                    <div className="w-full flex items-center gap-4 mt-1 text-sm">
                      {/* banned */}
                      <Badge
                        variant={shop.isBanned ? "destructive" : "secondary"}
                      >
                        {shop.isBanned ? "Bannie" : "Active"}
                      </Badge>

                      {/* published */}
                      {!shop.isBanned && (
                        <Badge
                          variant={shop.isPublished ? "outline" : "secondary"}
                        >
                          {shop.isPublished ? "Publiée" : "Non publiée"}
                        </Badge>
                      )}
                      <p className="text-sm text-muted-foreground capitalize"></p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-between text-sm text-muted-foreground">
                  <div>
                    Produits :{" "}
                    <span className="font-semibold">
                      {shop.ProductShop
                        ? shop.ProductShop.length.toString().padStart(2, "0")
                        : "00"}
                    </span>
                  </div>
                  <div>
                    Créée le :{" "}
                    <span className="font-semibold">
                      {new Date(shop.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
