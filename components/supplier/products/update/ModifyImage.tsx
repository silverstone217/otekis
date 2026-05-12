"use client";

import { supplierProductImages } from "@/actions/supplierAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storage } from "@/lib/firebase";
import { DEFAULT_SUPPLIER_IMAGE } from "@/utils/envVariables";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { v4 } from "uuid";

type Props = {
  ImageProps: {
    image: string;
    productId: string;
  };
};

const ModifyImage = ({ ImageProps }: Props) => {
  const { image, productId } = ImageProps;

  const [currentImage] = useState(image);
  const [newImage, setNewImage] = useState<File | null>(null);

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const preview = newImage ? URL.createObjectURL(newImage) : currentImage;

  const isDefaultImage = currentImage === DEFAULT_SUPPLIER_IMAGE;

  const handleUpdateImage = async () => {
    setLoading(true);

    try {
      if (!newImage) {
        toast.error("Veuillez sélectionner une nouvelle image");
        return;
      }

      let imageUrl = "";

      // 🔴 1. DELETE OLD IMAGE (si existe)
      if (currentImage && !isDefaultImage) {
        try {
          const oldRef = ref(storage, currentImage);
          await deleteObject(oldRef);
        } catch (err) {
          console.warn("Impossible de supprimer l'ancienne image:", err);
          // ⚠️ on ne bloque pas le flow (important UX)
        }
      }

      // 🟢 2. UPLOAD NEW IMAGE
      const imgId = v4().replace(/-/g, "");
      const storageRef = ref(
        storage,
        `oteki/supplier-products/images/${imgId}`,
      );

      const snapshot = await uploadBytes(storageRef, newImage);
      imageUrl = await getDownloadURL(snapshot.ref);

      // 🟣 3. UPDATE PRODUCT (SERVER ACTION)
      const res = await supplierProductImages({
        image: imageUrl,
        productId,
        images: [],
      });

      if (res.error) {
        toast.error(res.message);
        return;
      }

      // ✅ SUCCESS
      toast.success("Image mise à jour avec succès");

      // update local state
      setNewImage(null);
      router.refresh();
    } catch (error) {
      console.error("error on update image", error);
      toast.error("Oops ! Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* LABEL */}
      <div>
        <p className="text-sm font-medium">Image du produit</p>
        <p className="text-xs text-muted-foreground">
          Modifiez l’image principale du produit
        </p>
      </div>

      {/* IMAGE DISPLAY */}
      <div className="w-full">
        <div
          className="
            relative w-full h-64
            rounded-xl overflow-hidden
            border bg-muted
          "
        >
          <Image
            src={preview}
            alt="Product Image"
            fill
            className="object-cover transition"
          />

          {/* ACTIONS */}
          <div className="absolute top-3 right-3 flex gap-2">
            {/* RESET (si nouvelle image) */}
            {newImage && (
              <button
                type="button"
                onClick={() => setNewImage(null)}
                className="
                  h-8 px-3 text-xs
                  rounded-full
                  bg-white/80 backdrop-blur
                  border shadow-sm
                  hover:bg-white
                  transition
                "
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>

      {/* INPUT */}
      {newImage ? (
        <Button
          onClick={() => handleUpdateImage()}
          disabled={loading || !newImage || !productId}
        >
          {loading && <Loader className="animate-spin" />} Remplacer
        </Button>
      ) : (
        <label
          htmlFor="image"
          className="
          flex flex-col items-center justify-center
          w-full h-20
          border border-dashed rounded-xl
          cursor-pointer
          hover:bg-muted/40
          transition
        "
        >
          <div className="text-center space-y-1">
            <p className="text-sm">
              {newImage ? "Changer l’image" : "Remplacer l’image"}
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
          </div>

          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (!file) return;

              const maxSize = 2 * 1024 * 1024; // 2MB

              // CHECK TYPE
              if (!file.type.startsWith("image/")) {
                toast.error("Veuillez sélectionner une image valide");
                return;
              }

              // CHECK SIZE
              if (file.size > maxSize) {
                toast.error("L'image doit être inférieure à 2MB");
                return;
              }

              // ✅ OK
              setNewImage(file);
            }}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};

export default ModifyImage;
