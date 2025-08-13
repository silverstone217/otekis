"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PackageCheck,
  Truck,
  Loader2,
  RotateCcw,
  Ban,
  CheckCircle2,
  Wallet2,
} from "lucide-react";
import {
  changeOrderStatus,
  changeOrderStatusWithDeliveryAgent,
  changeOrderStatusWithDeliveryCompany,
  refundOrderStatus,
} from "@/actions/OrdersActions";
import { OrderWithPropsType } from "./MainViewOrder";
import { DeliveryManStats } from "@/actions/deliverymenActions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentStatusEnum } from "@/schema/orderSchema";
import { DeliveryCompany } from "@prisma/client";
import { capitalizeText } from "@/utils/shopFunctions";

type OrderStatus =
  | "en cours de traitement"
  | "en attente de livraison"
  | "en cours de livraison"
  | "en cours d'annulation"
  | "annulé"
  | string;

interface Props {
  orderId: string;
  status: OrderStatus;
  paymentRef?: string | null;
  order: OrderWithPropsType;
  agents: DeliveryManStats[];
  companyDelivery: DeliveryCompany;
  isOtekisDelivery: boolean;
}

const statusLabels: Record<OrderStatus, string> = {
  "en cours de traitement": "Préparer la commande",
  "en attente de livraison": "Commande prête",
  "en cours de livraison": "Remettre au livreur",
  "en cours d'annulation": "Rembourser le client",
  annulé: "Commande annulée",
};

const nextStatus: Record<OrderStatus, OrderStatus> = {
  "en cours de traitement": "en attente de livraison",
  "en attente de livraison": "en cours de livraison",
  "en cours d'annulation": "annulé",
};

const badgeColors: Record<OrderStatus, string> = {
  "en cours de traitement": "bg-blue-100 text-blue-700",
  "en attente de livraison": "bg-yellow-100 text-yellow-800",
  "en cours de livraison": "bg-green-100 text-green-700",
  "en cours d'annulation": "bg-orange-100 text-orange-700",
  annulé: "bg-red-100 text-red-700",
};

