"use client";
import {
  IsAvailableProducts,
  IsAvailableType,
  validateArticles,
  validateAvenue,
  validateDescription,
  validateImage,
  validateName,
  validateRequired,
} from "@/utils/supplier";
import { PackagePlus } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import {
  CategoriesData,
  NewAllProductsTypesWithCategory,
  StatesData,
  TargetData,
} from "@/utils/data";
import Image from "next/image";
import { communesQuartiers, communesKinshasa } from "@/utils/zones";
import { toast } from "sonner";
import { NewSupplierProductType } from "@/schema/supplierSchema";
import { DEFAULT_SUPPLIER_IMAGE } from "@/utils/envVariables";
import {
  createNewProduct,
  supplierProductImages,
} from "@/actions/supplierAction";
import { v4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  SelectProductCategory,
  SelectProductType,
  SelectorProducts,
} from "../../SelectProductCategories";
import { PermittedSellersSelect } from "./PermittedSellersSelect";
import { ProductArticles } from "./ProductArticles";
import { Button } from "@/components/ui/button";
import {
  deleteArticleFile,
  isZipFile,
  MAX_ZIP_SIZE,
  uploadArticleFile,
  UploadedFile,
} from "@/lib/firebase-files";

export const validatePhoneNumber = (value: string, label: string) => {
  if (!value) return `${label} est requis`;
  if (!/^\d{9}$/.test(value)) {
    return `${label} doit contenir exactement 9 chiffres sans 0 ou +243`;
  }
  return "";
};

