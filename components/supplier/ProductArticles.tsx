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
};

interface ProductArticlesProps {
  articles: ArticleType[];
  setArticles: React.Dispatch<React.SetStateAction<ArticleType[]>>;
}

export const ProductArticles: React.FC<ProductArticlesProps> = ({
  articles,
  setArticles,
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
    if (articles.length === 1) return; // au moins 1
    setArticles(articles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* LABEL */}
      <div>
        <p className="text-sm font-medium">Articles</p>
        <p className="text-xs text-muted-foreground">
          La taille peut être 0 et la couleur "autre" si vous ne connaissez pas.
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {articles.map((article, index) => (
          <div
            key={index}
            className="p-3 border rounded-xl space-y-3 bg-muted/30"
          >
            {/* ROW */}
            <div className="grid grid-cols-3 gap-2">
              {/* COLOR */}
              {/* <Input
                placeholder="Couleur"
                onChange={(e) => handleChange(index, "color", e.target.value)}
              /> */}
              <Select
                value={article.color}
                onValueChange={(value) => handleChange(index, "color", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="La couleur" />
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

              {/* SIZE */}
              <Input
                placeholder="Taille"
                value={article.size}
                onChange={(e) => handleChange(index, "size", e.target.value)}
              />

              {/* QUANTITY */}
              <Input
                type="number"
                min={1}
                placeholder="Qté"
                value={article.quantity}
                onChange={(e) =>
                  handleChange(index, "quantity", e.target.value)
                }
              />
            </div>

            {/* ACTION */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeArticle(index)}
                disabled={articles.length === 1}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD BUTTON */}
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={addArticle}
      >
        <Plus className="h-4 w-4" />
        Ajouter un article
      </Button>
    </div>
  );
};
