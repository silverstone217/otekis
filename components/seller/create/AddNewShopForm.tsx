"use client";
import BorderWrapper from "@/components/BorderWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { storage } from "@/lib/firebase";
import { CategoriesData } from "@/utils/data";
import { isEmptyString } from "@/utils/functions";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { v4 } from "uuid";

const AddNewShopForm = () => {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [logo, setLogo] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);

  const [paymentName, setPaymentName] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const uploadLogo = async () => {
    if (!logo) return;
    try {
      const logoId = v4().toString().replace(/-/g, "");
      const storageRef = ref(storage, `oteki/shops/logos/${logoId}`);
      const snapshot = await uploadBytes(storageRef, logo);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading logo", error);
      return "";
    }
  };

  const uploadCover = async () => {
    if (!cover) return;
    try {
      const coverId = v4().toString().replace(/-/g, "");
      const storageRef = ref(storage, `oteki/shops/covers/${coverId}`);
      const snapshot = await uploadBytes(storageRef, cover);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading cover", error);
      return "";
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    let logoUrl;
    let coverUrl;
    try {
      logoUrl = await uploadLogo();
      coverUrl = await uploadCover();

      if (!logoUrl) {
        throw new Error("Erreur lors de l'upload du logo");
      }

      const formData = {
        name,
        description,
        category,
        logo: logoUrl,
        cover: coverUrl,
        paymentName,
        paymentPhone,
      };
      // save to database
      const response = await fetch("/api/seller/create", {
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

      const shop = data.data;

      // success toast
      toast.success("Votre boutique a été créée avec succès.");
      console.log({ shop });
      // redirect to shop page
      setName("");
      setDescription("");
      setCategory("");
      setLogo(null);
      setCover(null);
      router.push(`/ma-boutique`);
    } catch (error) {
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
                      onClick={() => {
                        if (!loading) {
                          if (
                            cat.value.includes("vetements") ||
                            cat.value.includes("accessoires") ||
                            cat.value.includes("cosmetiques")
                          ) {
                            setCategory(cat.value);
                          } else {
                            toast.error("Catégorie indisponible", {
                              description:
                                "Pour le moment seulement les ventes de vetements, cosmétiques et accessoires sont disponibles.",
                            });
                          }
                        }
                      }}
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
                  Clicker pour choisir la catégorie de votre boutique. <br /> La
                  catégorie est obligatoire permet de specifier ce qui pourrait
                  être vendu dans votre boutique{" "}
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
                {!logo ? (
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
                  <div className="w-full h-full rounded relative transition-all duration-500 ease-in-out">
                    <Image
                      src={URL.createObjectURL(logo)}
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
                      }}
                    >
                      <X className="w-8 text-destructive" />
                    </span>
                  </div>
                )}
              </div>
            </BorderWrapper>

            {/* image cover boutique */}
            <BorderWrapper>
              <div className="w-full flex flex-col gap-2 item-center transition-all duration-500 ease-in-out">
                <label className="text-[18px] font-bold">
                  Couverture de la boutique
                </label>
                {!cover ? (
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
                      className={` w-full min-h-44 p-4 border-2 border-gray-300 
                        rounded-lg cursor-pointer bg-gray-100 flex items-center justify-center text-center ${
                          loading ? "bg-gray-300 cursor-not-allowed" : ""
                        }`}
                    >
                      Choisir une image de couverture
                    </label>
                  </div>
                ) : (
                  <div className="w-full h-full rounded relative transition-all duration-500 ease-in-out">
                    <Image
                      src={URL.createObjectURL(cover)}
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
                      }}
                    >
                      <X className="w-8 text-destructive" />
                    </span>
                  </div>
                )}
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

      {/* submit */}
      <div className="flex w-full mt-10 lg:col-span-4">
        <Button
          onClick={handleSubmit}
          disabled={
            loading ||
            isEmptyString(name) ||
            isEmptyString(category) ||
            isEmptyString(description) ||
            !logo
          }
          className="w-full py-5"
        >
          {loading ? "En cours..." : "Créer"}
        </Button>
      </div>
    </div>
  );
};

export default AddNewShopForm;
