"use client";
import BorderWrapper from "@/components/BorderWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { storage } from "@/lib/firebase";
import {
  AccessoriesData,
  CategoriesData,
  CosmeticsData,
  MaterialsAccData,
  QualitiesData,
  StatesData,
  TargetData,
  TypeClothesData,
} from "@/utils/data";
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

const AddProductForm = () => {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);

  // const [stock, setStock] = useState("");
  const [state, setState] = useState("nouveau");
  const [quality, setQuality] = useState("original");

  const [target, setTarget] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [material, setMaterial] = useState("");

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddImage = async () => {
    let imgUrl: string = "";
    if (!image) return;
    try {
      const imgId = v4().toString().replace(/-/g, "");
      const storageRef = ref(storage, `oteki/products/images/${imgId}`);
      const snapshot = await uploadBytes(storageRef, image);
      imgUrl = await getDownloadURL(snapshot.ref);

      return imgUrl;
    } catch (error) {
      console.error("Error uploading image", error);
      return (imgUrl = "");
    }
  };
  const handleAddImages = async () => {
    let imgUrls: string[] = [];
    if (!images.length) return;
    try {
      for (const img of images) {
        const imgId = v4().toString().replace(/-/g, "");
        const storageRef = ref(storage, `oteki/products/images/${imgId}`);
        const snapshot = await uploadBytes(storageRef, img);
        imgUrls.push(await getDownloadURL(snapshot.ref));
      }

      return imgUrls;
    } catch (error) {
      console.error("Error uploading images", error);
      return (imgUrls = []);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    let imgUrl;
    let imgUrls: string[] = [];
    try {
      imgUrl = await handleAddImage();
      imgUrls = (await handleAddImages()) ?? [];

      if (!imgUrl) {
        toast.error("Erreur lors de l'enregistrement du produit", {
          description:
            "Une erreur s'est produite lors de l'enregistrement du produit, veuillez reessayez plus tard!",
        });
        throw new Error("Erreur lors de l'enregistrement du produit");
      }

      const formData = {
        name,
        description,
        price: Number(price),
        image: imgUrl,
        images: imgUrls,
        // stock: Number(stock),
        material,
        state,
        quality,
        target,
        brand,
        type,
        category,
      };

      // send to backend
      const response = await fetch("/api/admins/products/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        toast.error("Erreur lors de l'enregistrement du produit", {
          description:
            "Une erreur s'est produite lors de l'enregistrement du produit, veuillez reessayez plus tard!",
        });
        throw new Error("Erreur lors de l'enregistrement du produit");
      }

      const data = await response.json();

      if (data.error) {
        toast.error("Erreur lors de l'enregistrement du produit", {
          description: data.error,
        });
        return;
      }

      toast.success("Produit ajouté avec succès", {
        description: "Le produit a été enregistré avec succès",
      });

      const newProduct = data.data;

      setName("");
      setDescription("");
      setPrice("");
      setImage(null);
      setImages([]);
      // setStock("");
      setState("nouveau");
      setQuality("original");
      setTarget("");
      setBrand("");
      setType("");
      setMaterial("");

      if (newProduct) {
        router.push(`/produits/${newProduct.id}/articles`);
      }
    } catch (error) {
      const err = error as Error;
      toast.error("Erreur lors de l'enregistrement du produit", {
        description: err.message,
      });
      // delete imgs
      if (imgUrl) await deleteObject(ref(storage, imgUrl));
      imgUrls.forEach(
        async (imgUrl) => await deleteObject(ref(storage, imgUrl))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-6 min-h-96 gap-4">
      {/* product details */}
      <div className="lg:col-span-4 col-span-1 space-y-6 ">
        {/* Category */}
        <BorderWrapper>
          <div className="space-y-2.5">
            <Label className="text-[18px] font-bold">
              Catégorie du produit *
            </Label>
            {/* cat */}
            <div className="w-full flex flex-wrap gap-2">
              {CategoriesData.map((cat, idx) => (
                <div
                  key={idx}
                  role="button"
                  onClick={() => !loading && setCategory(cat.value)}
                  className={`group p-4 item-center border-2 
                   hover:border-primary flex flex-col gap-2
                   text-sm transition-all duration-500 ease-in-out rounded
                   ${
                     category === cat.value
                       ? "border-primary border-2 text-primary"
                       : " text-gray-500 border-secondary"
                   }
                   `}
                >
                  <cat.icon className="w-8 flex-shrink-0 self-center " />
                  <span className="text-sm ">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </BorderWrapper>

        {/* Infos */}
        <BorderWrapper>
          <div className="space-y-2.5 w-full">
            <Label className="text-[18px] font-bold">
              Information du produit *
            </Label>
            <div className="w-full flex flex-col gap-4">
              {/* nom */}
              <Input
                placeholder="Nom du produit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
                maxLength={100}
                disabled={loading}
              />

              {/* price */}
              <Input
                type="number"
                placeholder="Prix du produit"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={0}
                max={10000}
                disabled={loading}
                step={1}
                minLength={1}
                maxLength={6}
              />
              {/* description */}
              <Textarea
                placeholder="Description du produit"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                maxLength={10000}
                disabled={loading}
                className="max-h-96 min-h-36"
              />
            </div>
          </div>
        </BorderWrapper>

        {/* Details */}
        <BorderWrapper>
          <div className="space-y-2.5 w-full">
            <Label className="text-[18px] font-bold">
              Details specifiques du produit
            </Label>

            <div className="w-full flex flex-col gap-4">
              {/* state */}
              <Select value={state} onValueChange={(val) => setState(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Etat du produit" />
                </SelectTrigger>
                <SelectContent>
                  {StatesData.map((stat, idx) => (
                    <SelectItem
                      key={idx}
                      value={stat.value}
                      className="capitalize"
                    >
                      {stat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* quality */}
              <Select value={quality} onValueChange={(val) => setQuality(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Qualité du produit" />
                </SelectTrigger>
                <SelectContent>
                  {QualitiesData.map((stat, idx) => (
                    <SelectItem
                      key={idx}
                      value={stat.value}
                      className="capitalize"
                    >
                      {stat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </BorderWrapper>

        {/* Details supplementaires */}
        <BorderWrapper>
          <div className="space-y-2.5 w-full">
            <Label className="text-[18px] font-bold">
              Details supplementaires du produit
            </Label>

            <div className="w-full flex flex-col gap-4">
              {/* type */}
              {category === "vetements" && (
                <Select value={type} onValueChange={(val) => setType(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type de produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {TypeClothesData.map((stat, idx) => (
                      <SelectItem
                        key={idx}
                        value={stat.value}
                        className="capitalize"
                      >
                        {stat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {category === "accessoires" && (
                <Select value={type} onValueChange={(val) => setType(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type de produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {AccessoriesData.map((stat, idx) => (
                      <SelectItem
                        key={idx}
                        value={stat.value}
                        className="capitalize"
                      >
                        {stat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {category === "cosmetiques" && (
                <Select value={type} onValueChange={(val) => setType(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type de produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {CosmeticsData.map((stat, idx) => (
                      <SelectItem
                        key={idx}
                        value={stat.value ?? "other"}
                        className="capitalize"
                      >
                        {stat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Material */}
              {category === "accessoires" && (
                <Select
                  value={material}
                  onValueChange={(val) => setMaterial(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Materiel ou composition du produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {MaterialsAccData.map((stat, idx) => (
                      <SelectItem
                        key={idx}
                        value={stat.value}
                        className="capitalize"
                      >
                        {stat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Target */}
              <Select value={target} onValueChange={(val) => setTarget(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Personne cible du produit" />
                </SelectTrigger>
                <SelectContent>
                  {TargetData.map((stat, idx) => (
                    <SelectItem
                      key={idx}
                      value={stat.value}
                      className="capitalize"
                    >
                      {stat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Brand */}
              <Input
                placeholder="Marque du produit"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                minLength={2}
                maxLength={40}
                disabled={loading}
              />
            </div>
          </div>
        </BorderWrapper>
      </div>

      {/* images bs */}
      <div className="lg:col-span-2 col-span-1">
        <BorderWrapper>
          <div className="w-full flex flex-col gap-4">
            {/* image profile produit */}
            <BorderWrapper>
              <div className="w-full flex flex-col gap-2 item-center transition-all duration-500 ease-in-out">
                <label className="text-[18px] font-bold">
                  Image du produit *
                </label>
                {!image ? (
                  <div className="flex justify-center items-center transition-all duration-500 ease-in-out">
                    <Input
                      type="file"
                      accept="image/*"
                      id="file-upload"
                      onChange={(e) => {
                        const img = e.target.files;
                        if (img) {
                          setImage(img[0]);
                          return;
                        }
                        setImage(null);
                      }}
                      required
                      disabled={loading}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className={` w-full min-h-32 p-4 border-2 border-gray-300 
                        rounded-lg cursor-pointer bg-gray-100 flex items-center justify-center text-center ${
                          loading ? "bg-gray-300 cursor-not-allowed" : ""
                        }`}
                    >
                      Choisir une image
                    </label>
                  </div>
                ) : (
                  <div className="w-full h-full rounded relative transition-all duration-500 ease-in-out">
                    <Image
                      src={URL.createObjectURL(image)}
                      alt="image du produit"
                      width={1500}
                      height={1500}
                      priority
                      className="w-full h-full object-cover"
                    />
                    <span
                      className="absolute top-1 right-1 text-sm text-destructive 
                      cursor-pointer bg-overlay2 rounded-lg"
                      onClick={() => {
                        setImage(null);
                      }}
                    >
                      <X className="w-8 text-destructive" />
                    </span>
                  </div>
                )}
              </div>
            </BorderWrapper>

            {/* images du produit */}
            <BorderWrapper>
              <div className="w-full flex flex-col gap-2 item-center">
                <label className="text-[18px] font-bold">
                  Images additionnelles du produit
                </label>

                {/* inputs and images */}
                <div className="w-full grid gap-2 grid-cols-2 auto-rows-[150px] transition-all duration-500 ease-in-out">
                  {/* input */}
                  {images?.length < 6 && (
                    <div className="flex justify-center items-center transition-all duration-500 ease-in-out">
                      <input
                        id="files-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const img = e.target.files;
                          if (img) {
                            const newImages = [...images, img[0]];
                            setImages(newImages);
                            return;
                          }
                          setImages([...images]);
                        }}
                        required
                        disabled={loading}
                        className="hidden"
                      />
                      <label
                        htmlFor="files-upload"
                        className={` w-full h-full p-4 border-2 border-gray-300 
                        rounded-lg cursor-pointer bg-gray-100 flex items-center justify-center text-center ${
                          loading ? "bg-gray-300 cursor-not-allowed" : ""
                        }`}
                      >
                        {images?.length > 6 ? (
                          <span>{"Impossible d'en ajouter plus"}</span>
                        ) : (
                          <span>Clicker pour ajouter une image</span>
                        )}
                      </label>
                    </div>
                  )}
                  {/* images */}
                  {images?.length > 0 &&
                    images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative h-full w-full overflow-hidden transition-all duration-500 ease-in-out"
                      >
                        <Image
                          src={URL.createObjectURL(img)}
                          alt={`image ${idx + 1} du produit`}
                          width={2050}
                          height={2050}
                          priority
                          className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                        />
                        <span
                          className="absolute top-1 right-1 text-sm text-destructive cursor-pointer
                           bg-overlay2 rounded-lg"
                          onClick={() => {
                            const newImages = [...images];
                            const filteredImgs = newImages.filter(
                              (im) => im !== img
                            );
                            setImages(filteredImgs);
                          }}
                        >
                          <X className="w-8 text-destructive" />
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </BorderWrapper>
          </div>
        </BorderWrapper>

        {/* submit */}
        <div className="flex w-full mt-10">
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              isEmptyString(name) ||
              isEmptyString(price) ||
              isEmptyString(category) ||
              isEmptyString(description) ||
              !image ||
              // isEmptyString(stock) ||
              isEmptyString(type) ||
              isEmptyString(target) ||
              (category === "accessoires" && isEmptyString(material))
            }
            className="w-full py-5"
          >
            {loading ? "En cours..." : "AJouter"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
