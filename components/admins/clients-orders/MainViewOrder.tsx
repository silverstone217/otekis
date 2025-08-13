"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, returnFormatedMoney } from "@/utils/functions";
import {
  DeliveryCompany,
  DeliveryOrder,
  Order,
  OrderItem,
  Shop,
  User,
} from "@prisma/client";
import { Link, AlertTriangle } from "lucide-react";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { changeOrderStatus } from "@/actions/OrdersActions";
import { OrderTimeline } from "./OrderTimeline";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/UserAuth";
import EmployeeOrderStatus from "./EmployeeOrderStatus";
import PrintOrderLabel from "./PrintOrderLabel";
import PrintWholeOrder from "./PrintWholeOrder";
import { DeliveryManStats } from "@/actions/deliverymenActions";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type OrderItemsType = OrderItem & {
  productName: string;
  productType: string | null;
  productPrice: number;
  productImage: string;
  productCategory: string;
  articleInfo: string;
  productUID: string;
  productStock: number;
};

export type OrderWithPropsType = Order & {
  shop: Shop;
  orderItems: OrderItemsType[];
  user: Omit<User, "password">;
};

export type OrderProps = {
  order: OrderWithPropsType;
  agents: DeliveryManStats[];
  currency?: "$" | "CDF";
  exchange?: number;
  deliveryInfo: DeliveryOrder | null;
  companyDelivery: DeliveryCompany | null;
};

