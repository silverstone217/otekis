"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import BorderWrapper from "../BorderWrapper";
import Image from "next/image";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import { CategoriesData } from "@/utils/data";
import { isEmptyString } from "@/utils/functions";
import { storage } from "@/lib/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { v4 } from "uuid";
import { X, Trash2, PauseCircle, PlayCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  deleteShop,
  sellerBanOrPublish,
  updateShopCover,
  updateShopLogo,
} from "@/actions/shopActions";

import { cn } from "@/lib/utils";
import { Shop } from "@/lib/generated/prisma/client";
import { useCurrentUser } from "@/hooks/UserAuth";

type Props = {
  shop: Shop;
};

const ModifyShopSellerForm: React.FC<Props> = ({ shop }) => {
  const router = useRouter();
  const [category] = useState(shop.category ?? "");
  const [name, setName] = useState(shop.name ?? "");
  const [description, setDescription] = useState(shop.description ?? "");

  const [logo, setLogo] = useState<File | null>(null);
  const [visualizeLogo, setVisualizeLogo] = useState(shop.logo ?? "");
  const [cover, setCover] = useState<File | null>(null);
  const [visualizeCover, setVisualizeCover] = useState(shop.cover ?? "");

  const [paymentName, setPaymentName] = useState(shop.paymentName ?? "");
  const [paymentPhone, setPaymentPhone] = useState(shop.paymentPhone ?? "");

  const [loading, setLoading] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const user = useCurrentUser();

  // handle file drop
  const handleDrop = useCallback(
    (
      e: React.DragEvent,
      setFile: React.Dispatch<React.SetStateAction<File | null>>,
      type: "cover" | "logo",
    ) => {
      e.preventDefault();
      if (loading) return;

      const file = e.dataTransfer.files[0];

      if (file && file.type.startsWith("image/")) {
        // Vérification taille max 2MB
        if (file.size > 2 * 1024 * 1024) {
          toast.error("L’image dépasse la taille maximale de 2 MB.");
          return;
        }

        setFile(file);

        if (type === "cover") {
          setVisualizeCover(URL.createObjectURL(file));
        } else {
          setVisualizeLogo(URL.createObjectURL(file));
        }
      } else {
        toast.error("Merci de déposer une image valide.");
      }
    },
    [loading],
  );

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  // update shop logo
  const uploadLogo = async () => {
    if (!logo || !user) return;

    if (user.id !== shop.userId) return;

    setLoading(true);
    try {
      const storageRef = ref(
        storage,
        `oteki/shops/logos/${v4().replace(/-/g, "")}`,
      );

      if (shop.logo) {
        await deleteObject(ref(storage, shop.logo));
      }

      const snapshot = await uploadBytes(storageRef, logo);
      const url = await getDownloadURL(snapshot.ref);

      const result = await updateShopLogo(shop.id, url);

      if (result.error) {
        toast.error(result.message || "Erreur lors de la mise à jour du logo");
        // await deleteObject(ref(storage, url));
        setLoading(false);
        return;
      }

      toast.success("Le logo a été chargé avec succès !");
      setVisualizeLogo(url);
      setLogo(null);
      router.refresh();
    } catch (e) {
      console.error("Error uploading logo", e);
      toast.error("Erreur lors de l'upload du logo");
    } finally {
      setLoading(false);
    }
  };

  // update shop image cover
  const uploadCover = async () => {
    setLoading(true);
    try {
      if (!user) return;

      if (user.id !== shop.userId) return;

      if (!cover) {
        if (shop.cover) {
          await deleteObject(ref(storage, shop.cover));
        }
        // const updateCoverResult = await updateShopCover(shop.id, null);
        await updateShopCover(shop.id, null);
        setVisualizeCover("");

        setCover(null);
        toast.success("La cover a été supprimée !");
      } else {
        const coverId = v4().replace(/-/g, "");
        const path = shop.cover || `oteki/shops/covers/${coverId}`;
        const storageRef = ref(storage, path);

        const snapshot = await uploadBytes(storageRef, cover);
        const coverUrl = await getDownloadURL(snapshot.ref);

        if (!coverUrl) {
          toast.error("Erreur lors de l'upload de la cover");
          setLoading(false);
          return;
        }

        const updateCoverResult = await updateShopCover(shop.id, coverUrl);
        if (!updateCoverResult) {
          toast.error("Erreur lors de la mise à jour de la cover");
          await deleteObject(ref(storage, coverUrl));
          setLoading(false);
          return;
        }

        toast.success("Cover modifiée avec succès !");
        setVisualizeCover(updateCoverResult.cover ?? "");
        setCover(null);
        router.refresh();
      }
    } catch (e) {
      console.error("Error uploading cover", e);
      toast.error("Erreur lors de la gestion de la cover");
    } finally {
      setLoading(false);
    }
  };

  // modify shop info
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = {
        name: name.toLocaleLowerCase().trim(),
        description: description.trim(),
        category,
        shopId: shop.id,
        paymentName,
        paymentPhone,
      };
      const resp = await fetch("/api/seller/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await resp.json();

      if (data.error) throw new Error(data.message);

      const updatedShop = data.data as Shop;
      toast.success("Votre boutique a été modifiée avec succès.");
      router.replace(`/ma-boutique/${updatedShop.slug}`);
      router.refresh();
    } catch (e) {
      const err = e as Error;
      toast.error("Erreur lors de la modification de la boutique", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Détecte si les données ont changé pour activer le bouton modifier
  const isUnchanged =
    name === shop.name &&
    description === shop.description &&
    category === shop.category &&
    paymentName === shop.paymentName &&
    paymentPhone === shop.paymentPhone;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-6 gap-6 min-h-96">
      {/* Infos et champs */}
      <div className="lg:col-span-4 space-y-8">
        <BorderWrapper>
          <div className="space-y-6">
            {/* Catégories */}
            <div>
              <Label className="text-lg font-semibold mb-4">
                Catégorie de votre boutique{" "}
                <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-3">
                {CategoriesData.map((cat) => {
                  const isSelected = cat.value === category;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      disabled={loading}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-md border-2 px-5 py-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1",
                        isSelected
                          ? "border-primary bg-primary bg-opacity-10 text-primary"
                          : "border-gray-300 text-gray-600 hover:border-primary hover:text-primary",
                      )}
                      onClick={() => {
                        if (loading) return;
                        if (cat.value === category) return;
                        toast.error(
                          "La categorie de la boutique n'est pas modifiable.",
                        );
                      }}
                      aria-pressed={isSelected}
                    >
                      <cat.icon aria-hidden="true" className="w-7 h-7 mb-1" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Infos Shop */}
            <div>
              <Label className="text-lg font-semibold mb-4">
                Informations de la boutique{" "}
                <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-4">
                <Input
                  placeholder="Nom de la boutique..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={3}
                  maxLength={60}
                  disabled={loading}
                  aria-label="Nom de la boutique"
                />
                <Textarea
                  placeholder="Décrire votre boutique, votre expérience, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  minLength={10}
                  maxLength={5000}
                  disabled={loading}
                  className="min-h-40"
                  aria-label="Description de la boutique"
                />
              </div>
            </div>

            {/* Paiement */}
            <div>
              <Label className="text-lg font-semibold mb-4">
                Informations de paiement
                <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-4">
                <Input
                  placeholder="John Doe"
                  value={paymentName}
                  onChange={(e) => setPaymentName(e.target.value)}
                  minLength={3}
                  maxLength={40}
                  disabled={loading}
                  aria-label="Nom pour paiement"
                />
                <Input
                  placeholder="819999999"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  minLength={9}
                  maxLength={9}
                  disabled={loading}
                  type="tel"
                  aria-label="Téléphone pour paiement"
                />
              </div>
            </div>

            {/* Bouton Submit */}
            <div className="pt-6">
              <Button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  isEmptyString(name) ||
                  isEmptyString(category) ||
                  isEmptyString(description) ||
                  isEmptyString(paymentName) ||
                  isEmptyString(paymentPhone) ||
                  isUnchanged
                }
                className="w-full py-5 font-semibold"
                size="lg"
              >
                {loading ? "En cours..." : "Modifier la boutique"}
              </Button>
            </div>
          </div>
        </BorderWrapper>
      </div>

      {/* Upload logo & cover */}
      <div className="lg:col-span-2 flex flex-col gap-10">
        <BorderWrapper className="p-6 flex flex-col gap-6">
          {/* Logo */}
          <div
            className="relative border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary"
            onDrop={(e) => handleDrop(e, setLogo, "logo")}
            onDragOver={handleDragOver}
            onClick={() => !loading && logoInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!loading && logoInputRef.current?.click()) {
                  logoInputRef.current.click();
                }
              }
            }}
          >
            <Label className="block text-lg font-semibold mb-3 cursor-pointer">
              Logo de la boutique <span className="text-destructive">*</span>
            </Label>

            <input
              id="file-logo"
              type="file"
              accept="image/*"
              ref={logoInputRef}
              onChange={(e) => {
                const files = e.target.files;
                if (files && files[0]) {
                  const file = files[0];

                  // Vérifier la taille du logo : max 2MB
                  if (file.size > 2 * 1024 * 1024) {
                    toast.error("Le logo dépasse la taille maximale de 2 MB.");
                    return;
                  }

                  setLogo(file);
                  setVisualizeLogo(URL.createObjectURL(file));
                }
              }}
              className="hidden"
              disabled={loading}
            />

            {!logo && !visualizeLogo ? (
              <div className="py-14 flex flex-col items-center justify-center text-muted-foreground select-none">
                <UploadCloud className="w-10 h-10 mb-3" />
                <p>Glisser/déposer ou cliquez pour choisir un logo</p>
              </div>
            ) : (
              <div className="relative h-40 rounded overflow-hidden">
                <Image
                  src={logo ? URL.createObjectURL(logo) : visualizeLogo}
                  alt="Logo boutique"
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <button
                  type="button"
                  aria-label="Supprimer le logo"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogo(null);
                    setVisualizeLogo("");
                  }}
                  className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-1 shadow hover:bg-white transition"
                  disabled={loading}
                >
                  <X className="w-5 h-5 text-destructive" />
                </button>
              </div>
            )}
          </div>

          {/* Upload logo submit */}
          <Button
            onClick={uploadLogo}
            disabled={loading || !logo}
            className="w-full py-4 font-semibold"
          >
            {loading ? "Chargement…" : "Modifier le Logo"}
          </Button>

          {/* Cover */}
          <div
            className="relative border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary"
            onDrop={(e) => handleDrop(e, setCover, "cover")}
            onDragOver={handleDragOver}
            onClick={() => !loading && coverInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!loading && coverInputRef.current?.click()) {
                  coverInputRef.current.click();
                }
              }
            }}
          >
            <Label className="block text-lg font-semibold mb-3 cursor-pointer">
              Couverture de la boutique (optionnel)
            </Label>

            <input
              id="file-cover"
              type="file"
              accept="image/*"
              ref={coverInputRef}
              onChange={(e) => {
                const files = e.target.files;
                if (files && files[0]) {
                  const file = files[0];

                  // Vérifier la taille : 2MB = 2 * 1024 * 1024
                  if (file.size > 2 * 1024 * 1024) {
                    toast.error("L'image dépasse la taille maximale de 2 MB.");
                    return;
                  }

                  setCover(file);
                  setVisualizeCover(URL.createObjectURL(file));
                }
              }}
              className="hidden"
              disabled={loading}
            />

            {!cover && !visualizeCover ? (
              <div className="py-20 flex flex-col items-center justify-center text-muted-foreground select-none">
                <UploadCloud className="w-10 h-10 mb-3" />
                <p>Glisser/déposer ou cliquez pour choisir une couverture</p>
              </div>
            ) : (
              <div className="relative h-52 rounded overflow-hidden">
                <Image
                  src={cover ? URL.createObjectURL(cover) : visualizeCover}
                  alt="Cover boutique"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <button
                  type="button"
                  aria-label="Supprimer la couverture"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCover(null);
                    setVisualizeCover("");
                  }}
                  className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-1 shadow hover:bg-white transition"
                  disabled={loading}
                >
                  <X className="w-5 h-5 text-destructive" />
                </button>
              </div>
            )}
          </div>

          {/* Upload cover submit */}
          <Button
            onClick={uploadCover}
            disabled={
              loading ||
              !shop ||
              (visualizeCover === "" && shop.cover === null && !cover) ||
              visualizeCover === shop.cover
            }
            className="w-full py-4 font-semibold"
          >
            {loading ? "Chargement…" : "Modifier la couverture"}
          </Button>

          <p className="text-sm text-muted-foreground mt-2">
            <strong>Important :</strong> Le logo est obligatoire, la couverture
            est optionnelle. Ne doit pas dépasser 2 MB chacune.
          </p>
        </BorderWrapper>
      </div>
    </div>
  );
};

