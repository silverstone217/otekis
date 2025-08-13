"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Loader2,
  User,
  Phone,
  MapPin,
  Calendar,
  Mail,
} from "lucide-react";
import { DeliveryAgent, DeliveryOrder } from "@prisma/client";
import { DeleteThisAgent, ModifyDeliveryAgent } from "./deliveryAgentActions";
import { useState, useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type DeliverymanWithOrderType = DeliveryAgent & {
  deliveryOrder: DeliveryOrder[];
};

interface DeliveryAgentProfileProps {
  agent: DeliverymanWithOrderType;
}

export function DeliveryAgentProfile({ agent }: DeliveryAgentProfileProps) {
  // Calcul stats
  const totalDelivered = agent.deliveryOrder.filter(
    (order) => order.status === "livré"
  ).length;
  const totalInProgress = agent.deliveryOrder.filter(
    (order) => order.status === "en cours de livraison"
  ).length;

  const [visibleCount, setVisibleCount] = useState(12);
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Extraire statuts uniques
  const uniqueStatus = useMemo(() => {
    const statuses = agent.deliveryOrder.map((order) => order.status);
    return Array.from(new Set(statuses));
  }, [agent.deliveryOrder]);

  // Filtrer commandes selon filterStatus
  const filteredOrders = filterStatus
    ? agent.deliveryOrder.filter((order) =>
        filterStatus === "tous" ? true : order.status === filterStatus
      )
    : agent.deliveryOrder;

  const hasMore = filteredOrders.length > visibleCount;

  const handleToggleMore = () => {
    if (hasMore) {
      setVisibleCount((count) => Math.min(count + 6, filteredOrders.length));
    } else {
      setVisibleCount(12);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      {/* Section Informations agent */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <User className="lg:w-12 lg:h-12 size-8 text-indigo-600 shrink-0" />
            <div>
              <CardTitle className="text-2xl font-semibold capitalize">
                {agent.name}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                ID: {agent.id}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {/* modify */}
            <ModifyDeliveryAgent agent={agent} />

            {/* delete */}
            <DeleteThisAgent agent={agent} />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-gray-700 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-indigo-500" />
            <span>+(243)-{agent.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            <span>{agent.email ?? "Non-fourni"}</span>
          </div>
          <div className="flex items-center gap-2 capitalize">
            <MapPin className="w-5 h-5 text-indigo-500" />
            <span>{agent.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <span>
              Membre depuis{" "}
              {new Date(agent.createdAt).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Section Stats */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-6 justify-around text-center text-gray-700">
          <div>
            <CheckCircle2 className="mx-auto w-8 h-8 text-green-600" />
            <p className="font-semibold text-xl">{totalDelivered}</p>
            <p className="text-sm text-gray-500">Commandes livrées</p>
          </div>
          <div>
            <Loader2 className="mx-auto w-8 h-8 text-yellow-500 animate-spin-slow" />
            <p className="font-semibold text-xl">{totalInProgress}</p>
            <p className="text-sm text-gray-500">En cours de livraison</p>
          </div>
        </CardContent>
      </Card>

      {/* Section Liste des commandes */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Commandes assignées</CardTitle>
            <CardDescription>
              Liste des commandes livrées ou en cours de livraison par cet
              agent.
            </CardDescription>
          </div>

          {/* Select filtre statut */}
          <Select
            value={filterStatus}
            onValueChange={(value) => {
              setFilterStatus(value);
              setVisibleCount(12); // reset pagination au changement de filtre
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent className="w-48">
              <SelectItem value="tous">Tous</SelectItem>
              {uniqueStatus.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-6">
              Aucune commande assignée.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Adresse de livraison</TableHead>
                    <TableHead>Date de livraison</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.slice(0, visibleCount).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>{order.receiverName}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {order.deliveryAddress}
                      </TableCell>
                      <TableCell>
                        {order.deliveryDate
                          ? new Date(order.deliveryDate).toLocaleDateString(
                              "fr-FR"
                            )
                          : "Non définie"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "livré"
                              ? "default"
                              : order.status === "en cours de livraison"
                              ? "secondary"
                              : "outline"
                          }
                          className="capitalize"
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate line-clamp-2">
                        {order.description ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredOrders.length > 12 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={handleToggleMore}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    {hasMore ? "Voir plus" : "Voir moins"}
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
