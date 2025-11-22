"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorsData } from "@/utils/dataAdd";
import { Article, Product } from "@prisma/client";
import { ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
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
import {
  addItemForProduct,
  modifyStockArticle,
  ModifyStockArticleWithoutHistOrders,
  DeleteItemForProductWithHistoricOrder,
} from "@/actions/actions";
import { isEmptyString } from "@/utils/functions";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Props = {
  article: Article;
};
//MODIFY ARTICLE
export const ModifyArticle = ({ article }: Props) => {
  const [color, setColor] = useState(article.color ?? "");
  const [size, setSize] = useState(article.size ?? "");
  const [stock, setStock] = useState("");
  const [commandNumber, setCommandNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isUnchanged =
    size === article.size &&
    color === article.color &&
    commandNumber === article.commandNumber &&
    stock === article.stock.toString();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const item = {
        color,
        size: size.toLowerCase().trim(),
        stock: Number(stock),
        commandNumber: commandNumber.trim(),
        id: article.id,
      };

      const addItem = await DeleteItemForProductWithHistoricOrder(
        article.productId,
        item
      );
      if (addItem.error) {
        toast.error(addItem.message);
        return;
      }
      toast.success("Article modifié", { description: addItem.message });
      router.refresh();
    } catch (error) {
      toast.error("Erreur", { description: (error as Error).message });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        // disabled
        className="text-left w-full p-2 text-sm font-medium  hover:bg-secondary disabled:text-gray-500
        disabled:cursor-not-allowed text-destructive
        "
      >
        {`Correction`}
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white text-black max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{`Correction`}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Veuillez renseigner les informations de {`l'article`}.
            <br />
            Pour supprimer un article et un historique de commande mal entré.
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

          <Select value={color} onValueChange={setColor} disabled={loading}>
            <SelectTrigger aria-label="Choisir une couleur">
              <SelectValue placeholder="Choisir une couleur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nothing" className="capitalize">
                Aucune couleur
              </SelectItem>
              {ColorsData.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="capitalize">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={size}
            onChange={(e) => setSize(e.target.value)}
            disabled={loading}
            placeholder="Taille"
            autoComplete="off"
            minLength={1}
            maxLength={7}
          />

          <Input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            disabled={loading}
            type="number"
            placeholder="Stock"
            min={0}
            max={10000}
            step={1}
            minLength={1}
            maxLength={6}
            required
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={
              loading ||
              isUnchanged ||
              [color, size, stock, commandNumber].some(isEmptyString)
            }
            onClick={handleSubmit}
            className="bg-destructive hover:bg-red-700"
          >
            {loading ? "En cours..." : "supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ADD NEW ARTICLE
export const AddNewArticle = ({ product }: { product: Product }) => {
  const [commandNumber, setCommandNumber] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isFormValid = ![commandNumber, color, size, stock].some(isEmptyString);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const item = {
        color,
        size: size.toLowerCase(),
        stock: Number(stock),
        commandNumber: commandNumber.trim().toLowerCase(),
      };

      const addItem = await addItemForProduct(product.id, item);
      if (addItem.error) {
        toast.error(addItem.message);
        return;
      }
      toast.success("Article ajouté", { description: addItem.message });

      setCommandNumber("");
      setColor("");
      setSize("");
      setStock("");
      router.refresh();
    } catch (error) {
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
            <strong>aucune couleur</strong> ou de taille mettez{" "}
            <strong>0</strong>.
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

          <Select value={color} onValueChange={setColor} disabled={loading}>
            <SelectTrigger aria-label="Choisir une couleur">
              <SelectValue placeholder="Choisir une couleur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nothing" className="capitalize">
                Aucune couleur
              </SelectItem>
              {ColorsData.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="capitalize">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={size}
            onChange={(e) => setSize(e.target.value)}
            disabled={loading}
            placeholder="Taille"
            autoComplete="off"
            minLength={1}
            maxLength={7}
          />

          <Input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            disabled={loading}
            type="number"
            placeholder="Stock"
            min={0}
            max={10000}
            step={1}
            minLength={1}
            maxLength={6}
            required
          />
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

type ChooseColorType = {
  setColor: React.Dispatch<React.SetStateAction<string>>;
  color: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  loading: boolean;
};

// CHOOSE COLOR
export const ChooseColorItem = ({
  color,
  setColor,
  loading,
}: ChooseColorType) => {
  return (
    <Dialog>
      <DialogTrigger
        disabled={loading}
        className="w-full h-10 px-4 text-center font-medium border border-gray-300 rounded-md
          hover:bg-gray-100 transition flex items-center justify-between gap-2 capitalize"
      >
        <span>
          {color === "nothing"
            ? "Aucune couleur"
            : (ColorsData.find((c) => c.value === color)?.label ?? color)}
        </span>
        <ChevronDown className="w-6 h-6 opacity-75" />
      </DialogTrigger>

      <DialogContent className="bg-white text-black max-w-sm">
        <DialogHeader>
          <DialogTitle>Choisir une couleur</DialogTitle>
          <DialogDescription>
            Cliquez sur la couleur à choisir pour changer et valider le choix.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-wrap gap-3">
          <DialogClose
            className={`cursor-pointer px-3 py-2 text-sm rounded border capitalize ${
              color === "nothing"
                ? "opacity-100 bg-primary text-white border-primary"
                : "opacity-60 hover:bg-primary hover:text-white"
            }`}
            onClick={() => setColor("nothing")}
          >
            Aucune couleur
          </DialogClose>

          {ColorsData.map(({ value, label }) => (
            <DialogClose
              key={value}
              className={`cursor-pointer px-3 py-2 text-sm rounded border capitalize ${
                value === color
                  ? "opacity-100 bg-primary text-white border-primary"
                  : "opacity-60 hover:bg-primary hover:text-white"
              }`}
              onClick={() => setColor(value)}
              style={{
                backgroundColor:
                  value === "other" || value === "multicolor" ? "black" : value,
                color:
                  value === "white" || value === "yellow" ? "black" : "white",
                borderColor:
                  value === "multicolor" ||
                  value === "other" ||
                  value === "white"
                    ? "black"
                    : value,
              }}
            >
              {value !== color ? <s>{label}</s> : label}
            </DialogClose>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// PERTES WITHOUT H.ORDERS
export const PertesWithoutHOrders = ({ article }: { article: Article }) => {
  const [stock, setStock] = useState(article.stock.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdateStock = async () => {
    setLoading(true);
    try {
      const newStock = Number(stock);
      if (isNaN(newStock)) {
        toast.error("Veuillez entrer un nombre valide");
        return;
      }

      const formData: ModifyStockArticleWithoutHistOrders = {
        stock: newStock,
        article,
      };
      const result = await modifyStockArticle(formData);

      if (result.error) {
        toast.error(result.message);
        return;
      }
      toast.success("Stock modifié avec succès");
      router.refresh();
    } catch (error) {
      toast.error("Erreur lors de la modification du stock");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="p-2 text-sm w-full text-left 
      rounded transition hover:bg-secondary/80"
      >
        Ajustement
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md bg-white text-black">
        <AlertDialogHeader>
          <AlertDialogTitle>{`Signaler la perte d'un article`}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Pour les articles défectueux, les pertes ou les articles non livrés.
            <br />
            Spécifiez la quantité (stock) restante.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <Input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            disabled={loading}
            type="number"
            placeholder="Stock"
            min={0}
            max={10000}
            step={1}
            minLength={1}
            maxLength={6}
            required
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading || isEmptyString(stock)}
            onClick={handleUpdateStock}
          >
            {loading ? "En cours..." : "Valider"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
