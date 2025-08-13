"use client";
import BorderWrapper from "@/components/BorderWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { storage } from "@/lib/firebase";
import { updateImagesProductImages } from "@/actions/actions";
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
import { isEmptyString, returnDataValue } from "@/utils/functions";
import { Product } from "@prisma/client";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { v4 } from "uuid";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

type Props = {
  product: Product;
};

const ModifyProductForm = ({ product }: Props) => {
  const [category, setCategory] = useState(product.category ?? "");
  const [name, setName] = useState(product.name ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(product.price.toString() ?? "");

  const [image, setImage] = useState<File | null>(null);
  const [images, setImages] = useState<{ id: string; file: File }[]>([]);
  const [visualizeImage, setVisualizeImage] = useState(product.image ?? "");
  const [visualizeImages, setVisualizeImages] = useState<string[]>(
    product.images ?? []
  );

  const mergedImages = useMemo(
    () => [
      ...images.map(({ id, file }) => ({ id, url: URL.createObjectURL(file) })),
      ...visualizeImages.map((url) => ({ id: url, url })),
    ],
    [visualizeImages, images]
  );

  const handleRemoveImage = async (id: string) => {
    // Check if the image is in visualizeImages
    if (visualizeImages.includes(id)) {
      setLoading(true);
      try {
        await deleteObject(ref(storage, `${id}`));
        // const formData = {
        //   id: product.id,
        //   images: visualizeImages.filter((im) => im !== id),
        // };
        const reducedImgs = visualizeImages.filter((im) => im !== id);
        const removeImgs = await updateImagesProductImages(
          product.id,
          reducedImgs
        );

        if (!removeImgs) {
          toast.error(
            "Une erreur s'est produite lors de la suppression de l'image, veuillez reessayez plus tard!"
          );
          return;
        }
        setVisualizeImages(reducedImgs);
        toast.success("L'image a été supprimée avec succès!");
        router.refresh();
      } catch (error) {
        console.error("Error uploading images", error);
        toast.error(
          "Une erreur s'est produite lors de la suppression de l'image, veuillez reessayez plus tard!"
        );
      } finally {
        setLoading(false);
      }
    }

    // Check if the image is in images
    const imageFile = images.find((im) => im.id === id);
    if (imageFile) {
      setImages(images.filter((im) => im.id !== id));
    }
  };

  // const [stock, setStock] = useState(product.stock.toString() ?? "");
  const [state, setState] = useState(product.state ?? "nouveau");
  const [quality, setQuality] = useState("original");

  const [target, setTarget] = useState(product.target ?? "");
  const [brand, setBrand] = useState(product.brand ?? "");
  const [type, setType] = useState(product.type ?? "");
  const [material, setMaterial] = useState(product.material ?? "");

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // modify image product
  const handleModifyImage = async () => {
    setLoading(true);
    let imgUrl: string = "";
    if (!image || !product.image) return;
    try {
      //   const imgId = v4().toString().replace(/-/g, "");
      const storageRef = ref(storage, `${product.image}`);
      const snapshot = await uploadBytes(storageRef, image);
      imgUrl = await getDownloadURL(snapshot.ref);

      if (!imgUrl) {
        toast.error("Erreur lors de la modification du produit", {
          description:
            "Une erreur s'est produite lors de la modification du produit, veuillez reessayez plus tard!",
        });
        throw new Error("Erreur lors de la modification du produit");
      }
      toast.success("Produit modifié avec succès", {
        description: "L'image du produit a été modifié avec succès!",
      });
      setImage(null);
      setVisualizeImage(imgUrl);
      product = { ...product, image: imgUrl };
      router.refresh();
    } catch (error) {
      console.error("Error uploading image", error);
      return (imgUrl = "");
    } finally {
      setLoading(false);
    }
  };

  // modify images
  const handleModifyImages = async () => {
    setLoading(true);
    let imgUrls: string[] = [];
    if (!images.length) return;
    try {
      for (const img of images) {
        const imgId = v4().toString().replace(/-/g, "");
        const storageRef = ref(storage, `oteki/products/images/${imgId}`);
        const snapshot = await uploadBytes(storageRef, img.file);
        imgUrls.push(await getDownloadURL(snapshot.ref));
      }

      if (!imgUrls) {
        toast.error("Erreur lors de la modification du produit", {
          description:
            "Une erreur s'est produite lors de la modification du produit, veuillez reessayez plus tard!",
        });
        throw new Error("Erreur lors de la modification du produit");
      }
      // const formData = { id: product.id, images: imgUrls };

      const reducedImgs = [...product.images, ...imgUrls];
      const updateImages = await updateImagesProductImages(
        product.id,
        reducedImgs
      );

      //   const response = await fetch("/api/admin/products/images", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(formData),
      //   });
      if (!updateImages) {
        toast.error(
          "Une erreur s'est produite lors de l'ajout d'images du produit, veuillez reessayez plus tard!"
        );
        throw new Error("Erreur lors de la modification du produit");
      }

      //   const data = await response.json();

      //   if (data.error) {
      //     toast({
      //       title: "Erreur lors de la modification du produit",
      //       description: data.error,
      //       variant: "destructive",
      //     });
      //     return;
      //   }

      toast.success("Produit modifié avec succès", {
        description: "Les images du produit ont été modifiées avec succès!",
      });
      setImages([]);
      //   const resData = data.data as Product;
      setVisualizeImages([...updateImages.images]);
      router.refresh();
    } catch (error) {
      console.error("Error uploading images", error);
      return (imgUrls = []);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formData = {
        name,
        description,
        price: Number(price),
        stock: 0,
        state,
        quality,
        material,
        target,
        brand,
        type,
        category,
        id: product.id,
      };

      // send to backend
      const response = await fetch("/api/admins/products/modify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        toast.error("Erreur lors de la modification du produit", {
          description:
            "Une erreur s'est produite lors de la modification du produit, veuillez reessayez plus tard!",
        });
        throw new Error("Erreur lors de la modification du produit");
      }

      const data = await response.json();

      if (data.error) {
        toast.error("Erreur lors de la modification du produit", {
          description: data.error,
        });
        return;
      }

      toast("Produit ajouté avec succès", {
        description: "Le produit a été enregistré avec succès",
      });

      const resData = data.data as Product;
      product = resData;
      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast.error("Erreur lors de la modification du produit", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = () => {
    if (category === "accessoires") {
      return (
        loading ||
        isEmptyString(name) ||
        isEmptyString(price) ||
        isEmptyString(category) ||
        isEmptyString(description) ||
        // isEmptyString(stock) ||
        isEmptyString(type) ||
        isEmptyString(target) ||
        isEmptyString(material) ||
        (name === product.name &&
          category === product.category &&
          description === product.description &&
          // Number(stock) === product.stock &&
          type === product.type &&
          Number(price) === product.price &&
          brand === product.brand &&
          target === product.target &&
          state === product.state &&
          quality === product.quality &&
          material === product.material)
      );
    }
    return (
      loading ||
      isEmptyString(name) ||
      isEmptyString(price) ||
      isEmptyString(category) ||
      isEmptyString(description) ||
      // isEmptyString(stock) ||
      isEmptyString(type) ||
      isEmptyString(target) ||
      (name === product.name &&
        category === product.category &&
        description === product.description &&
        // Number(stock) === product.stock &&
        type === product.type &&
        Number(price) === product.price &&
        brand === product.brand &&
        target === product.target &&
        state === product.state &&
        quality === product.quality)
    );
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
            <div className="w-full flex flex-col gap-5">
              {/* nom */}
              <Input
                placeholder="Nom du produit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
                maxLength={40}
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
                maxLength={1500}
                disabled={loading}
                className="max-h-72 min-h-36"
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

            <div className="w-full flex flex-col gap-5">
              {/* Stock */}
              {/* <Input
                type="number"
                placeholder="Stock/Quantité du produit"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                min={0}
                max={10000}
                disabled={loading}
                step={1}
                minLength={1}
                maxLength={6}
              /> */}

              {/* state */}

              {/* state */}
              <RadioGroup value={state} onValueChange={(val) => setState(val)}>
                <Label className="font-medium text-sm">Etat</Label>
                <div className="w-full flex flex-wrap gap-x-6 gap-y-3 items-start justify-start">
                  {StatesData.map((stat) => (
                    <div
                      key={stat.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={stat.value} id={stat.value} />
                      <Label htmlFor={stat.value}>{stat.label}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {/* quality */}
              <RadioGroup
                value={quality}
                onValueChange={(val) => setQuality(val)}
              >
                <Label className="font-medium text-sm">Qualité</Label>
                <div className="w-full flex flex-wrap gap-x-6 gap-y-3 items-start justify-start">
                  {QualitiesData.map((stat) => (
                    <div
                      key={stat.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={stat.value} id={stat.value} />
                      <Label htmlFor={stat.value}>{stat.label}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </div>
        </BorderWrapper>

        {/* Details supplementaires */}
        <BorderWrapper>
          <div className="space-y-2.5 w-full">
            <Label className="text-[18px] font-bold">
              Details supplementaires du produit
            </Label>

            <div className="w-full flex flex-col gap-5">
              {/* type */}

              {/* type */}
              {category === "vetements" && (
                <Dialog>
                  <DialogTrigger
                    disabled={loading}
                    className="w-full h-10 px-4 text-center font-medium border border-gray-300
        hover:bg-transparent hover:text-black transition-all duration-500 ease-in-out
        flex items-center justify-between gap-2
        "
                  >
                    <span className="text-sm capitalize">
                      {returnDataValue(type, TypeClothesData)}
                    </span>
                    <ChevronDown className="w-6 flex-shrink-0 opacity-75" />
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Choisir le type de Vetement</DialogTitle>
                      <DialogDescription>
                        Clicker sur le type à choisir pour changer et valider le
                        choix
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex flex-wrap items-start justify-start gap-4">
                      {TypeClothesData.map((stat, idx) => (
                        <DialogClose
                          key={idx}
                          onClick={() => {
                            setType(stat.value);
                          }}
                          className={`group px-4 py-2 item-center border-2 hover:border-primary flex flex-col gap-2 text-sm
                        ${
                          type === stat.value
                            ? "border-primary border-2 text-primary"
                            : "text-gray-500 border-secondary"
                        } 
                        transition-all duration-500 ease-in-out rounded text-gray-500`}
                        >
                          <span className="text-sm capitalize">
                            {stat.label}
                          </span>
                        </DialogClose>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {category === "accessoires" && (
                <Dialog>
                  <DialogTrigger
                    disabled={loading}
                    className="w-full h-10 px-4 text-center font-medium border border-gray-300
        hover:bg-transparent hover:text-black transition-all duration-500 ease-in-out
        flex items-center justify-between gap-2
        "
                  >
                    <span className="capitalize">
                      {returnDataValue(type, AccessoriesData)}
                    </span>
                    <ChevronDown className="w-6 flex-shrink-0 opacity-75" />
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Choisir le type d accessoires</DialogTitle>
                      <DialogDescription>
                        Clicker sur le type à choisir pour changer et valider le
                        choix
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex flex-wrap items-start justify-start gap-4">
                      {AccessoriesData.map((stat, idx) => (
                        <DialogClose
                          key={idx}
                          onClick={() => {
                            setType(stat.value);
                          }}
                          className={`group px-4 py-2 item-center border-2 hover:border-primary flex flex-col gap-2 text-sm
                        ${
                          type === stat.value
                            ? "border-primary border-2 text-primary"
                            : "text-gray-500 border-secondary"
                        } 
                        transition-all duration-500 ease-in-out rounded text-gray-500`}
                        >
                          <span className="text-sm capitalize">
                            {stat.label}
                          </span>
                        </DialogClose>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {category === "cosmetiques" && (
                <Dialog>
                  <DialogTrigger
                    disabled={loading}
                    className="w-full h-10 px-4 text-center font-medium border border-gray-300
        hover:bg-transparent hover:text-black transition-all duration-500 ease-in-out
        flex items-center justify-between gap-2
        "
                  >
                    <span className="capitalize">
                      {returnDataValue(type, CosmeticsData)}
                    </span>
                    <ChevronDown className="w-6 flex-shrink-0 opacity-75" />
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>
                        Choisir le type de produits cosmetiques
                      </DialogTitle>
                      <DialogDescription>
                        Clicker sur le type à choisir pour changer et valider le
                        choix
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex flex-wrap items-start justify-start gap-4">
                      {CosmeticsData.map((stat, idx) => (
                        <DialogClose
                          key={idx}
                          onClick={() => {
                            setType(stat.value);
                          }}
                          className={`group px-4 py-2 item-center border-2 hover:border-primary flex flex-col gap-2 text-sm
                        ${
                          type === stat.value
                            ? "border-primary border-2 text-primary"
                            : "text-gray-500 border-secondary"
                        } 
                        transition-all duration-500 ease-in-out rounded text-gray-500`}
                        >
                          <span className="text-sm capitalize">
                            {stat.label}
                          </span>
                        </DialogClose>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* material */}
              {/* material */}
              {category === "accessoires" && (
                <Dialog>
                  <DialogTrigger
                    disabled={loading}
                    className="w-full h-10 px-4 text-center font-medium border border-gray-300
        hover:bg-transparent hover:text-black transition-all duration-500 ease-in-out
        flex items-center justify-between gap-2
        "
                  >
                    <span className="capitalize">
                      {returnDataValue(material, MaterialsAccData)}
                    </span>
                    <ChevronDown className="w-6 flex-shrink-0 opacity-75" />
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>
                        Choisir le materiel ou la constitution du produit
                      </DialogTitle>
                      <DialogDescription>
                        Clicker sur le materiel à choisir pour changer et
                        valider le choix
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex flex-wrap items-start justify-start gap-4">
                      {MaterialsAccData.map((stat, idx) => (
                        <DialogClose
                          key={idx}
                          onClick={() => {
                            setMaterial(stat.value);
                          }}
                          className={`group px-4 py-2 item-center border-2 hover:border-primary flex flex-col gap-2 text-sm
                        ${
                          material === stat.value
                            ? "border-primary border-2 text-primary"
                            : "text-gray-500 border-secondary"
                        } 
                        transition-all duration-500 ease-in-out rounded text-gray-500`}
                        >
                          <span className="text-sm capitalize">
                            {stat.label}
                          </span>
                        </DialogClose>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Target */}
              {/* target */}
              <RadioGroup
                value={target}
                onValueChange={(val) => setTarget(val)}
              >
                <Label className="font-medium text-sm">Personne cible</Label>
                <div className="w-full flex flex-wrap gap-x-6 gap-y-3 items-start justify-start">
                  {TargetData.map((stat) => (
                    <div
                      key={stat.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={stat.value} id={stat.value} />
                      <Label htmlFor={stat.value}>{stat.label}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

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

        {/* submit */}
        <div className="flex w-full mt-10">
          <Button
            onClick={handleSubmit}
            disabled={isButtonDisabled()}
            className="w-full py-5"
          >
            {loading ? "En cours..." : "Modifier"}
          </Button>
        </div>
      </div>

      {/* images bs */}
      <div className="lg:col-span-2 col-span-1">
        <BorderWrapper>
          <div className="w-full flex flex-col gap-5">
            {/* image profile produit */}
            <BorderWrapper>
              <div className="w-full flex flex-col gap-2 item-center transition-all duration-500 ease-in-out">
                <label className="text-[18px] font-bold">
                  Image du produit *
                </label>
                {!image && !visualizeImage ? (
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
                      src={image ? URL.createObjectURL(image) : visualizeImage}
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
                        setVisualizeImage("");
                      }}
                    >
                      <X className="w-8 text-destructive" />
                    </span>
                  </div>
                )}

                <Button
                  onClick={handleModifyImage}
                  disabled={loading || !image}
                  className="w-full py-5 mt-4"
                >
                  {loading ? "En cours..." : "Changer"}
                </Button>
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
                  {mergedImages.length < 6 && (
                    <div className="flex justify-center items-center transition-all duration-500 ease-in-out">
                      <input
                        id="files-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const img = e.target.files;
                          if (img) {
                            const newImages = [
                              ...images,
                              { id: URL.createObjectURL(img[0]), file: img[0] },
                            ];
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
                  {mergedImages.length > 0 &&
                    mergedImages.map(({ url, id }, idx) => (
                      <div
                        key={idx}
                        className="relative h-full w-full overflow-hidden transition-all duration-500 ease-in-out"
                      >
                        <Image
                          src={url}
                          alt={`image ${idx + 1} du produit`}
                          width={2050}
                          height={2050}
                          priority
                          className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                        />
                        <span
                          className="absolute top-1 right-1 text-sm text-destructive cursor-pointer
                           bg-overlay2 rounded-lg"
                          onClick={() => handleRemoveImage(id)}
                        >
                          <X className="w-8 text-destructive" />
                        </span>
                      </div>
                    ))}
                </div>

                {/* submit */}
                <div className="flex w-full mt-10">
                  <Button
                    onClick={handleModifyImages}
                    disabled={loading || images.length < 1}
                    className="w-full py-5"
                  >
                    {loading ? "En cours..." : "AJouter"}
                  </Button>
                </div>
              </div>
            </BorderWrapper>
          </div>
        </BorderWrapper>
      </div>
    </div>
  );
};

export default ModifyProductForm;
