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
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { PermittedSellersSelect } from "./PermittedSellersSelect";
import {
  SelectorProducts,
  SelectProductCategory,
  SelectProductType,
} from "./SelectProductCategories";
import { Input } from "../ui/input";
import {
  CategoriesData,
  NewAllProductsTypesWithCategory,
  StatesData,
  TargetData,
} from "@/utils/data";
import { Textarea } from "../ui/textarea";
import { ProductArticles } from "./ProductArticles";
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

const NewProductForm = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();

  const [step, setStep] = useState(0);

  const steps = [
    "Produit",
    "Variantes",
    "Classification",
    "Prix & Localisation",
    "Disponibilité",
  ];

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  // const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const [quality, setQuality] = useState("original");
  const [state, setState] = useState("nouveau"); // pas de choix pour l'instant, que du neuf
  const [brand, setBrand] = useState("");
  const [target, setTarget] = useState("");

  const [isAvailable, setIsAvailable] = useState<IsAvailableType>("for_all");
  const [permittedSellers, setPermittedSellers] = useState<string[]>([]);
  const [shops, setShops] = useState<any[]>([]);

  const [articles, setArticles] = useState([
    { color: "", size: "", quantity: 1 },
  ]);

  const [image, setImage] = useState<File | null>(null);

  const [commune, setCommune] = useState("");
  const [quartier, setQuartier] = useState("");
  const [avenue, setAvenue] = useState("");

  useEffect(() => {
    const fetchShops = async () => {
      const res = await fetch("/api/supplier/shops-list");
      const data = await res.json();
      setShops(data);
    };

    fetchShops();
  }, []);

  // CHECK ERRORRS
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const nameError = validateName(name);
    if (nameError) newErrors.name = nameError;

    const descError = validateDescription(description);
    if (descError) newErrors.description = descError;

    const imageError = validateImage(image);
    if (imageError) newErrors.image = imageError;

    const articlesError = validateArticles(articles);
    if (articlesError) newErrors.articles = articlesError;

    const categoryError = validateRequired(category, "Catégorie");
    if (categoryError) newErrors.category = categoryError;

    const typeError = validateRequired(type, "Type");
    if (typeError) newErrors.type = typeError;

    const stateError = validateRequired(state, "État");
    if (stateError) newErrors.state = stateError;

    const targetError = validateRequired(target, "Cible");
    if (targetError) newErrors.target = targetError;

    const communeError = validateRequired(commune, "Commune");
    if (communeError) newErrors.commune = communeError;

    const quartierError = validateRequired(quartier, "Quartier");
    if (quartierError) newErrors.quartier = quartierError;

    const avenueError = validateAvenue(avenue);
    if (avenueError) newErrors.avenue = avenueError;

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // HANDLE SUBMIT
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    let imageUrl = DEFAULT_SUPPLIER_IMAGE; // Valeur par défaut

    try {
      // If there are validation errors, show them in a toast and return
      const isValid = validateForm();

      if (!isValid || !image) {
        const errorMessages = Object.values(errors);

        toast.error(
          <div className="flex flex-col gap-1">
            <span className="text-red-700">
              Remplissez correcetment le formulaire
            </span>
            {Object.values(errors).map((err, i) => (
              <span key={i}>• {err}</span>
            ))}
          </div>,
          {
            duration: 8000,
          },
        );

        setLoading(false);
        return;
      }

      // FORM DATA
      const formData: NewSupplierProductType = {
        name: name.trim().toLocaleLowerCase(),
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
        image: imageUrl, // L'URL de l'image sera définie après l'upload
      };

      // SEND DATA to API
      const newProduct = await createNewProduct(formData);

      if (newProduct.error) {
        console.error(newProduct.message);

        toast.error(newProduct.message);

        setLoading(false);
        return;
      }

      // IMAGE UPLOAD to Firebase Storage
      const imgId = v4().toString().replace(/-/g, "");
      const storageRef = ref(
        storage,
        `oteki/supplier-products/images/${imgId}`,
      );
      const snapshot = await uploadBytes(storageRef, image);
      imageUrl = await getDownloadURL(snapshot.ref);

      // SEND IMAGE URL TO UPDATE
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

      toast.success(`${newProduct.message}: ${newProduct.productId}`);
      router.refresh();

      setName("");
      setDescription("");
      setImage(null);
      setCategory("");
      setType("");
      setAvenue("");
      setCommune("");
      setQuartier("");
      setIsAvailable("for_all");
      setPermittedSellers([]);
      setBrand("");
      setState("");
      setTarget("");
      setStep(0);
      setPrice("");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Une erreur est survenue lors de l'ajout du produit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-4 w-full flex flex-col gap-6">
      {/* TOP TEXT */}
      <div>
        <PackagePlus className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
        <h3 className="text-center">Nouveau Produit</h3>
      </div>

      {/* STEPS */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((label, i) => (
          <div key={i} className="flex-1 flex items-center">
            <div
              className={`
          flex items-center justify-center
          w-8 h-8 rounded-full text-xs font-medium
          ${
            i <= step
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground"
          }
        `}
            >
              {i + 1}
            </div>

            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 ${
                  i < step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mb-4">{steps[step]}</p>

      <div
        key={step}
        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        {/* STEP 0: Product Information */}
        {step === 0 && (
          <div className="space-y-4">
            {/* IMAGE */}
            <div className="w-full flex flex-col gap-2">
              {/* <label htmlFor="image" className="text-sm font-medium">
            Image du produit *
          </label> */}

              <div className="w-full">
                {image ? (
                  <div
                    className="relative w-full h-64 rounded-xl overflow-hidden 
                border bg-gray-100"
                  >
                    <Image
                      src={URL.createObjectURL(image)}
                      alt="Product Image"
                      fill
                      className="object-cover"
                    />

                    {/* Bouton supprimer minimaliste */}
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="
                    absolute top-3 right-3
                    h-8 w-8 flex items-center justify-center
                    rounded-full
                    bg-white/80 backdrop-blur
                    border shadow-sm
                    hover:bg-white
                    transition
                    font-bold
                  "
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="image"
                    className="
                  flex flex-col items-center justify-center
                  w-full h-64
                  border border-dashed rounded-xl
                  cursor-pointer
                  hover:bg-gray-50
                  transition
                "
                  >
                    <div className="text-center space-y-1">
                      <p className="text-sm text-gray-600">Ajouter une image</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
                    </div>

                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImage(e.target.files[0]);
                        }
                      }}
                      className="hidden text-sm"
                    />
                  </label>
                )}
              </div>
            </div>
            {/* NAME */}
            <div className="grid w-full items-center gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nom du produit *
              </label>
              <Input
                id="name"
                placeholder="Ex: T-shirt Otekis"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-sm"
                disabled={loading}
              />
            </div>

            {/* BRAND */}
            <div className="grid w-full items-center gap-2">
              <label htmlFor="state" className="text-sm font-medium">
                Marque du produit *
              </label>
              <Input
                placeholder="Ex: Nike, Apple..."
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="text-sm"
                disabled={loading}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="grid w-full items-center gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description du produit *
              </label>
              <Textarea
                id="description"
                placeholder="Ex: Un t-shirt 100% coton bio avec le logo Otekis..."
                required
                minLength={5}
                maxLength={2000}
                className="max-h-40 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Articles */}
        {step === 1 && (
          <ProductArticles articles={articles} setArticles={setArticles} />
        )}

        {/* STEP 2: Classification */}
        {step === 2 && (
          <div className="space-y-4">
            {/* CATEGORY --- TYPE */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CATEGORY */}
              <div className="grid w-full items-center gap-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Catégorie *
                </label>
                <SelectProductCategory
                  categories={CategoriesData}
                  selectedCategory={category}
                  onCategoryChange={(cat) => {
                    setCategory(cat);
                    setType("");
                  }}
                  required
                  disabled={loading}
                />
              </div>

              {/* TYPE */}
              <div className="grid w-full items-center gap-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Type de produit *
                </label>
                <SelectProductType
                  types={NewAllProductsTypesWithCategory}
                  selectedType={type}
                  onTypeChange={setType}
                  required
                  category={category}
                  disabled={!category || loading}
                />
              </div>
            </div>

            <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
              {/* QUALITY */}
              {/* <div className="grid w-full items-center gap-2">
              <label htmlFor="quality" className="text-sm font-medium">
                Qualité
              </label>
              <SelectorProducts
                data={QualitiesData}
                onChange={setQuality}
                value={quality}
                placeholder="Sélectionnez une qualité"
              />
            </div> */}

              {/* STATE */}
              <div className="grid w-full items-center gap-2">
                <label htmlFor="state" className="text-sm font-medium">
                  État du produit *
                </label>
                <SelectorProducts
                  data={StatesData}
                  onChange={setState}
                  value={state}
                  placeholder="Sélectionnez un état"
                  disabled={loading}
                />
              </div>

              {/* Target */}
              <div className="grid w-full items-center gap-2">
                <label htmlFor="quality" className="text-sm font-medium">
                  Cible *
                </label>
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

        {/* STEP 3: PRICE & Address */}
        {step === 3 && (
          <div className="space-y-4">
            {/* PRICE */}
            <div className="grid w-full items-center gap-2">
              <label htmlFor="price" className="text-sm font-medium">
                Prix ($) du produit *
              </label>
              <Input
                id="price"
                type="number"
                placeholder="Ex: 29.99"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* ADDRESS */}
            <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
              {/* COMMUNE */}
              <div className="grid w-full items-center gap-2">
                <label htmlFor="commune" className="text-sm font-medium">
                  Commune *
                </label>

                <SelectorProducts
                  data={communesKinshasa.map((c) => {
                    return { label: c, value: c.toLowerCase() };
                  })}
                  onChange={(val) => {
                    setCommune(val as string);
                    setQuartier("");
                  }}
                  value={commune}
                  placeholder="Sélectionnez la commune"
                  disabled={loading}
                  required
                />
              </div>

              {/* QUARTIER */}
              <div className="grid w-full items-center gap-2">
                <label htmlFor="quartier" className="text-sm font-medium">
                  Quartier *
                </label>
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
                  disabled={!commune || loading}
                />
              </div>
            </div>

            {/* ADDRESS 2 AVENUE ET NUMERO */}
            <div className="grid w-full items-center gap-2">
              <label htmlFor="avenue" className="text-sm font-medium">
                Avenue et numéro *
              </label>
              <Input
                id="avenue"
                placeholder="Ex: busu-melo, 12"
                value={avenue}
                onChange={(e) => setAvenue(e.target.value)}
                className="text-sm"
                disabled={loading}
                required
              />
            </div>
          </div>
        )}

        {/* STEP 4: Availability */}
        {step === 4 && (
          <div className="space-y-4">
            {/* Is Available */}
            <div className="grid w-full items-center gap-2">
              <label htmlFor="isAvailable" className="text-sm font-medium">
                Disponibilité du produit *
              </label>
              <SelectorProducts
                data={IsAvailableProducts}
                onChange={(val) => {
                  setIsAvailable(val as IsAvailableType);
                  if (val !== "specific_sellers") {
                    setPermittedSellers([]);
                  }
                }}
                value={isAvailable}
                placeholder="Sélectionnez une option de disponibilité"
                disabled={loading}
                required
              />
            </div>

            {/* Permitted Sellers (if specific_sellers) */}
            {isAvailable === "specific_sellers" && (
              <div className="grid w-full items-center gap-2">
                <label
                  htmlFor="permittedSellers"
                  className="text-sm font-medium"
                >
                  Vendeurs autorisés
                </label>

                <p className="text-xs">
                  Sélectionnez les vendeurs autorisés à vendre ce produit.
                  Ecrivez et ajoutez les vendeurs un par un dans le champ de
                  sélection. Vous pourrez modifier cette liste plus tard si
                  besoin.
                </p>

                <PermittedSellersSelect
                  data={shops} // TODO: list of sellers
                  value={permittedSellers}
                  onChange={setPermittedSellers}
                />
              </div>
            )}
          </div>
        )}

        {/* BUTTONS AND NAVIGATIONS */}
        <div className="flex items-center justify-between mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={prev}
            disabled={step === 0}
          >
            Retour
          </Button>

          {step < steps.length - 1 ? (
            <Button type="button" onClick={next}>
              Suivant
            </Button>
          ) : (
            <Button type="submit" disabled={loading} onClick={handleSubmit}>
              {loading ? "Ajout..." : "Ajouter le produit"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewProductForm;
