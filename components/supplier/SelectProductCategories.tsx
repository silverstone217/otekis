"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type CategorriesType = {
  label: string;
  value: string;
};
export type SelectProductCategoryProps = {
  categories: CategorriesType[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  required?: boolean;
  disabled?: boolean;
};

export const SelectProductCategory: React.FC<SelectProductCategoryProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  required = false,
  disabled = false,
}) => {
  return (
    <Select
      onValueChange={onCategoryChange}
      defaultValue={selectedCategory}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Sélectionnez une catégorie" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

// TYPES
export type TypesType = {
  label: string;
  value: string;
  category: CategorriesType["value"];
};

export type SelectProductTypeProps = {
  types: TypesType[];
  selectedType: string;
  onTypeChange: (type: string) => void;
  required?: boolean;
  disabled?: boolean;
  category: CategorriesType["value"];
};

export const SelectProductType: React.FC<SelectProductTypeProps> = ({
  types,
  selectedType,
  onTypeChange,
  required = false,
  disabled = false,
  category,
}) => {
  const filteredTypes = types.filter((type) =>
    type.category.includes(category),
  );

  return (
    <Select
      value={selectedType}
      onValueChange={onTypeChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Sélectionnez un type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {filteredTypes.map((type, idx) => (
            <SelectItem
              key={`${type.category}-${type.value}`}
              value={type.value}
            >
              {type.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

// DEFAULT SELECTORS

type SelectorProductsProps = {
  data: {
    label: string;
    value: string;
  }[];
  onChange: (value: string) => void;
  value: string;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;

  // ✅ NEW
  className?: string;
  triggerClassName?: string;
};

export const SelectorProducts = ({
  data,
  onChange,
  value,
  placeholder,
  disabled = false,
  required = false,
  className,
  triggerClassName,
}: SelectorProductsProps) => {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      required={required}
    >
      <SelectTrigger className={cn("w-full", triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {data.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
