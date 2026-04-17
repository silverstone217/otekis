"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorsData } from "@/utils/dataAdd";
import { toast } from "sonner";
import { addNewArticle, deleteArticleById } from "@/actions/supplierAction";

type ProductArticles = {
  articles: {
    color: string | null;
    size: string | null;
    stock: number;
    id: string;
  }[];
  productId: string;
};

const Articles = ({ articles, productId }: ProductArticles) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [newArticle, setNewArticle] = useState({
    color: "",
    size: "",
    stock: 1,
  });

  const handleAddNewArticle = async () => {
    setLoading(true);
    try {
      const payload = {
        article: newArticle,
        productId,
      };
      const result = await addNewArticle(payload);
      if (result.error) throw new Error(result.message);

      toast.success("Nouvel article enregistré");
      router.refresh();
      setIsAdding(false);
      setNewArticle({ color: "", size: "", stock: 1 });
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteById = async (id: string) => {
    setLoading(true);
    setIsAdding(false);
    try {
      const result = await deleteArticleById({ articleId: id, productId });
      if (result.error) throw new Error(result.message);

      toast.success("Cet article supprimé");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-4">
      {/* HEADER DISCRET */}
      <header className="space-y-1">
        <h2 className="text-xl font-medium tracking-tight">Variantes</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Gérez les stocks par couleur et taille. Utilisez{" "}
          <strong>Autre</strong> ou <strong>0</strong> si non applicable.
        </p>
      </header>

      <div className="space-y-6">
        {/* LISTE DES ARTICLES EXISTANTS */}
        <div className="space-y-3">
          <div className="grid grid-cols-[2fr_1fr_1fr_40px] gap-4 px-2">
            <Label className="text-[13px] font-medium text-muted-foreground">
              Couleur
            </Label>
            <Label className="text-[13px] font-medium text-muted-foreground text-center">
              Taille
            </Label>
            <Label className="text-[13px] font-medium text-muted-foreground text-center">
              Stock
            </Label>
            <div />
          </div>

          {articles.map((item, index) => (
            <div
              key={index}
              className="group grid grid-cols-[2fr_1fr_1fr_40px] items-center gap-4 p-2 rounded-xl border border-transparent hover:bg-muted/30 transition-all duration-200"
            >
              <Select value={item.color ?? ""} disabled>
                <SelectTrigger className="h-9 bg-transparent border-muted/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ColorsData.map((col) => (
                    <SelectItem key={col.value} value={col.value}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                value={item.size ?? ""}
                disabled
                className="h-9 text-center bg-transparent border-muted/60"
              />

              <Input
                value={item.stock}
                disabled
                className="h-9 text-center bg-transparent border-muted/60"
              />

              <Button
                variant="ghost"
                size="icon"
                disabled={articles.length === 1 || loading}
                className="h-9 w-9 opacity-0 group-hover:opacity-100 
                transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => handleDeleteById(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* SECTION AJOUT RAPIDE */}
        {isAdding ? (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-[2fr_1fr_1fr_40px] items-center gap-4 p-3 rounded-2xl border bg-card shadow-sm">
              <Select
                value={newArticle.color}
                onValueChange={(val) =>
                  setNewArticle((prev) => ({ ...prev, color: val }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Couleur" />
                </SelectTrigger>
                <SelectContent>
                  {ColorsData.map((col) => (
                    <SelectItem key={col.value} value={col.value}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Taille"
                value={newArticle.size}
                onChange={(e) =>
                  setNewArticle((prev) => ({
                    ...prev,
                    size: e.target.value,
                  }))
                }
                className="h-9 text-center"
              />

              <Input
                type="number"
                min={1}
                value={newArticle.stock}
                onChange={(e) =>
                  setNewArticle((prev) => ({
                    ...prev,
                    stock: Number(e.target.value),
                  }))
                }
                className="h-9 text-center"
              />

              <Button
                size="icon"
                onClick={() => handleAddNewArticle()}
                className="h-9 w-9 shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsAdding(false)}
              className="mt-2 text-muted-foreground"
            >
              Annuler
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="w-full h-11 border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all rounded-xl"
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une variante
          </Button>
        )}
      </div>
    </div>
  );
};

export default Articles;
