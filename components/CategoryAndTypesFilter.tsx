"use client";

import { ShopCategorySellerType } from "@/types/data";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AllProductsTypesWithCategory, CategoriesData } from "@/utils/data";

// CATEGORiES
type Props = {
  category: ShopCategorySellerType;
  setCategory: React.Dispatch<React.SetStateAction<ShopCategorySellerType>>;
  setType: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  disabled?: boolean;
};

export const NewCategoriesData = CategoriesData.map((cat) => ({
  label: cat.label,
  value: cat.value as ShopCategorySellerType,
})).concat({ label: "Toutes les catégories", value: "all" });

export const CategorySellerFilter = (props: Props) => {
  const { category, setCategory, className, disabled, setType } = props;

  return (
    <Select
      value={category}
      onValueChange={(value) => {
        setCategory(value as ShopCategorySellerType);
        setType("all");
      }}
    >
      <SelectTrigger
        className={`${className || ""} w-full`}
        disabled={disabled}
      >
        <SelectValue placeholder="Catégorie" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {NewCategoriesData.length === 0 ? (
            <SelectItem value="none" disabled>
              Aucune categorie disponible
            </SelectItem>
          ) : (
            NewCategoriesData.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

// TYPES BASED ON CATEGORY
type TypeProps = {
  category: ShopCategorySellerType;
  type: string;
  setType: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  disabled?: boolean;
};

export const NewTypesData = [
  {
    label: "Tous les types",
    value: "all",
    category: "all",
  },
  ...AllProductsTypesWithCategory,
];

export const TypeSellerFilter = (props: TypeProps) => {
  const { category, type, setType, className, disabled } = props;

  const filteredTypes = NewTypesData.filter((t) =>
    category === "all" ? true : t.category === category,
  );

  return (
    <Select value={type} onValueChange={(value) => setType(value)}>
      <SelectTrigger
        className={`${className || ""} w-full`}
        disabled={disabled}
      >
        <SelectValue placeholder="Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {filteredTypes.length === 0 ? (
            <SelectItem value="none" disabled>
              Aucun élément disponible
            </SelectItem>
          ) : (
            filteredTypes.map((t, i) => (
              <SelectItem key={i.toString()} value={t.value}>
                {t.label}
              </SelectItem>
            ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