const MainViewOrder = ({
  order,
  agents,
  exchange,
  currency,
  deliveryInfo,
  companyDelivery,
}: OrderProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const user = useCurrentUser();
  const currencySimbol = order.currency === "USD" ? "USD" : "CDF";
  const isOtekisDelivery = useMemo(
    () =>
      companyDelivery
        ? companyDelivery.name.trim().toLocaleLowerCase().includes("otekis")
        : false,
    [companyDelivery]
  );

  const agentOtekisName = useMemo(
    () => agents.find((a) => a.id === deliveryInfo?.deliveryId),
    [agents, deliveryInfo?.deliveryId]
  );

  //   status order
  const handleChangeOrderStatus = async (status: string) => {
    setLoading(true);
    try {
      const result = await changeOrderStatus(order.id, status);

      if (result.error) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
      location.reload();
    } catch (error) {
      console.log(error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-8 w-full overflow-x-hidden">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:justify-between items-start gap-2 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Commande #{order.id}</h1>
          <p className="text-sm text-gray-500">
            Créée le {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Action 1 */}
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {/* print whole order */}
          <PrintWholeOrder order={order} agents={agents} />

          {/* export order in file */}
          <Button variant="secondary" onClick={() => console.log("share")}>
            Exporter
          </Button>

          {/* Cancel order */}
          {!(
            order.status === "livré" ||
            order.status === "annulé" ||
            order.status === "en cours d'annulation"
          ) && (
            <CancelOrderDialog
              disabled={order.status === "annulé"}
              onConfirm={() => handleChangeOrderStatus("en cours d'annulation")}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action 2 Employee */}
        <EmployeeOrderStatus
          orderId={order.id}
          status={order.status}
          paymentRef={order.paymentRef}
          order={order}
          agents={agents}
          companyDelivery={companyDelivery!}
          isOtekisDelivery={isOtekisDelivery}
        />
        {/* Action supplementaire */}
        <Card>
          <CardHeader>
            <CardTitle>Action Supplementaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            {/* Print Orde info */}
            <PrintOrderLabel
              order={{
                id: order.id,
                receiverName: order.receiverName,
                receiverAddress: order.receiverAddress,
                receiverTel: "+243" + order.receiverTel,
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Articles */}
      {
        <Card>
          <CardHeader>
            <CardTitle>Articles commandés</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-center">Qté</TableHead>
                  <TableHead className="text-right">PU</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                          <Image
                            src={item.productImage}
                            alt={item.productName ?? "Produit"}
                            fill
                            className="rounded object-cover"
                            priority
                            sizes="48px"
                          />
                        </div>

                        <div>
                          <span className="capitalize line-clamp-1 ">
                            {item.productUID}
                          </span>
                          <span className="capitalize line-clamp-2 font-medium">
                            {item.productName}
                          </span>
                          <span className="capitalize line-clamp-1 text-xs text-gray-500">
                            {item.articleInfo}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {returnFormatedMoney(item.price * (exchange || 1))}{" "}
                      <span className="text-gray-400 text-xs font-normal">
                        {currency}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {returnFormatedMoney(
                        item.price * (exchange || 1) * item.quantity
                      )}

                      <span className="text-gray-400 text-xs font-normal">
                        {" "}
                        {currency}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.productStock}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-4 font-bold text-lg">
              Total : {order.totalAmount.toString().padStart(2, "0")}{" "}
              {currencySimbol}
            </div>
          </CardContent>
        </Card>
      }
      {/* Résumé client & adresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            {order.user.image && (
              <Image
                src={order.user.image}
                alt={order.user.name ?? "Utilisateur"}
                className="w-12 h-12 rounded object-cover"
                width={48}
                height={48}
                priority
              />
            )}
            <div className="font-medium text-gray-900">{order.user.name}</div>
            <div className=" text-gray-900">
              status: {order.user.isBanned ? "Banni(e)" : "Actif(ve)"}
            </div>
            <div>
              <a
                href={`mailto:${order.user.email}`}
                className="text-primary underline hover:text-primary/80"
              >
                {order.user.email}
              </a>
            </div>
            <div>
              <a
                href={`tel:+243${order.user.tel ?? order.receiverTel}`}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                +243-{order.user.tel ?? order.receiverTel}
              </a>
            </div>

            <div className="pt-3">
              <Link
                href={`/admin/clients/${order.clientId}`}
                className="text-primary underline font-semibold hover:text-primary/80"
              >
                Voir fiche client
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Livraison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 capitalize">
              <span className="font-semibold text-gray-500 w-28 ">
                Adresse :
              </span>
              <span>{order.receiverAddress}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 capitalize">
              <span className="font-semibold text-gray-500 w-28 capitalize">
                Destinataire :
              </span>
              <span>{order.receiverName}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold text-gray-500 w-28">
                Téléphone :
              </span>
              <a
                href={`tel:+243${order.receiverTel}`}
                className="text-primary underline hover:text-primary/80"
              >
                +243 {order.receiverTel}
              </a>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold text-gray-500 w-28">Status :</span>
              <span className="capitalize">{order.status}</span>
            </div>

            {order.description && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-semibold text-gray-500 w-28 shrink-0">
                  Description :
                </span>
                <span className="capitalize truncate max-w-[300px]">
                  {order.description}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="ml-2"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Voir plus
                </Button>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold">
                        Description complète
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-2 whitespace-pre-wrap text-sm">
                      {order.description}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            <Separator />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold text-gray-500 w-28">
                Livreur :
              </span>
              <span className="capitalize">
                {!isOtekisDelivery
                  ? companyDelivery?.name
                  : deliveryInfo
                  ? agentOtekisName?.name
                  : "Non-designé"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold text-gray-500 w-28">
                Transport :
              </span>
              <span className="capitalize">Non-designé</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold text-gray-500 w-28">
                N de suivi :
              </span>
              <span className="capitalize">Non-connu</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold text-gray-500 w-28">Coût :</span>
              <span>
                {returnFormatedMoney(order.deliveryPrice)}{" "}
                <span className="text-gray-400 text-xs font-normal">
                  {currencySimbol}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Boutique */}
      <Card>
        <CardHeader>
          <CardTitle>Boutique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700 capitalize">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold text-gray-500 w-28">Nom :</span>
            <span>{order.shop.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold text-gray-500 w-28">
              Categorie :
            </span>
            <span>{order.shop.category}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold text-gray-500 w-28">Status :</span>
            <span>{order.shop.isBanned ? "Bannie" : "Active"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold text-gray-500 w-28">Créée le:</span>
            <span>{formatDate(order.shop.createdAt)} </span>
          </div>
        </CardContent>
      </Card>

      {/* Paiement */}
      <Card>
        <CardHeader>
          <CardTitle>Paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700 capitalize">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold text-gray-500 w-28">Méthode :</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold text-gray-500 w-28">Statut :</span>
            <span>{order.paymentStatus}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold text-gray-500 w-28">Montant :</span>
            <span>
              {returnFormatedMoney(order.totalAmount)}{" "}
              <span className="text-gray-400 text-xs font-normal">
                {currencySimbol}
              </span>
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold text-gray-500 w-28">N Ref :</span>
            <span>{order.paymentRef}</span>
          </div>
        </CardContent>
      </Card>

      {/* Remboursement */}
      {(order.status === "en cours d'annulation" ||
        order.status === "annulé") && (
        <Card>
          <CardHeader>
            <CardTitle>Remboursement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700 capitalize">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold text-gray-500 w-28">
                Méthode :
              </span>
              <span>{order.paymentMethodRefund}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold text-gray-500 w-28">Statut :</span>
              <span>
                {/* {order.paymentStatus}{" "} */}
                {order.paymentRefRefund
                  ? "remboursé"
                  : "en cours de remboursement"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold text-gray-500 w-28">
                Montant :
              </span>
              <span>
                {returnFormatedMoney(order.totalAmount + order.deliveryPrice)}{" "}
                <span className="text-gray-400 text-xs font-normal">
                  {currencySimbol}
                </span>
              </span>
            </div>
            {order.paymentRefRefund && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-semibold text-gray-500 w-28">
                  N Ref :
                </span>
                <span>{order.paymentRefRefund}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold text-gray-500 w-28">
                Destinataire :
              </span>
              <span>
                {order.refundReceiverName && order.refundPhoneNumber
                  ? ` ${order.refundReceiverName}  +(243)-${order.refundPhoneNumber}`
                  : "Non renseigné"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline & historique */}
      <Card>
        <CardHeader>
          <CardTitle>Suivi & Historique</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTimeline status={order.status} />
          <div className="mt-4">
            <h4 className="font-semibold">Journal d’action</h4>
            {/* <ul className="text-xs text-gray-500">
          {order.logs.map(log => (
            <li key={log.id}>{formatDate(log.date)} : {log.action} par {log.user}</li>
          ))}
        </ul> */}
          </div>
          <div className="mt-4">
            <textarea
              className="w-full border rounded p-2"
              placeholder="Ajouter une note interne (non visible par le client)"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MainViewOrder;

// Cancel order
interface CancelOrderDialogProps {
  onConfirm: () => void;
  disabled?: boolean;
}

export function CancelOrderDialog({
  onConfirm,
  disabled,
}: CancelOrderDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={disabled}>
          Annuler
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md w-full rounded-lg p-6 bg-white text-gray-900 shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Confirmer l&apos;annulation
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-sm text-gray-600">
            Êtes-vous sûr de vouloir annuler cette commande ? Cette action est
            irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex justify-end gap-2">
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="btn btn-destructive"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Continuer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
