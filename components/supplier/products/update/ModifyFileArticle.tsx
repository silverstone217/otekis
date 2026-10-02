"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileArchive,
  Upload,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  isZipFile,
  MAX_ZIP_SIZE,
  uploadArticleFile,
  deleteArticleFile,
} from "@/lib/firebase-files";
import {
  updateArticleFile,
  deleteSupplierArticleFile,
} from "@/actions/supplierAction";
import { useRouter } from "next/navigation";

// Helper pour afficher proprement la taille en Mo ou Go
const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(0)} Mo`;
};

type Props = {
  productId: string;
  articleId: string;
  fileUrl: string | null;
};

const ModifyFileArticle = ({ productId, articleId, fileUrl }: Props) => {
  const [currentFile, setCurrentFile] = useState<string | null>(fileUrl);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // 🔹 Sélection d'un fichier ZIP
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

    if (selected.size > MAX_ZIP_SIZE) {
      toast.error("Fichier trop volumineux", {
        description: `Taille maximale autorisée : ${formatFileSize(MAX_ZIP_SIZE)}.`,
      });
      e.target.value = "";
      return;
    }

    setFile(selected);
  };

  // 🔹 Envoi du nouveau fichier (Firebase + Server Action Prisma)
  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    let uploadedFile = null;

    try {
      // 1. Upload sur Firebase Storage
      uploadedFile = await uploadArticleFile(file, `oteki/supplier-products`);

      // 2. Mise à jour de l'URL de l'article dans Prisma
      const res = await updateArticleFile({
        articleId,
        productId,
        fileUrl: uploadedFile.url,
      });

      if (res.error) {
        // En cas d'échec serveur, on supprime le fichier fraîchement envoyé
        await deleteArticleFile(uploadedFile.path);
        toast.error(res.message);
        return;
      }

      setCurrentFile(uploadedFile.url);
      setFile(null);
      toast.success("Fichier ZIP mis à jour avec succès");
      router.refresh();
    } catch (error) {
      if (uploadedFile) await deleteArticleFile(uploadedFile.path);
      console.error("Erreur lors de l'upload du fichier :", error);
      toast.error("Une erreur est survenue lors de l'envoi du fichier");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Suppression du fichier existant
  const handleDelete = async () => {
    if (!currentFile) return;

    if (!confirm("Voulez-vous vraiment supprimer ce fichier ZIP ?")) return;

    setLoading(true);

    try {
      // 1. Mise à jour dans Prisma (Met fileUrl à null)
      const res = await deleteSupplierArticleFile({
        articleId,
        productId,
      });

      if (res.error) {
        toast.error(res.message);
        return;
      }

      // 2. Suppression du fichier dans Firebase Storage
      await deleteArticleFile(currentFile);

      setCurrentFile(null);
      setFile(null);
      toast.success("Fichier supprimé avec succès");
      router.refresh();
    } catch (error) {
      console.error("Erreur suppression :", error);
      toast.error("Erreur lors de la suppression du fichier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-xl p-5 space-y-4 bg-card shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-base flex items-center gap-2">
          <FileArchive className="h-5 w-5 text-primary" />
          Fichier numérique (ZIP)
        </h4>
      </div>

      {/* CAS 1 : Un fichier existe déjà */}
      {currentFile ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileArchive className="h-8 w-8 text-blue-500 shrink-0" />
            <div className="truncate">
              <p className="text-sm font-medium text-foreground">
                Fichier ZIP associé
              </p>
              <a
                href={currentFile}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
              >
                Accéder au fichier <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Supprimer
          </Button>
        </div>
      ) : (
        /* CAS 2 : Aucun fichier (Formulaire d'upload) */
        <div className="space-y-4">
          <div className="w-full">
            {file ? (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div className="truncate text-sm">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={loading}
                >
                  ✕
                </Button>
              </div>
            ) : (
              <label
                htmlFor="zip-upload"
                className="flex flex-col items-center justify-center w-full h-32 border border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition"
              >
                <div className="text-center space-y-1">
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Sélectionner un fichier ZIP
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Format .zip uniquement (Max {formatFileSize(MAX_ZIP_SIZE)})
                  </p>
                </div>
                <Input
                  id="zip-upload"
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {file && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={loading}
              className="w-full flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Envoi en cours..." : "Téléverser le fichier ZIP"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModifyFileArticle;