export default ModifyShopSellerForm;

export const DangerZoneSection: React.FC<Props> = ({ shop }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [loading, setLoading] = useState(false);

  const isPublished = useMemo(() => shop.isPublished, [shop.isPublished]);
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handlePublishShop = async () => {
    setLoading(true);
    try {
      const res = await sellerBanOrPublish({
        shopId: shop.id,
        isPublished: !isPublished,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(res.message);
      router.refresh();
    } catch (e) {
      toast.error("Oops ! Une erreur est survenue.");
      console.error(e);
    } finally {
      setLoading(false);
      setOpenPublishDialog(false);
    }
  };

  const handleDeleteShop = async () => {
    setLoading(true);
    try {
      const result = await deleteShop(shop.id);

      if (result.error) {
        toast.error(result.message);
        return;
      }

      if (shop.cover) await deleteObject(ref(storage, shop.cover));
      if (shop.logo) await deleteObject(ref(storage, shop.logo));

      toast.success("Votre boutique a été supprimée avec succès !");
      router.refresh();
      location.replace("/ma-boutique");
    } catch (e) {
      toast.error("Oops ! Une erreur est survenue.");
      console.error(e);
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
    }
  };

  return (
    <BorderWrapper>
      <div className="max-w-md mx-auto p-6 flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-red-600">Zone de danger</h2>

        {/* Publier / Suspendre */}
        <AlertDialog
          open={openPublishDialog}
          onOpenChange={setOpenPublishDialog}
        >
          <AlertDialogTrigger asChild>
            <Button
              variant={isPublished ? "destructive" : "outline"}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                isPublished
                  ? "border-red-600 hover:bg-red-600 hover:text-white"
                  : "",
              )}
              disabled={loading || !shop}
            >
              {isPublished ? (
                <>
                  <PauseCircle className="w-5 h-5" />
                  Suspendre ma boutique
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" />
                  Publier ma boutique
                </>
              )}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isPublished
                  ? "Suspendre la boutique ?"
                  : "Publier la boutique ?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isPublished
                  ? "Voulez-vous vraiment suspendre votre boutique ? Elle ne sera plus visible publiquement."
                  : "Voulez-vous publier votre boutique ? Elle sera visible par tous les clients."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handlePublishShop}
                disabled={loading}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isPublished ? "Suspendre" : "Publier"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Supprimer */}
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full flex items-center justify-center gap-2"
              disabled={loading || !shop || !user}
            >
              <Trash2 className="w-5 h-5" />
              Supprimer ma boutique
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la boutique ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Toutes les informations et
                contenus associés seront définitivement supprimés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteShop}
                disabled={loading}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-sm text-muted-foreground max-w-sm">
          Vous pouvez supprimer toutes les informations de votre boutique et
          tout son contenu. Vous ne pourrez pas revenir en arrière.
        </p>
      </div>
    </BorderWrapper>
  );
};
