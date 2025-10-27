"use client";
import React, { useState } from "react";
import { OrderWithPropsType } from "./MainViewOrder";
import { DeliveryCompany } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { validateOrderByAdmin } from "@/actions/OrdersActions";
import { Loader } from "lucide-react";

type ValidateOrderDialogProps = {
  order: OrderWithPropsType;
  companyDelivery: DeliveryCompany | null;
};

const ValidateOrderDialog = ({
  order,
  companyDelivery,
}: ValidateOrderDialogProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!order || !companyDelivery) return null;

  const handleValidateOrder = async () => {
    setLoading(true);
    try {
      const response = await validateOrderByAdmin(order.id);

      if (response.error) {
        toast.error(
          response.message || "Erreur lors de la validation de la commande"
        );
        return;
      }
      toast.success("Commande validée avec succès");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la validation de la commande :", error);
      toast.error("Erreur lors de la validation de la commande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Valider la commande</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Valider la commande</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir valider cette commande {order.id} ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Annuler
            </Button>
          </DialogClose>
          <Button
            variant="default"
            onClick={handleValidateOrder}
            disabled={loading || !order}
          >
            {loading && <Loader className="animate-spin " />}Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ValidateOrderDialog;