const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(0)} Mo`;
};

type NewProductFormProps = {
  shopId?: string;
  shopSlug?: string;
};

const SpecialAddressInfo = {
  commune: "bandalungwa",
  quartier: "makelele",
  avenue: "Tshanga, 6529",
};

const NewProductForm = ({ shopId, shopSlug }: NewProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const cannotModifySpecialInfo = useMemo(() => {
    if (!shopId || !shopSlug) return false;
    return true;
  }, [shopId, shopSlug]);

  const [category, setCategory] = useState(
    cannotModifySpecialInfo ? "digital" : "",
  );
  const isFileProduct = useMemo(() => category === "digital", [category]);

  // 🔹 Steps dynamiques selon le type de produit
  const steps = useMemo(() => {
    const list = ["Produit", "Classification"];
    if (isFileProduct) list.push("Fichier");

    // Variantes : inutile pour un produit numérique d'une boutique spéciale
    // (l'article est déjà forcé à other / 0 / 1 par le useEffect)
    if (!(isFileProduct && cannotModifySpecialInfo)) list.push("Variantes");

    list.push("Localisation & Contacts");

    // Disponibilité : déjà fixée à "specific_sellers" avec [shopId]
    if (!cannotModifySpecialInfo) list.push("Disponibilité");

    return list;
  }, [isFileProduct, cannotModifySpecialInfo]);

  const [step, setStep] = useState(0);

  // Revenir au step 0 si on change le nombre total de steps dynamiquement
  useEffect(() => {
    if (step >= steps.length) {
      setStep(steps.length - 1);
    }
  }, [steps, step]);

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("");
  const [quality, setQuality] = useState("original");
  const [state, setState] = useState("nouveau");
  const [brand, setBrand] = useState("");
  const [target, setTarget] = useState("");

  const [isAvailable, setIsAvailable] = useState<IsAvailableType>(
    cannotModifySpecialInfo ? "specific_sellers" : "for_all",
  );
  const [permittedSellers, setPermittedSellers] = useState<string[]>(
    cannotModifySpecialInfo && shopId ? [shopId] : [],
  );
  const [shops, setShops] = useState<any[]>([]);

  const [articles, setArticles] = useState([
    { color: "", size: "", quantity: 1 },
  ]);

  const [image, setImage] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [commune, setCommune] = useState(
    cannotModifySpecialInfo ? SpecialAddressInfo.commune : "",
  );
  const [quartier, setQuartier] = useState(
    cannotModifySpecialInfo ? SpecialAddressInfo.quartier : "",
  );
  const [avenue, setAvenue] = useState(
    cannotModifySpecialInfo ? SpecialAddressInfo.avenue : "",
  );
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliveryPrice, setDeliveryPrice] = useState("");

  const [contactNumber, setContactNumber] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch("/api/supplier/shops-list");
        const data = await res.json();
        setShops(data);
      } catch (err) {
        console.error("Erreur chargement boutiques:", err);
      }
    };
    fetchShops();
  }, []);

  useEffect(() => {
    if (isFileProduct) {
      setArticles([{ color: "other", size: "0", quantity: 1 }]);
    } else {
      setArticles([{ color: "", size: "", quantity: 1 }]);
      setFile(null);
    }
  }, [isFileProduct]);

  // 🔹 Validation par étape avant de faire Next
  const validateCurrentStep = () => {
    const currentStepLabel = steps[step];

    if (currentStepLabel === "Produit") {
      const errImage = validateImage(image);
      if (errImage) {
        toast.error(errImage);
        return false;
      }

      const errName = validateName(name);
      if (errName) {
        toast.error(errName);
        return false;
      }

      // const errBrand = validateRequired(brand, "Marque");
      // if (errBrand) {
      //   toast.error(errBrand);
      //   return false;
      // }

      const errDesc = validateDescription(description);
      if (errDesc) {
        toast.error(errDesc);
        return false;
      }

      if (!price || parseFloat(price) <= 0) {
        toast.error("Veuillez entrer un prix valide");
        return false;
      }
    }

    if (currentStepLabel === "Classification") {
      const errCat = validateRequired(category, "Catégorie");
      if (errCat) {
        toast.error(errCat);
        return false;
      }

      const errType = validateRequired(type, "Type");
      if (errType) {
        toast.error(errType);
        return false;
      }

      const errState = validateRequired(state, "État");
      if (errState) {
        toast.error(errState);
        return false;
      }

      const errTarget = validateRequired(target, "Cible");
      if (errTarget) {
        toast.error(errTarget);
        return false;
      }
    }

    if (currentStepLabel === "Fichier") {
      if (isFileProduct && !file) {
        toast.error("Le fichier ZIP est requis pour les produits numériques");
        return false;
      }
    }

    if (currentStepLabel === "Variantes") {
      const errArt = validateArticles(articles);
      if (errArt) {
        toast.error(errArt);
        return false;
      }
    }

    if (currentStepLabel === "Localisation & Contacts") {
      const errCommune = validateRequired(commune, "Commune");
      if (errCommune) {
        toast.error(errCommune);
        return false;
      }

      const errQuartier = validateRequired(quartier, "Quartier");
      if (errQuartier) {
        toast.error(errQuartier);
        return false;
      }

      const errAvenue = validateAvenue(avenue);
      if (errAvenue) {
        toast.error(errAvenue);
        return false;
      }

      if (isDelivering) {
        const dp = parseFloat(deliveryPrice);
        if (isNaN(dp) || dp < 0) {
          toast.error("Le prix de livraison doit être un nombre positif");
          return false;
        }
      }

      const errContact = validatePhoneNumber(
        contactNumber,
        "Le numéro de téléphone",
      );
      if (errContact) {
        toast.error(errContact);
        return false;
      }

      const errPayment = validatePhoneNumber(
        paymentNumber,
        "Le numéro de paiement",
      );
      if (errPayment) {
        toast.error(errPayment);
        return false;
      }
    }

    return true;
  };

  const next = (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // 🛑 Empêche le clic de se propager au submit
    if (validateCurrentStep()) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!isZipFile(selected)) {
      toast.error("Format invalide", {
        description: "Seuls les fichiers .zip sont acceptés.",
      });
      e.target.value = "";
      return;
    }

    if (
      selected.size >
      Number(formatFileSize(MAX_ZIP_SIZE).replace(/[^0-9.]/g, "")) * 1024 * 1024
    ) {
      toast.error("Fichier trop volumineux", {
        description: `Taille maximale : ${formatFileSize(MAX_ZIP_SIZE)}`,
      });
      e.target.value = "";
      return;
    }

    setFile(selected);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setLoading(true);
    let imageUrl = DEFAULT_SUPPLIER_IMAGE;
    let uploadedFile: UploadedFile | null = null;

    try {
      if (isFileProduct && file) {
        uploadedFile = await uploadArticleFile(file, `oteki/supplier-products`);
      }

      const formData: NewSupplierProductType = {
        name: name.trim().toLowerCase(),
        description: description.trim(),
        price,
        category,
        brand: brand.trim(),
        type,
        state,
        target,
        isAvailable,
        commune,
        quartier,
        avenue,
        permittedSellers,
        articles,
        file: uploadedFile ? uploadedFile.url : undefined,
        contactNumber,
        paymentNumber,
        deliveryPrice: parseFloat(deliveryPrice) || 0,
        image: imageUrl,
        isDelivering,
      };

      const newProduct = await createNewProduct(formData);

      if (newProduct.error) {
        if (uploadedFile) await deleteArticleFile(uploadedFile.path);
        toast.error(newProduct.message);
        setLoading(false);
        return;
      }

      // Upload de l'image
      if (image) {
        const imgId = v4().toString().replace(/-/g, "");
        const storageRef = ref(
          storage,
          `oteki/supplier-products/images/${imgId}`,
        );
        const snapshot = await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);

        if (newProduct.productId) {
          const updateImage = await supplierProductImages({
            image: imageUrl,
            productId: newProduct.productId,
            images: [],
          });

          if (updateImage.error) {
            toast.error(updateImage.message);
          }
        }
      }

      toast.success(`${newProduct.message}`);

      if (shopSlug && newProduct.productId && shopId) {
        setTimeout(() => {
          router.push(`/${shopSlug}/`);
        }, 2000);
      }

      router.refresh();

      // Reset Form
      setName("");
      setDescription("");
      setImage(null);
      setFile(null);
      setCategory("");
      setType("");
      setAvenue("");
      setCommune("");
      setQuartier("");
      setIsAvailable("for_all");
      setPermittedSellers([]);
      setBrand("");
      setState("nouveau");
      setTarget("");
      setStep(0);
      setContactNumber("");
      setPaymentNumber("");
      setPrice("");
      setArticles([{ color: "", size: "", quantity: 1 }]);
      setDeliveryPrice("");
      setIsDelivering(false);
    } catch (error) {
      if (uploadedFile) await deleteArticleFile(uploadedFile.path);
      console.error("Erreur ajout produit:", error);
      toast.error("Une erreur est survenue lors de l'ajout du produit");
    } finally {
      setLoading(false);
    }
  }

  const currentStepName = steps[step];

  return (
    <div className="mx-auto max-w-2xl p-4 w-full flex flex-col gap-6">
      <div>
        <PackagePlus className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
        <h3 className="text-center font-bold text-lg">Nouveau Produit</h3>
      </div>

      {/* STEPS INDICATOR */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((label, i) => (
          <div key={i} className="flex-1 flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                i <= step
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 transition-colors ${
                  i < step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-sm font-semibold text-muted-foreground mb-2">
        Étape {step + 1} : {currentStepName}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* STEP : PRODUIT */}
        {currentStepName === "Produit" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="w-full flex flex-col gap-2">
              <label className="text-sm font-medium">Image du produit *</label>
              <div className="w-full">
                {image ? (
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border bg-gray-100">
                    <Image
                      src={URL.createObjectURL(image)}
                      alt="Product Image"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur border shadow-sm hover:bg-white transition font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-64 border border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition"
                  >
                    <div className="text-center space-y-1">
                      <p className="text-sm text-gray-600">
                        Ajouter une image *
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG, WEBP (Max 2 Mo)
                      </p>
                    </div>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith("image/")) {
                          toast.error("Veuillez sélectionner une image valide");
                          return;
                        }
                        if (
                          file.size >
                          Number(
                            formatFileSize(2 * 1024 * 1024).replace(
                              /[^0-9.]/g,
                              "",
                            ),
                          ) *
                            1024 *
                            1024
                        ) {
                          toast.error("L'image doit être inférieure à 2MB");
                          return;
                        }
                        setImage(file);
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="grid w-full items-center gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nom du produit *
              </label>
              <Input
                id="name"
                placeholder="Ex: T-shirt Otekis"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <label htmlFor="brand" className="text-sm font-medium">
                Marque du produit
              </label>
              <Input
                id="brand"
                placeholder="Ex: Nike, Apple, Otekis..."
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description du produit *
              </label>
              <Textarea
                id="description"
                placeholder="Description détaillée du produit..."
                minLength={5}
                maxLength={2000}
                className="max-h-40 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <label htmlFor="price" className="text-sm font-medium">
                Prix ($) du produit *
              </label>
              <Input
                id="price"
                type="number"
                placeholder="Ex: 29.99"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* STEP : CLASSIFICATION */}
        {currentStepName === "Classification" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-2">
                <label className="text-sm font-medium">Catégorie *</label>
                <SelectProductCategory
                  categories={CategoriesData}
                  selectedCategory={category}
                  onCategoryChange={(cat) => {
                    setCategory(cat);
                    setType("");
                  }}
                  disabled={loading || cannotModifySpecialInfo}
                />
              </div>

              <div className="grid w-full items-center gap-2">
                <label className="text-sm font-medium">Type de produit *</label>
                <SelectProductType
                  types={NewAllProductsTypesWithCategory}
                  selectedType={type}
                  onTypeChange={setType}
                  category={category}
                  disabled={!category || loading}
                />
              </div>
            </div>

            <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-2">
                <label className="text-sm font-medium">État du produit *</label>
                <SelectorProducts
                  data={StatesData}
                  onChange={setState}
                  value={state}
                  placeholder="Sélectionnez un état"
                  disabled={loading}
                />
              </div>

              <div className="grid w-full items-center gap-2">
                <label className="text-sm font-medium">Cible *</label>
                <SelectorProducts
                  data={TargetData}
                  onChange={setTarget}
                  value={target}
                  placeholder="Sélectionnez une cible"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP : FICHIER (Digital uniquement) */}
        {currentStepName === "Fichier" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="w-full flex flex-col gap-2">
              <p className="text-sm font-medium">
                Ajouter le fichier téléchargeable (ZIP) *
              </p>

              <div className="w-full">
                {file ? (
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border bg-gray-100 p-4">
                    <div className="text-sm text-gray-700 space-y-1">
                      <p className="font-medium break-all">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} Mo
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      disabled={loading}
                      className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur border shadow-sm hover:bg-white transition font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="file"
                    className="flex flex-col items-center justify-center w-full h-64 border border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition"
                  >
                    <div className="text-center space-y-1">
                      <p className="text-sm text-gray-600">
                        Ajouter un fichier ZIP
                      </p>
                      <p className="text-xs text-gray-400">
                        ZIP uniquement (max {MAX_ZIP_SIZE / (1024 * 1024)} Mo)
                      </p>
                    </div>

                    <Input
                      id="file"
                      type="file"
                      accept=".zip,application/zip,application/x-zip-compressed"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP : VARIANTES */}
        {currentStepName === "Variantes" && isFileProduct && (
          <div className="animate-in fade-in duration-200">
            <ProductArticles
              articles={articles}
              setArticles={setArticles}
              isFileProduct={isFileProduct}
            />
          </div>
        )}

        {/* STEP : LOCALISATION & CONTACTS */}
        {currentStepName === "Localisation & Contacts" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-2">
                <label className="text-sm font-medium">Commune *</label>
                <SelectorProducts
                  data={communesKinshasa.map((c) => ({
                    label: c,
                    value: c.toLowerCase(),
                  }))}
                  onChange={(val) => {
                    setCommune(val as string);
                    setQuartier("");
                  }}
                  value={commune}
                  placeholder="Sélectionnez la commune"
                  disabled={loading || cannotModifySpecialInfo}
                />
              </div>

              <div className="grid w-full items-center gap-2">
                <label className="text-sm font-medium">Quartier *</label>
                <SelectorProducts
                  data={communesQuartiers
                    .filter(
                      (cq) => cq.name.toLowerCase() === commune.toLowerCase(),
                    )
                    .flatMap((cq) => cq.quartiers)
                    .map((q) => ({ label: q, value: q.toLowerCase() }))}
                  onChange={setQuartier}
                  value={quartier}
                  placeholder="Sélectionnez le quartier"
                  disabled={!commune || loading || cannotModifySpecialInfo}
                />
              </div>
            </div>

            <div className="grid w-full items-center gap-2">
              <label htmlFor="avenue" className="text-sm font-medium">
                Avenue et numéro *
              </label>
              <Input
                id="avenue"
                placeholder="Ex: Samba, 12"
                value={avenue}
                onChange={(e) => setAvenue(e.target.value)}
                disabled={loading || cannotModifySpecialInfo}
              />
              <p className="text-xs text-muted-foreground">
                Format : Nom de l’avenue, numéro (ex: Samba, 12)
              </p>
            </div>

            <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-2">
                <label className="text-sm font-medium">
                  Proposez-vous la livraison ?
                </label>
                <SelectorProducts
                  data={[
                    { label: "Oui", value: "yes" },
                    { label: "Non", value: "no" },
                  ]}
                  onChange={(val) => {
                    setIsDelivering(val === "yes");
                    if (val !== "yes") setDeliveryPrice("");
                  }}
                  value={isDelivering ? "yes" : "no"}
                  placeholder="Sélectionnez une option"
                  disabled={loading || cannotModifySpecialInfo}
                />
              </div>

              {isDelivering && (
                <div className="grid w-full items-center gap-2">
                  <label
                    htmlFor="deliveryPrice"
                    className="text-sm font-medium"
                  >
                    Prix de livraison ($) *
                  </label>
                  <Input
                    id="deliveryPrice"
                    type="number"
                    placeholder="Ex: 3.5"
                    min="0"
                    step="0.1"
                    value={deliveryPrice}
                    onChange={(e) => setDeliveryPrice(e.target.value)}
                    disabled={loading || cannotModifySpecialInfo}
                  />
                </div>
              )}
            </div>

            <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-2">
                <label htmlFor="contactNumber" className="text-sm font-medium">
                  Numéro WhatsApp (9 chiffres) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground pointer-events-none">
                    +243
                  </span>
                  <Input
                    id="contactNumber"
                    type="tel"
                    placeholder="832226222"
                    maxLength={9}
                    value={contactNumber}
                    onChange={(e) =>
                      setContactNumber(e.target.value.replace(/\D/g, ""))
                    }
                    className="pl-12 text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid w-full items-center gap-2">
                <label htmlFor="paymentNumber" className="text-sm font-medium">
                  Numéro de paiement Mobile Money *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground pointer-events-none">
                    +243
                  </span>
                  <Input
                    id="paymentNumber"
                    type="tel"
                    placeholder="832226222"
                    maxLength={9}
                    value={paymentNumber}
                    onChange={(e) =>
                      setPaymentNumber(e.target.value.replace(/\D/g, ""))
                    }
                    className="pl-12 text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP : DISPONIBILITÉ */}
        {currentStepName === "Disponibilité" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid w-full items-center gap-2">
              <label className="text-sm font-medium">
                Disponibilité du produit *
              </label>
              <SelectorProducts
                data={IsAvailableProducts}
                onChange={(val) => {
                  setIsAvailable(val as IsAvailableType);
                  if (val !== "specific_sellers") setPermittedSellers([]);
                }}
                value={isAvailable}
                placeholder="Sélectionnez une option de disponibilité"
                disabled={loading || cannotModifySpecialInfo}
              />
            </div>

            {isAvailable === "specific_sellers" && (
              <div className="grid w-full items-center gap-2">
                <label className="text-sm font-medium">
                  Vendeurs autorisés
                </label>
                <p className="text-xs text-muted-foreground">
                  Sélectionnez les vendeurs autorisés à vendre ce produit.
                </p>
                <PermittedSellersSelect
                  data={shops}
                  value={permittedSellers}
                  onChange={setPermittedSellers}
                />
              </div>
            )}
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        {/* BUTTONS AND NAVIGATION */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={prev}
            disabled={step === 0 || loading}
          >
            Retour
          </Button>

          {step < steps.length - 1 ? (
            <Button
              key="btn-next" // 👈 La key empêche React de réutiliser ce bouton pour le submit
              type="button"
              onClick={(e) => next(e)}
              disabled={loading}
            >
              Suivant
            </Button>
          ) : (
            <Button
              key="btn-submit" // 👈 Bouton complètement distinct dans le DOM
              type="submit"
              disabled={loading}
            >
              {loading ? "Ajout..." : "Ajouter le produit"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default NewProductForm;
