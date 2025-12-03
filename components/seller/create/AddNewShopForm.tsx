"use client";

import BorderWrapper from "@/components/BorderWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { storage } from "@/lib/firebase";
import { CategoriesData } from "@/utils/data";
import { isEmptyString } from "@/utils/functions";
import { Switch } from "@/components/ui/switch";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { X, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { v4 } from "uuid";
// import Link from "next/link";
import { SmoothLink } from "@/components/SmoothLink";
import { canUserCreateShop } from "@/actions/shopActions";

const AddNewShopForm = () => {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [paymentName, setPaymentName] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Drag & drop handlers for logo and cover (optional)
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (
      e: React.DragEvent,
      setFile: React.Dispatch<React.SetStateAction<File | null>>
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
      } else {
        toast.error("Merci de déposer une image valide.");
      }
    },
    [loading]
  );

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const uploadFile = async (file: File, pathPrefix: string) => {
    try {
      const fileId = v4().replace(/-/g, "");
      const storageRef = ref(storage, `oteki/shops/${pathPrefix}/${fileId}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error(`Error uploading ${pathPrefix}`, error);
      return "";
    }
  };

  const uploadLogo = () =>
    logo ? uploadFile(logo, "logos") : Promise.resolve("");
  const uploadCover = () =>
    cover ? uploadFile(cover, "covers") : Promise.resolve("");

  const handleSubmit = async () => {
    setLoading(true);
    let logoUrl = "";
    let coverUrl = "";
    try {
      const canCreateShop = await canUserCreateShop();

      if (canCreateShop !== true) {
        throw new Error(canCreateShop.message);
        // setLoading(false);
        return;
      }

      logoUrl = await uploadLogo();
      coverUrl = await uploadCover();

      if (!logoUrl) {
        throw new Error("Le logo est obligatoire et doit être valide.");
      }

      const formData = {
        name,
        description,
        category,
        logo: logoUrl,
        cover: coverUrl,
        paymentName,
        paymentPhone,
        isSellerTermsAccepted: acceptTerms,
      };

      const response = await fetch("/api/seller/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.message);
      }

      toast.success("Votre boutique a été créée avec succès.");
      // Reset form
      setName("");
      setDescription("");
      setCategory("");
      setLogo(null);
      setCover(null);
      setPaymentName("");
      setPaymentPhone("");
      setAcceptTerms(false);
      // Redirect to seller dashboard
      router.push(`/ma-boutique`);
    } catch (error) {
      // Cleanup uploaded files on error
      if (logoUrl) await deleteObject(ref(storage, logoUrl));
      if (coverUrl) await deleteObject(ref(storage, coverUrl));

      console.error("Error creating new shop", error);
      const err = error as Error;
      toast.error("Erreur lors de la création de votre boutique", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-6 gap-6 min-h-[24rem]">
      {/* LEFT SIDE - Informations */}
      <div className="lg:col-span-4 space-y-8">
        <BorderWrapper>
          <div className="space-y-8">
            {/* CATEGORY */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">
                Catégorie de votre boutique{" "}
                <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-3">
                {CategoriesData.map((cat) => {
                  const isAllowed =
                    cat.value.includes("vetements") ||
                    cat.value.includes("accessoires") ||
                    cat.value.includes("cosmetiques");
                  const isSelected = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      disabled={loading}
                      aria-pressed={isSelected}
                      onClick={() => {
                        if (!loading) {
                          if (isAllowed) {
                            setCategory(cat.value);
                          } else {
                            toast.error("Catégorie indisponible", {
                              description:
                                "Seules les ventes de vêtements, cosmétiques et accessoires sont disponibles actuellement.",
                            });
                          }
                        }
                      }}
                      className={`group flex flex-col items-center justify-center gap-1 rounded-md border-2 px-5 py-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary ${
                        isSelected
                          ? "border-primary bg-primary bg-opacity-10 text-white"
                          : "border-gray-300 text-gray-600 hover:border-primary hover:text-primary"
                      }`}
                    >
                      <cat.icon className={`w-7 h-7 `} aria-hidden="true" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-muted-foreground text-sm max-w-lg leading-snug">
                Cliquer pour choisir la catégorie de votre boutique.
                <br />
                <strong>Obligatoire :</strong> seulement vêtements, cosmétiques
                et accessoires sont disponibles.
              </p>
            </div>

            {/* SHOP INFO */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">
                Informations de la boutique{" "}
                <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-col space-y-4">
                <Input
                  placeholder="Nom de la boutique..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={3}
                  maxLength={60}
                  disabled={loading}
                  aria-label="Nom de la boutique"
                />
                <Textarea
                  placeholder="Décrire votre boutique... parler de votre expérience etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={10}
                  maxLength={5000}
                  disabled={loading}
                  className="min-h-[10rem]"
                  aria-label="Description de la boutique"
                />
              </div>
              <p className="mt-2 text-muted-foreground text-sm max-w-lg">
                <strong>NB:</strong> Le nom doit avoir au moins 3 caractères
                uniques.
                <br />
                La description doit contenir entre 10 et 5000 caractères.
              </p>
            </div>

            {/* PAYMENT INFO */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">
                Informations de paiement{" "}
                <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-col space-y-4">
                <Input
                  placeholder="John Doe"
                  value={paymentName}
                  onChange={(e) => setPaymentName(e.target.value)}
                  required
                  minLength={3}
                  maxLength={40}
                  disabled={loading}
                  aria-label="Nom pour paiement"
                />
                <Input
                  placeholder="819999999"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  required
                  minLength={9}
                  maxLength={9}
                  disabled={loading}
                  type="tel"
                  aria-label="Téléphone pour paiement"
                />
              </div>
              <p className="mt-2 text-muted-foreground text-sm max-w-lg">
                Les informations de paiement servent à vous envoyer vos gains.
              </p>
            </div>
          </div>
        </BorderWrapper>
      </div>

      {/* RIGHT SIDE - Logo & Cover */}
      <div className="lg:col-span-2 flex flex-col space-y-10">
        <BorderWrapper className="p-6 flex flex-col gap-6">
          {/* Logo */}
          <div
            onDrop={(e) => handleDrop(e, setLogo)}
            onDragOver={handleDragOver}
            className="relative border-2 border-dashed rounded-lg cursor-pointer p-4 hover:border-primary transition-colors focus-within:border-primary outline-none"
          >
            <Label
              htmlFor="upload-logo"
              className="block text-lg font-semibold mb-3"
            >
              Logo de la boutique <span className="text-destructive">*</span>
            </Label>

            {!logo ? (
              <>
                <input
                  type="file"
                  id="upload-logo"
                  ref={logoInputRef}
                  className="hidden"
                  accept="image/*"
                  disabled={loading}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files[0]) {
                      const file = files[0];

                      // Vérifier la taille du logo : max 2MB
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error(
                          "Le logo dépasse la taille maximale de 2 MB."
                        );
                        return;
                      }

                      setLogo(file);
                    }
                  }}
                />
                <div
                  className="flex flex-col items-center justify-center py-10 text-muted-foreground select-none"
                  onClick={() => !loading && logoInputRef.current?.click()}
                >
                  <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                  <span className="text-center text-sm">
                    Glisser & déposer un fichier ou clique pour sélectionner
                  </span>
                </div>
              </>
            ) : (
              <div className="relative flex items-center justify-center rounded overflow-hidden h-40">
                <Image
                  src={URL.createObjectURL(logo)}
                  alt="Logo de la boutique"
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <button
                  type="button"
                  aria-label="Supprimer le logo"
                  onClick={() => setLogo(null)}
                  className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-1 hover:bg-white shadow-md transition"
                  disabled={loading}
                >
                  <X className="w-5 h-5 text-destructive" />
                </button>
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Le logo est obligatoire avant de soumettre. Ne doit pas dépasser 2
              MB.
            </p>
          </div>

          {/* Cover */}
          <div
            onDrop={(e) => handleDrop(e, setCover)}
            onDragOver={handleDragOver}
            className="relative border-2 border-dashed rounded-lg cursor-pointer p-4 hover:border-primary transition-colors focus-within:border-primary outline-none"
          >
            <Label
              htmlFor="upload-cover"
              className="block text-lg font-semibold mb-3"
            >
              Couverture de la boutique (optionnel)
            </Label>

            {!cover ? (
              <>
                <input
                  type="file"
                  id="upload-cover"
                  ref={coverInputRef}
                  className="hidden"
                  accept="image/*"
                  disabled={loading}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files[0]) {
                      const file = files[0];

                      // Vérifier la taille du logo : max 2MB
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error(
                          "Le logo dépasse la taille maximale de 2 MB."
                        );
                        return;
                      }

                      setCover(file);
                    }
                  }}
                />
                <div
                  className="flex flex-col items-center justify-center py-14 text-muted-foreground select-none"
                  onClick={() => !loading && coverInputRef.current?.click()}
                >
                  <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                  <span className="text-center text-sm">
                    Glisser & déposer un fichier ou clique pour sélectionner
                  </span>
                </div>
              </>
            ) : (
              <div className="relative flex items-center justify-center rounded overflow-hidden h-52">
                <Image
                  src={URL.createObjectURL(cover)}
                  alt="Couverture de la boutique"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <button
                  type="button"
                  aria-label="Supprimer la couverture"
                  onClick={() => setCover(null)}
                  className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-1 hover:bg-white shadow-md transition"
                  disabled={loading}
                >
                  <X className="w-5 h-5 text-destructive" />
                </button>
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              La couverture est optionnelle. Ne doit pas dépasser 2 MB.
            </p>
          </div>
        </BorderWrapper>

        {/* TERMS SWITCH */}
        <BorderWrapper className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-lg font-semibold">
                Accepter les termes et conditions{" "}
                <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground max-w-xs">
                Vous devez accepter nos termes et conditions avant de créer une
                boutique.
              </p>
              <SmoothLink href="/conditions-et-termes#boutique">
                Lire les termes et conditions
              </SmoothLink>
            </div>
            <Switch
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked)}
              disabled={loading}
              aria-label="Accepter les termes et conditions"
            />
          </div>
        </BorderWrapper>

        {/* SUBMIT BUTTON */}
        <Button
          disabled={
            loading ||
            isEmptyString(name) ||
            isEmptyString(category) ||
            isEmptyString(description) ||
            !logo ||
            !acceptTerms
          }
          onClick={handleSubmit}
          size="lg"
          className="w-full py-5 font-semibold"
        >
          {loading ? "Création en cours..." : "Créer ma boutique"}
        </Button>
      </div>
    </div>
  );
};

export default AddNewShopForm;
