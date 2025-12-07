"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DownloadCloud, Search, TicketCheck, TicketX } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Checkbox } from "./CheckBoxTransfertPopUp";
import { capitalizeText } from "@/utils/shopFunctions";
import {
  cancelWithdrawHistory,
  updateAllWithdrawHistory,
} from "@/actions/transfertAction";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { WithdrawalHistory } from "@/lib/generated/prisma/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { returnFormatedMoney } from "@/utils/functions";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  currency: "USD" | "CDF";
  allWidithdraw: WithdrawalHistory[];
};

type StatusFilter = "non-traité" | "traité" | "annulé";

const statusOptions: StatusFilter[] = ["non-traité", "traité", "annulé"];

const ShopsTableToPrintExcel = ({ allWidithdraw, currency }: Props) => {
  const [transactionId, setTransactionId] = useState("");
  const [selectedWithdraws, setSelectedWithdraws] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("non-traité");
  const router = useRouter();

  // Filtre initial par N° transfert et status
  const filteredWithdraw: WithdrawalHistory[] = useMemo(() => {
    return allWidithdraw.filter(
      (withdrawal) =>
        withdrawal.transfertID.includes(transactionId) &&
        withdrawal.status === statusFilter
    );
  }, [allWidithdraw, transactionId, statusFilter]);

  // Sélection globale/partielle
  const allChecked =
    filteredWithdraw.length > 0 &&
    selectedWithdraws.length === filteredWithdraw.length;
  const someChecked =
    selectedWithdraws.length > 0 &&
    selectedWithdraws.length < filteredWithdraw.length;

  // Gestion sélection simple/selectAll
  const toggleWithdraw = (id: string) => {
    setSelectedWithdraws((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (allChecked) setSelectedWithdraws([]);
    else setSelectedWithdraws(filteredWithdraw.map((w) => w.id));
  };

  // Ne renvoyer que les éléments filtrés ET sélectionnés
  const allSelectedWithdraw = useMemo(
    () => filteredWithdraw.filter((w) => selectedWithdraws.includes(w.id)),
    [filteredWithdraw, selectedWithdraws]
  );

  // Gestion du reset des sélections si filtre status change
  React.useEffect(() => {
    setSelectedWithdraws([]); // Reset la sélection quand le filtre de status bouge
  }, [statusFilter, transactionId]);

  // Export excel (idéalement : que ce qui est affiché !)
  const handleExport = () => {
    const dataToExport = filteredWithdraw.map((shop) => ({
      phone: "+243" + shop.paymentPhone,
      amount: shop.amount,
      name: capitalizeText(shop.paymentName),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Paiement");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${transactionId}.xlsx`);
  };

  // Action : Valider
  const handleValidateAll = async () => {
    setLoading(true);
    try {
      // On ne traite que ceux qui sont bien "non-traité"
      const validateSelected = allSelectedWithdraw.filter(
        (item) => item.status === "non-traité"
      );
      if (validateSelected.length === 0) {
        toast.error("Aucun retrait à valider.");
        return;
      }
      // Ton backend doit accepter des ids à traiter
      const formData = validateSelected.map((item) => item.id);
      const result = await updateAllWithdrawHistory(formData, "traité");
      if (result.error) {
        toast.error(result.message);
        return;
      }
      toast.success("Tous les retraits ont été validés avec succès");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue ! Veuillez réessayer !");
    } finally {
      setLoading(false);
    }
  };

  // Action : Annuler
  const handleCancelAll = async () => {
    setLoading(true);
    try {
      // On ne traite que ceux qui sont bien "non-traité"
      const cancelSelected = allSelectedWithdraw.filter(
        (item) => item.status === "non-traité"
      );
      if (cancelSelected.length === 0) {
        toast.error("Aucun retrait à annuler.");
        return;
      }
      const result = await cancelWithdrawHistory(cancelSelected, "annulé");
      if (result.error) {
        toast.error(result.message);
        return;
      }
      toast.success("Tous les retraits ont été annulés avec succès");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue ! Veuillez réessayer !");
    } finally {
      setLoading(false);
    }
  };

  // On limite les actions Valider/Annuler UNIQUEMENT aux retraits "non-traité"
  const showValidateButton = statusFilter === "non-traité";
  const showCancelButton = statusFilter === "non-traité";

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl border border-muted py-4 px-2 bg-background shadow-md">
      {/* en-tête : Search, status & boutons */}
      <div className="flex flex-wrap items-center mb-4 w-full gap-4">
        <div className="relative shrink-0">
          <Search className="w-5 h-5 text-gray-500 absolute top-1/2 -translate-y-1/2 left-2" />
          <Input
            className="w-full pl-10 py-2 text-sm text-gray-700 placeholder:text-gray min-w-72"
            placeholder="numero de transfert..."
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            type="search"
            disabled={loading}
          />
        </div>
        {/* Filtrage par status */}
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          disabled={loading}
        >
          <SelectTrigger className="min-w-40">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          disabled={filteredWithdraw.length === 0 || loading || !transactionId}
          className="flex items-center gap-2"
        >
          <DownloadCloud className="w-4 h-4" />
          Exporter
        </Button>

        {showValidateButton && (
          <Button
            size="sm"
            variant={allSelectedWithdraw.length === 0 ? "outline" : "default"}
            onClick={handleValidateAll}
            disabled={
              filteredWithdraw.length === 0 ||
              allSelectedWithdraw.length === 0 ||
              loading ||
              !transactionId
            }
            className="flex items-center gap-2"
          >
            <TicketCheck className="w-4 h-4" />
            Valider
          </Button>
        )}

        {showCancelButton && (
          <Button
            size="sm"
            variant={
              allSelectedWithdraw.length === 0 ? "outline" : "destructive"
            }
            onClick={handleCancelAll}
            disabled={
              filteredWithdraw.length === 0 ||
              allSelectedWithdraw.length === 0 ||
              loading ||
              !transactionId
            }
            className="flex items-center gap-2"
          >
            <TicketX className="w-4 h-4" />
            Annuler
          </Button>
        )}
      </div>

      {/* table */}
      <div className="overflow-auto overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={allChecked}
                  indeterminate={someChecked}
                  onChange={toggleAll}
                  aria-label="Sélectionner tous les paiements"
                  disabled={filteredWithdraw.length === 0 || loading}
                />
              </TableHead>
              <TableHead>N transfert</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Destinataire</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWithdraw.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            ) : (
              filteredWithdraw.map((withdraw) => {
                const amount = withdraw.amount;
                return (
                  <TableRow key={withdraw.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedWithdraws.includes(withdraw.id)}
                        onChange={() => toggleWithdraw(withdraw.id)}
                        aria-label={`Sélectionner paiement ${withdraw.transfertID}`}
                        disabled={loading}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2  max-w-28 line-clamp-1">
                        <span className="font-semibold">
                          {withdraw.transfertID}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono  font-medium">
                        {returnFormatedMoney(amount)}{" "}
                        <span className="text-xs">{currency}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span>{capitalizeText(withdraw.paymentName)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">{withdraw.paymentPhone}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          withdraw.status === "annulé"
                            ? "destructive"
                            : withdraw.status === "non-traité"
                              ? "outline"
                              : "default"
                        }
                      >
                        {withdraw.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ShopsTableToPrintExcel;
