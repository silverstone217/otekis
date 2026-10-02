"use client";
import { Article, Product } from "@/lib/generated/prisma/client";
import { ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { isEmptyString } from "@/utils/functions";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addItemForProduct } from "@/actions/actions";
import { toast } from "sonner";
import {
  deleteArticleFile,
  isZipFile,
  MAX_ZIP_SIZE,
  uploadArticleFile,
  UploadedFile,
} from "@/lib/firebase-files";

type Props = {
  article: Article;
};

export const AddDigitalArticle = ({ product }: { product: Product }) => {
  const [commandNumber, setCommandNumber] = useState("");
  const [color] = useState("nothing");
  const [size] = useState("0");
  const [stock] = useState("1");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFormValid =
    ![commandNumber, color, size, stock].some(isEmptyString) && !!file;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }

    if (!isZipFile(selected)) {
      toast.error("Format invalide", {
        description: "Seuls les fichiers .zip sont acceptés.",
      });
      e.target.value = "";
      setFile(null);
      return;
    }

    if (selected.size > MAX_ZIP_SIZE) {
      toast.error("Fichier trop volumineux", {
        description: `Taille maximale : ${MAX_ZIP_SIZE / (1024 * 1024)} Mo.`,
      });
      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    let uploaded: UploadedFile | null = null;

    try {
      // 1. Upload sur Firebase
      uploaded = await uploadArticleFile(file);

      // 2. Enregistrement en base
      const item = {
        color,
        size: size.toLowerCase(),
        stock: Number(stock),
        commandNumber: commandNumber.trim().toLowerCase(),
        file: uploaded.url,
      };

      const addItem = await addItemForProduct(product.id, item);

      if (addItem.error) {
        // Le serveur a refusé : on supprime le fichier
        await deleteArticleFile(uploaded.path);
        toast.error(addItem.message);
        return;
      }

      toast.success("Article ajouté", { description: addItem.message });

      setCommandNumber("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      router.refresh();
    } catch (error) {
      // Erreur serveur/réseau : on supprime le fichier s'il a été envoyé
      if (uploaded) await deleteArticleFile(uploaded.path);

      toast.error("Erreur", { description: (error as Error).message });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="w-full lg:w-auto px-6 py-3 bg-primary text-white font-semibold rounded-md shadow-md
              hover:bg-primary/90 transition flex items-center justify-center gap-3"
      >
        <Plus className="w-6 h-6" />
        Ajouter
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white text-black max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Ajouter un nouvel article</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Veuillez renseigner les informations du nouvel article. Si un
            article ne contient pas de couleur mettez{" "}
            <strong>aucune couleur</strong>. Le fichier doit être au format{" "}
            <strong>.zip</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <Input
            value={commandNumber}
            onChange={(e) => setCommandNumber(e.target.value)}
            disabled={loading}
            placeholder="Numéro de commande"
            autoComplete="off"
            minLength={1}
            maxLength={40}
          />

          <div className="flex flex-col gap-1">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              onChange={handleFileChange}
              disabled={loading}
              aria-label="Choisir un fichier zip"
            />
            {file && (
              <p className="text-xs text-muted-foreground truncate">
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} Mo)
              </p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading || !isFormValid}
            onClick={handleSubmit}
          >
            {loading ? "En cours..." : "Ajouter"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