export default function EmployeeOrderStatus({
  orderId,
  status,
  paymentRef,
  order,
  agents,
  companyDelivery,
  isOtekisDelivery,
}: Props) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(status);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [refundRef, setRefundRef] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const currencySimbol = order.currency === "USD" ? "USD" : "CDF";

  const [openAssign, setOpenAssign] = useState(false);
  const [selectedDeliveryMan, setSelectedDeliveryMan] = useState<string | null>(
    null
  );
  const [assignLoading, setAssignLoading] = useState(false);

  const router = useRouter();

  const PAYMENT_STATUS = PaymentStatusEnum;

  // Détermine le label, l’icône et l’état du bouton selon le status
  let buttonLabel = "";
  let buttonIcon = null;
  let disabled = false;

  if (currentStatus === "en cours de traitement") {
    buttonLabel = "Commande prête";
    buttonIcon = <PackageCheck className="w-4 h-4 mr-2" />;
  } else if (currentStatus === "en attente de livraison") {
    buttonLabel = "Remettre au livreur";
    buttonIcon = <Truck className="w-4 h-4 mr-2" />;
  } else if (currentStatus === "en cours de livraison") {
    buttonLabel = "Commande remise au livreur";
    disabled = true;
    buttonIcon = <Truck className="w-4 h-4 mr-2" />;
  } else if (currentStatus === "en cours d'annulation") {
    buttonLabel = "Rembourser";
    buttonIcon = <RotateCcw className="w-4 h-4 mr-2" />;
  } else if (currentStatus === "annulé") {
    buttonLabel = "Commande annulée";
    buttonIcon = <Ban className="w-4 h-4 mr-2" />;
    disabled = true;
  } else {
    disabled = true;
    buttonLabel = "Aucune action";
  }

  // Fonction pour mettre à jour le status sur le serveur
  const handleStatusChange = async () => {
    if (disabled) return;
    setLoading(true);
    try {
      const newStatus = nextStatus[currentStatus];
      const result = await changeOrderStatus(orderId, newStatus);
      if (result.error) {
        toast.error(result.message);
        return;
      }
      setCurrentStatus(newStatus);
      router.refresh();
      toast.success("Statut mis à jour !");
    } catch (e) {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour valider le remboursement
  const handleRefund = async () => {
    if (!refundRef.trim()) {
      toast.error("Merci de saisir le numéro de référence de la transaction.");
      return;
    }
    setRefundLoading(true);
    try {
      const result = await refundOrderStatus(orderId, "annulé", refundRef);
      if (result.error) {
        toast.error(result.message);
        return;
      }
      setCurrentStatus("annulé");
      setOpenDialog(false);
      setRefundRef("");
      router.refresh();
      toast.success("Commande annulée et remboursement enregistré !");
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement du remboursement");
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <Card className="w-full shadow border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Statut de la commande</span>
          <Badge
            className={`${
              badgeColors[currentStatus] || "bg-gray-100 text-gray-700"
            } ml-2`}
          >
            {currentStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Statuts normaux */}
          {currentStatus === "en cours de traitement" && (
            <Button
              onClick={handleStatusChange}
              disabled={disabled || loading}
              className="w-full flex items-center justify-center"
              size="lg"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                buttonIcon
              )}
              {buttonLabel}
            </Button>
          )}

          {/* Statut en cours d'annulation */}
          {currentStatus === "en cours d'annulation" && (
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full flex items-center justify-center"
                  size="lg"
                >
                  <Wallet2 className="w-4 h-4 mr-2" />
                  Rembourser le client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg ">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 mb-2 text-xl">
                    <RotateCcw className="w-6 h-6 text-orange-600" />
                    Remboursement client
                  </DialogTitle>
                  <DialogDescription>
                    {order.refundReceiverName && order.refundPhoneNumber ? (
                      <span className="font-bold capitalize">
                        {order.refundReceiverName} (+234)-
                        {order.refundPhoneNumber}
                      </span>
                    ) : (
                      <span>
                        Le nom et le numero de telephone non-fournis, impossible
                        de proceder au remboursement.
                      </span>
                    )}
                    <br />
                    <span>
                      Total :{" "}
                      <span className="font-bold tabular-nums">
                        {(
                          order.totalAmount + (order.deliveryPrice ?? 0)
                        ).toFixed()}{" "}
                      </span>
                      <span className="text-xs text-gray-500">
                        {currencySimbol}
                      </span>
                    </span>
                    <br />
                    <br />
                    Entrez le numéro de référence de la transaction de
                    remboursement après avoir remboursé le client.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  placeholder="Numéro de référence de la transaction de remboursement"
                  value={refundRef}
                  onChange={(e) => setRefundRef(e.target.value)}
                  disabled={refundLoading}
                  className="mt-2"
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" disabled={refundLoading}>
                      Annuler
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={handleRefund}
                    disabled={
                      refundLoading ||
                      !order.refundPhoneNumber ||
                      !order.refundReceiverName
                    }
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {refundLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Valider le remboursement
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Statut annulé */}
          {currentStatus === "annulé" && (
            <Button
              disabled
              className="w-full flex items-center justify-center"
              variant="outline"
              size="lg"
            >
              <Ban className="w-4 h-4 mr-2" />
              Commande annulée
            </Button>
          )}
        </div>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          {currentStatus === "en cours de traitement" &&
            "Rassemblez et emballez tous les articles achetés."}

          {/* give to delivery agent */}
          {currentStatus === "en attente de livraison" && isOtekisDelivery ? (
            <Dialog open={openAssign} onOpenChange={setOpenAssign}>
              <DialogTrigger asChild>
                <Button
                  className="w-full flex items-center justify-center"
                  size="lg"
                  variant="default"
                  disabled={loading}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Remettre au livreur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <Truck className="w-5 h-5 text-green-600" />
                    Choisir un agent de livraison
                  </DialogTitle>
                  <DialogDescription>
                    Sélectionnez un agent pour remettre la commande.
                  </DialogDescription>
                </DialogHeader>
                <Select
                  value={selectedDeliveryMan ?? undefined}
                  onValueChange={setSelectedDeliveryMan}
                >
                  <SelectTrigger className="w-full mt-4">
                    <SelectValue placeholder="Sélectionner un agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem
                        key={agent.id}
                        value={agent.id}
                        className="capitalize"
                      >
                        <Truck className="w-4 h-4 mr-2 inline text-indigo-600" />
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DialogFooter className="mt-4 flex gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" disabled={assignLoading}>
                      Annuler
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={async () => {
                      if (!selectedDeliveryMan) {
                        toast.error("Veuillez choisir un agent de livraison.");
                        return;
                      }
                      setAssignLoading(true);
                      try {
                        // Appel à ton action pour changer le status et assigner le livreur
                        const result = await changeOrderStatusWithDeliveryAgent(
                          orderId,
                          "en cours de livraison",
                          selectedDeliveryMan
                        );
                        if (result.error) {
                          toast.error(result.message);
                          return;
                        }
                        setCurrentStatus("en cours de livraison");
                        setOpenAssign(false);
                        setSelectedDeliveryMan(null);
                        router.refresh();
                        toast.success("Commande remise au livreur !");
                      } catch (e) {
                        toast.error("Erreur lors de l'assignation du livreur");
                      } finally {
                        setAssignLoading(false);
                      }
                    }}
                    disabled={!selectedDeliveryMan || assignLoading}
                    className="flex items-center gap-2"
                  >
                    {assignLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Valider
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            currentStatus === "en attente de livraison" &&
            !isOtekisDelivery && (
              <div className="flex flex-col items-center justify-center p-4 gap-4">
                <p className="text-base">
                  Remettre la commande à{" "}
                  <strong className="capitalize">
                    {capitalizeText(companyDelivery.name)}
                  </strong>
                </p>
                <Button
                  onClick={async () => {
                    if (!companyDelivery) {
                      toast.error(
                        "Impossible de continuer, une erreur sur l'assignation de livreur."
                      );
                      return;
                    }
                    setAssignLoading(true);
                    try {
                      // Appel à ton action pour changer le status et valider la companie de livraison
                      const result = await changeOrderStatusWithDeliveryCompany(
                        orderId,
                        "en cours de livraison"
                      );
                      if (result.error) {
                        toast.error(result.message);
                        return;
                      }
                      setCurrentStatus("en cours de livraison");
                      setOpenAssign(false);
                      setSelectedDeliveryMan(null);
                      router.refresh();
                      toast.success("Commande remise au livreur !");
                    } catch (e) {
                      toast.error("Erreur lors de l'assignation du livreur");
                    } finally {
                      setAssignLoading(false);
                    }
                  }}
                  disabled={!companyDelivery || assignLoading}
                  className="flex items-center gap-2 w-full"
                >
                  {assignLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Remettre
                </Button>
              </div>
            )
          )}

          {/* cancel order */}
          {currentStatus === "en cours de livraison" &&
            "Commande remise au livreur, aucune action supplémentaire."}
          {currentStatus === "en cours d'annulation" &&
            (paymentRef && order.refundPhoneNumber ? (
              <>
                <span className="font-semibold text-orange-700">
                  La commande est annulée.
                </span>
                <br />
                <span>
                  Merci de rembourser le client via{" "}
                  <b>+243{order.refundPhoneNumber}</b> et de saisir le numéro de
                  référence de la transaction de remboursement.
                </span>
              </>
            ) : (
              <>
                <span className="font-semibold text-orange-700">
                  Le client a annulé sa commande.
                </span>
                <br />
                Merci de rembourser le client et de saisir le numéro de
                référence de la transaction.
              </>
            ))}
          {currentStatus === "annulé" &&
            "Commande annulée et remboursement enregistré."}
        </div>
      </CardContent>
    </Card>
  );
}
