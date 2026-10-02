"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorsData } from "@/utils/dataAdd";

export type ArticleType = {
  color: string;
  size: string;
  quantity: number;
  isFileProduct?: boolean;
};

interface ProductArticlesProps {
  articles: ArticleType[];
  setArticles: React.Dispatch<React.SetStateAction<ArticleType[]>>;
  isFileProduct?: boolean;
}

export const ProductArticles: React.FC<ProductArticlesProps> = ({
  articles,
  setArticles,
  isFileProduct,
}) => {
  const handleChange = (
    index: number,
    field: keyof ArticleType,
    value: string | number,
  ) => {
    const updated = [...articles];
    updated[index] = {
      ...updated[index],
      [field]: field === "quantity" ? Number(value) || 1 : value,
    };
    setArticles(updated);
  };

  const addArticle = () => {
    setArticles([...articles, { color: "", size: "", quantity: 1 }]);
  };

  const removeArticle = (index: number) => {
    if (articles.length === 1) return;
    setArticles(articles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="space-y-1">
        <p className="text-sm font-medium">Articles *</p>
        <p className="text-xs text-muted-foreground">
          Ajoutez les différentes variantes de votre produit (ex: couleurs,
          tailles et quantités disponibles). Vous pourrez les modifier plus tard
          si besoin.
        </p>
        <p className="text-xs text-muted-foreground">
          Mettez <strong>Autre</strong> si la couleur est différente de celles
          proposées ou si vous ne souhaitez pas préciser la couleur. <br />
          Mettez <strong>0</strong> si la taille n'est pas applicable (ex: pour
          les accessoires).
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {articles.map((article, index) => (
          <div
            key={index}
            className="
            group
            grid
            grid-cols-[2fr_1fr_1fr_auto]
            items-center
            gap-3
            w-full
            p-3
            rounded-xl
            border
            bg-background
            hover:border-muted-foreground/30
            transition
      "
          >
            {/* COLOR */}
            <div className="min-w-0">
              <Select
                value={article.color}
                onValueChange={(value) => handleChange(index, "color", value)}
                disabled={isFileProduct}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Couleur" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {ColorsData.map((col) => (
                      <SelectItem key={col.value} value={col.value}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* SIZE */}
            <Input
              className="h-9 w-full min-w-0"
              placeholder="Taille"
              value={article.size}
              onChange={(e) => handleChange(index, "size", e.target.value)}
              disabled={isFileProduct}
            />

            {/* QUANTITY */}
            <Input
              type="number"
              min={1}
              className="h-9 w-full min-w-0 text-center"
              value={article.quantity}
              onChange={(e) => handleChange(index, "quantity", e.target.value)}
              disabled={isFileProduct}
            />

            {/* DELETE */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeArticle(index)}
              disabled={
                articles.length === 1 ||
                (isFileProduct && articles.length === 1)
              }
              className="
          h-9 w-9
          opacity-0
          group-hover:opacity-100
          transition
          shrink-0
        "
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500 transition" />
            </Button>
          </div>
        ))}
      </div>

      {/* ADD BUTTON */}
      <Button
        type="button"
        variant="outline"
        className="
          w-full
          h-11
          flex items-center justify-center gap-2
          rounded-xl
          border-dashed
          text-muted-foreground
          hover:text-foreground
          transition
        "
        disabled={isFileProduct && articles.length >= 1}
        onClick={addArticle}
      >
        <Plus className="h-4 w-4" />
        Ajouter un article
      </Button>
    </div>
  );
};
