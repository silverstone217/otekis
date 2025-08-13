"use client";
import { Shop } from "@prisma/client";
import React, { useMemo, useState } from "react";
import BorderWrapper from "../BorderWrapper";
import Image from "next/image";
import { Button } from "../ui/button";
import { PauseCircle, PlayCircle, Trash2, X } from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import { CategoriesData } from "@/utils/data";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "@/lib/firebase";
import { v4 } from "uuid";
import { isEmptyString } from "@/utils/functions";
import {
  deleteShop,
  sellerBanOrPublish,
  updateShopCover,
} from "@/actions/shopActions";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
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

type Props = {
  shop: Shop;
};

const ModifyShopSellerForm = ({ shop }: Props) => {
  const [category, _setCategory] = useState(shop.category ?? "");
  const [name, setName] = useState(shop.name ?? "");
  const [description, setDescription] = useState(shop.description ?? "");

  const [logo, setLogo] = useState<File | null>(null);
  const [visualizeLogo, setVisualizeLogo] = useState(shop.logo ?? "");
  const [cover, setCover] = useState<File | null>(null);
  const [visualizeCover, setVisualizeCover] = useState(shop.cover ?? "");

  const [paymentName, setPaymentName] = useState(shop.paymentName ?? "");
  const [paymentPhone, setPaymentPhone] = useState(shop.paymentPhone ?? "");

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const uploadLogo = async () => {
    if (!logo) return;
    let imgUrl: string = "";
    try {
      const storageRef = ref(storage, `${shop.logo}`);
      const snapshot = await uploadBytes(storageRef, logo);
      imgUrl = await getDownloadURL(snapshot.ref);

      if (!imgUrl) {
        toast.error("Erreur", {
          description: "Une erreur s'est produite lors de l'upload du logo",
        });
        return;
      }

      toast.success("Le logo a été chargé avec succès!");
      setVisualizeLogo(imgUrl);
      setLogo(null);
      router.refresh();
    } catch (error) {
      console.error("Error uploading logo", error);
      return "";
    }
  };

  const uploadCover = async () => {
    if (!cover) {
      if (shop.cover) {
        await deleteObject(ref(storage, shop.cover));
      }

      //   send url to backend
      const noUrl = null;
      const updateCover = await updateShopCover(shop.id, noUrl);

      setVisualizeCover("");
      shop.cover = updateCover?.cover ?? null;
      setCover(null);
      toast.success("La cover a été supprimée!");
      return;
    }
    let coverUrl;
    try {
      const coverId = v4().toString().replace(/-/g, "");
      const coverNew = shop.cover
        ? shop.cover
        : `oteki/shops/covers/${coverId}`;
      const storageRef = ref(storage, `${coverNew}`);
      const snapshot = await uploadBytes(storageRef, cover);
      coverUrl = await getDownloadURL(snapshot.ref);

      //   cant upload to firebase
      if (!coverUrl) {
        toast.error("Erreur", {
          description: "Une erreur s'est produite lors de l'upload de la cover",
        });
        return;
      }

      //   send url to backend
      const updateCover = await updateShopCover(shop.id, coverUrl);

      //   backend error
      if (!updateCover) {
        toast("Une erreur s'est produite lors de la mise à jour de la cover ");
        if (coverUrl) {
          await deleteObject(ref(storage, coverUrl));
        }
        return;
      }

      //   success
      toast.success("Cover modifiée", {
        description: "La cover a été modifiée avec succès",
      });
      setVisualizeCover(updateCover.cover ?? "");
      shop.cover = updateCover.cover;
      setCover(null);
      router.refresh();
    } catch (error) {
      console.error("Error uploading cover", error);

      return "";
    }
  };
  // modify name, description and category
  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formData = {
        name,
        description,
        category,
        shopId: shop.id,
        paymentName,
        paymentPhone,
      };
      // save to database
      const response = await fetch("/api/seller/modify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.message);
      }

      const resShop = data.data as Shop;

      // success toast
      toast.success("Votre boutique a été modifiée avec succès.");
      // redirect to shop page
      shop = {
        ...resShop,
      };

      location.replace(`/ma-boutique/${resShop.slug}`);

      router.refresh();
    } catch (error) {
      //   logoUrl && (await deleteObject(ref(storage, logoUrl)));
      console.error("Error updating the shop", error);
      const err = error as Error;
      toast.error("Erreur lors de la modification de votre boutique", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-6 min-h-96 gap-4">
      {/* infos details */}
      <div className="lg:col-span-4 col-span-1 space-y-6 ">
        <BorderWrapper>
          <div className="space-y-4">
            {/* Category */}
            <BorderWrapper>
              <div className="space-y-2.5">
                <Label className="text-[18px] font-bold">
                  Catégorie de votre boutique *
                </Label>
                {/* cat */}
                <div className="w-full flex flex-wrap gap-2">
                  {CategoriesData.map((cat, idx) => (
                    <div
                      key={idx}
                      role="button"
                      // onClick={() => !loading && setCategory(cat.value)}
                      className={`group p-4 item-center border-2 
                       hover:border-primary flex flex-col gap-2
                       text-sm transition-all duration-500 ease-in-out rounded
                       ${
                         category === cat.value
                           ? "border-primary border-2 text-primary"
                           : " text-gray-500 border-gray-300"
                       }
                       `}
                    >
                      <cat.icon className="w-8 flex-shrink-0 self-center " />
                      <span className="text-sm ">{cat.label}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-gray-600 text-sm">
                  Clicker pour choisir la categorie de votre boutique. <br /> La
                  categorie est obligatoire permet de specifier ce qui pourrait
                  etre vendu dans votre boutique{" "}
                </p>
              </div>
            </BorderWrapper>

            {/* name, desc */}
            <BorderWrapper>
              <div className="space-y-2.5 w-full">
                <Label className="text-[18px] font-bold">
                  Information de la boutique *
                </Label>
                <div className="w-full flex flex-col gap-4">
                  {/* nom */}
                  <Input
                    placeholder="Nom de la boutique..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={3}
                    maxLength={40}
                    disabled={loading}
                  />

                  {/* description */}
                  <Textarea
                    placeholder="Décrire votre boutique... parler de votre experience etc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    minLength={10}
                    maxLength={5000}
                    disabled={loading}
                    className="max-h-72 min-h-36"
                  />
                </div>

                <p className="mt-2 text-gray-600 text-sm">
                  <strong>NB: </strong>
                  Le nom doit être unique et composé d au moins 3 characters.
                  <br /> La Description doit être composée entre 10-500
                  characters.
                </p>
              </div>
            </BorderWrapper>

            {/* Payment info */}
            <BorderWrapper>
              <div className="space-y-2.5 w-full">
                <Label className="text-[18px] font-bold">
                  Information de Paiement
                </Label>
                <div className="w-full flex flex-col gap-4">
                  {/* nom de paiement*/}
                  <Input
                    placeholder="jonh doe"
                    value={paymentName}
                    onChange={(e) => setPaymentName(e.target.value)}
                    required
                    minLength={3}
                    maxLength={40}
                    disabled={loading}
                  />

                  {/* nom de paiement*/}
                  <Input
                    placeholder="817777777"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    required
                    minLength={9}
                    maxLength={9}
                    disabled={loading}
                    type="tel"
                  />
                </div>
                <p className="mt-2 text-gray-600 text-sm">
                  <strong>NB: </strong>
                  Les informations de paiement sont utilisées pour vous envoyer
                  vos gains effectués
                </p>
              </div>
            </BorderWrapper>

            {/* submit */}
            <div className="flex w-full mt-10 lg:col-span-4">
              <Button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  isEmptyString(name) ||
                  isEmptyString(category) ||
                  isEmptyString(description) ||
                  isEmptyString(paymentName) ||
                  isEmptyString(paymentPhone) ||
                  (shop.name === name &&
                    description === shop.description &&
                    category === shop.category &&
                    paymentName === shop.paymentName &&
                    paymentPhone === shop.paymentPhone)
                }
                className="w-full py-5"
              >
                {loading ? "En cours..." : "Modifier"}
              </Button>
            </div>
          </div>
        </BorderWrapper>
      </div>

      {/* logo and cover */}
      <div className="lg:col-span-2 col-span-1">
        <BorderWrapper>
          <div className="w-full flex flex-col gap-4">
            {/* image profile boutique */}
            <BorderWrapper>
              <div className="w-full flex flex-col gap-2 item-center transition-all duration-500 ease-in-out">
                <label className="text-[18px] font-bold">
                  Logo de la boutique *
                </label>
                {!logo && !visualizeLogo ? (
                  <div className="flex justify-center items-center transition-all duration-500 ease-in-out">
                    <Input
                      type="file"
                      accept="image/*"
                      id="file-upload"
                      onChange={(e) => {
                        const img = e.target.files;
                        if (img) {
                          setLogo(img[0]);
                          return;
                        }
                        setLogo(null);
                      }}
                      required
                      disabled={loading}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className={` w-full h-36 p-4 border-2 border-gray-300 
                            rounded-lg cursor-pointer bg-gray-100 flex items-center justify-center text-center ${
                              loading ? "bg-gray-300 cursor-not-allowed" : ""
                            }`}
                    >
                      Choisir un logo
                    </label>
                  </div>
                ) : (
                  <div className="w-full h-44 rounded relative transition-all duration-500 ease-in-out">
                    <Image
                      src={logo ? URL.createObjectURL(logo) : visualizeLogo}
                      alt="image de la boutique"
                      width={1500}
                      height={1500}
                      priority
                      className="w-full h-full object-cover"
                    />
                    <span
                      className="absolute top-1 right-1 text-sm text-destructive 
                          cursor-pointer bg-overlay2 rounded-lg"
                      onClick={() => {
                        setLogo(null);
                        setVisualizeLogo("");
                      }}
                    >
                      <X className="w-8 text-destructive" />
                    </span>
                  </div>
                )}

                {/* submit */}
                <div className="flex w-full mt-10 lg:col-span-4">
                  <Button
                    onClick={uploadLogo}
                    disabled={loading || !logo}
                    className="w-full py-5"
                  >
                    {loading ? "En cours..." : "Modifier"}
                  </Button>
                </div>
              </div>
            </BorderWrapper>

            {/* image cover boutique */}
            <BorderWrapper>
              <div className="w-full flex flex-col gap-2 item-center transition-all duration-500 ease-in-out">
                <label className="text-[18px] font-bold">
                  Couverture de la boutique
                </label>
                {!cover && !visualizeCover ? (
                  <div className="flex justify-center items-center transition-all duration-500 ease-in-out">
                    <Input
                      type="file"
                      accept="image/*"
                      id="file-upload-cover"
                      onChange={(e) => {
                        const img = e.target.files;
                        if (img) {
                          setCover(img[0]);
                          return;
                        }
                        setCover(null);
                      }}
                      required
                      disabled={loading}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload-cover"
                      className={` w-full h-52 p-4 border-2 border-gray-300 
                            rounded-lg cursor-pointer bg-gray-100 flex items-center justify-center text-center ${
                              loading ? "bg-gray-300 cursor-not-allowed" : ""
                            }`}
                    >
                      Choisir une image de couverture
                    </label>
                  </div>
                ) : (
                  <div className="w-full h-52 rounded relative transition-all duration-500 ease-in-out">
                    <Image
                      src={cover ? URL.createObjectURL(cover) : visualizeCover}
                      alt="cover de la boutique"
                      width={1500}
                      height={1500}
                      priority
                      className="w-full h-full object-cover"
                    />
                    <span
                      className="absolute top-1 right-1 text-sm text-destructive 
                          cursor-pointer bg-overlay2 rounded-lg"
                      onClick={() => {
                        setCover(null);
                        setVisualizeCover("");
                      }}
                    >
                      <X className="w-8 text-destructive" />
                    </span>
                  </div>
                )}
                {/* submit */}
                <div className="flex w-full mt-10 lg:col-span-4">
                  <Button
                    onClick={() => {
                      //   console.log({ vis: visualizeCover, cover: shop.cover });
                      uploadCover();
                    }}
                    disabled={
                      loading ||
                      !shop ||
                      (visualizeCover === "" &&
                        shop.cover === null &&
                        !cover) ||
                      visualizeCover === shop.cover
                    }
                    className="w-full py-5"
                  >
                    {loading ? "En cours..." : "Modifier"}
                  </Button>
                </div>
              </div>
            </BorderWrapper>
            <p className="mt-2 text-gray-600 text-sm">
              <strong>
                Le Logo est obligatoire avant de soumettre
                <br /> La cover quant à elle est optionnelle.
              </strong>
            </p>
          </div>
        </BorderWrapper>
      </div>
    </div>
  );
};

export default ModifyShopSellerForm;

export const DangerZoneSection = ({ shop }: Props) => {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const isPublished = useMemo(() => shop.isPublished, [shop.isPublished]);
  const [loading, setLoading] = useState(false);

  // États pour les dialogues de confirmation
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Action publier/suspendre boutique
  const handlePublishShop = async () => {
    setLoading(true);
    try {
      const formData = { shopId: shop.id, isPublished: !isPublished };
      const updateStatus = await sellerBanOrPublish(formData);

      if (updateStatus.error) {
        toast.error(updateStatus.error);
        return;
      }

      toast.success(updateStatus.message);

      // Mise à jour locale possible si tu utilises un state global ou contexte
      // Ici on force un refresh de la page
      router.refresh();
    } catch (error) {
      toast.error("Oops!, une erreur est survenue!");
      console.error(error);
    } finally {
      setLoading(false);
      setOpenPublishDialog(false);
    }
  };

  // Action suppression boutique
  const handleDeleteShop = async () => {
    setLoading(true);
    try {
      const result = await deleteShop(shop.id);
      if (result.error) {
        toast.error(result.message);
        return;
      }

      if (shop.cover) {
        await deleteObject(ref(storage, shop.cover));
      }
      if (shop.logo) {
        await deleteObject(ref(storage, shop.logo));
      }

      toast.success("Votre boutique a été supprimée avec succès!");
      router.refresh();
      location.replace("/ma-boutique");
    } catch (error) {
      toast.error("Oops!, une erreur est survenue!");
      console.error(error);
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
    }
  };

  return (
    <BorderWrapper>
      <div className="flex flex-col gap-6 max-w-md mx-auto p-6">
        <h2 className="text-xl font-semibold text-red-600">Zone de danger</h2>

        {/* Bouton publier/suspendre avec confirmation */}
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
                  : ""
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

        {/* Bouton supprimer avec confirmation */}
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

        <p className="text-sm text-gray-600 max-w-sm">
          Vous pouvez supprimer toutes les informations de votre boutique et
          tout son contenu. Vous ne pourrez pas revenir en arrière.
        </p>
      </div>
    </BorderWrapper>
  );
};
