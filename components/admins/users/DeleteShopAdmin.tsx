"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader, Trash } from "lucide-react";
import { Shop } from "@/lib/generated/prisma/client";
import { capitalizeText } from "@/utils/shopFunctions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { toast } from "sonner";
import { deleteShop } from "@/actions/shopActions";

type DeleteShopAdminProps = {
  shop: Shop;
};

const DeleteShopAdmin = ({ shop }: DeleteShopAdminProps) => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleDeleteShop = async () => {
    setLoading(true);
    try {
      const result = await deleteShop(shop.id);

      if (result.error) {
        toast.error(result.message);
        return;
      }

      if (shop.cover) await deleteObject(ref(storage, shop.cover));
      if (shop.logo) await deleteObject(ref(storage, shop.logo));

      toast.success("Cette boutique a été supprimée avec succès !");
      router.refresh();
    } catch (e) {
      toast.error("Oops ! Une erreur est survenue.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        className="bg-destructive p-2 
      rounded-md text-white hover:bg-destructive/90 transition-colors"
        disabled={loading}
      >
        {loading ? (
          <Loader size={16} className="animate-spin" />
        ) : (
          <Trash size={16} />
        )}
      </DialogTrigger>
      <DialogContent className="pt-10 px-6">
        <DialogHeader>
          <DialogTitle className="text-left">
            Etes vous sûr de vouloir supprimer la boutique{" "}
            {capitalizeText(shop.name)}?
          </DialogTitle>
          <DialogDescription className="text-sm text-left">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>

        {/* Action */}
        <div className="mt-8 flex items-center justify-end gap-4">
          <DialogClose asChild disabled={loading}>
            <Button variant={"outline"}>Annuler</Button>
          </DialogClose>
          <DialogClose asChild disabled={loading} onClick={handleDeleteShop}>
            <Button variant={"destructive"}>Oui, supprimer la boutique</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteShopAdmin;
