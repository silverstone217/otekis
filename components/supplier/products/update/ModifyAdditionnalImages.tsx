"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { v4 } from "uuid";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "@/lib/firebase";
import { supplierProductImages } from "@/actions/supplierAction";
import { useRouter } from "next/navigation";

type Props = {
  ImageProps: {
    images: string[];
    productId: string;
    productImage: string;
  };
};

const MAX_IMAGES = 4;
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const ModifyAdditionnalImages = ({ ImageProps }: Props) => {
  const { images, productId, productImage } = ImageProps;

  const [newImage, setNewImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // preview local
  const preview = useMemo(() => {
    if (!newImage) return null;
    return URL.createObjectURL(newImage);
  }, [newImage]);

  // HANDLE FILE
  const handleSelectImage = (file?: File) => {
    if (!file) return;

    // IMAGE ONLY
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide");
      return;
    }

    // SIZE
    if (file.size > MAX_SIZE) {
      toast.error("L'image doit être inférieure à 2MB");
      return;
    }

    setNewImage(file);
  };

  // ADD IMAGE
  const handleAddImage = async () => {
    try {
      setLoading(true);

      if (!newImage) return;

      // TODO:
      // upload image
      // IMAGE UPLOAD to Firebase Storage
      const imgId = v4().toString().replace(/-/g, "");
      const storageRef = ref(
        storage,
        `oteki/supplier-products/images/${imgId}`,
      );
      const snapshot = await uploadBytes(storageRef, newImage);
      const imageUrl = await getDownloadURL(snapshot.ref);
      // update product

      // 🟣 3. UPDATE PRODUCT (SERVER ACTION)
      const res = await supplierProductImages({
        image: productImage,
        productId,
        images: [...images, imageUrl],
      });

      if (res.error) {
        toast.error(res.message);
        return;
      }

      toast.success("Image ajoutée");
      setNewImage(null);
      images.push(imageUrl); // update local state (optimistic)
      router.refresh();
    } catch (error) {
      toast.error("Impossible d'ajouter l'image");
    } finally {
      setLoading(false);
    }
  };

  // DELETE IMAGE
  const handleDeleteImage = async (image: string) => {
    try {
      // TODO:
      // remove image from db
      const delRef = ref(storage, image);
      await deleteObject(delRef);

      const updatedImages = images.filter((img) => img !== image);

      // 🟣 3. UPDATE PRODUCT (SERVER ACTION)
      const res = await supplierProductImages({
        image: productImage,
        productId,
        images: updatedImages,
      });

      if (res.error) {
        toast.error(res.message);
        return;
      }

      toast.success("Image supprimée");
      images.splice(images.indexOf(image), 1); // update local state (optimistic)
      router.refresh();
    } catch (error) {
      toast.error("Impossible de supprimer l'image");
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* LABEL */}
      <div>
        <p className="text-sm font-medium">Les images du produit</p>

        <p className="text-xs text-muted-foreground">
          Modifiez les images additionnelles du produit
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* EXISTING IMAGES */}
        {images.map((image, idx) => (
          <div
            key={`${image}-${idx}`}
            className="
              relative h-44 rounded-xl overflow-hidden
              border bg-muted
            "
          >
            {/* IMAGE */}
            <Image
              src={image}
              alt={`Image ${idx + 1}`}
              fill
              className="object-cover"
            />

            {/* DELETE */}
            <button
              type="button"
              onClick={() => handleDeleteImage(image)}
              className="
                absolute top-2 right-2
                w-8 h-8 rounded-full
                bg-red-500 text-white
                flex items-center justify-center
                shadow-md
                hover:scale-105 transition
              "
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* ADD NEW IMAGE */}
        {images.length < MAX_IMAGES && (
          <div
            className="
              relative h-44 rounded-xl overflow-hidden
              border bg-muted
              flex items-center justify-center
            "
          >
            {/* PREVIEW */}
            {preview ? (
              <>
                <Image
                  src={preview}
                  alt="Nouvelle image"
                  fill
                  className="object-cover"
                />

                {/* ACTIONS */}
                <div className="absolute top-2 right-2 flex gap-2">
                  {/* CANCEL */}
                  <button
                    type="button"
                    onClick={() => setNewImage(null)}
                    className="
                      w-8 h-8 rounded-full
                      bg-red-500 text-white
                      flex items-center justify-center
                      shadow-md
                    "
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* ADD */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleAddImage}
                    className="
                      w-8 h-8 rounded-full
                      bg-green-500 text-white
                      flex items-center justify-center
                      shadow-md
                    "
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* INPUT */}
                <label
                  className="
                    flex flex-col items-center justify-center
                    gap-2 cursor-pointer
                    text-muted-foreground
                    w-full h-full
                  "
                >
                  <ImagePlus className="w-8 h-8" />

                  <span className="text-sm">Ajouter une image</span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleSelectImage(e.target.files?.[0])}
                  />
                </label>
              </>
            )}
          </div>
        )}

        {/* EMPTY BOXES */}
        {Array.from({
          length:
            MAX_IMAGES - images.length - (images.length < MAX_IMAGES ? 1 : 0),
        }).map((_, idx) => (
          <div
            key={idx}
            className="
              rounded-xl overflow-hidden
              border bg-muted h-44
            "
          />
        ))}
      </div>
    </div>
  );
};

export default ModifyAdditionnalImages;
