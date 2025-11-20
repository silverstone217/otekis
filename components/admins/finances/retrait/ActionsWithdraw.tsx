"use client";

import {
  cancelCompanyBenefitAndTransaction,
  validateCompanyBenefitAndTransaction,
} from "@/actions/companyAction";
import { formatDate } from "@/app/(admin)/finances/retrait/WithdrawTable";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OtekisWithdrawalHistory } from "@prisma/client";
import { CircleCheck, CircleX, Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

type ActionsTransactionsProps = {
  transaction: OtekisWithdrawalHistory;
  type: "benefit" | "delivery";
};
export const ActionsTransaction = ({
  transaction,
  type,
}: ActionsTransactionsProps) => {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState<null | "cancel" | "confirm">(
    null
  );
  const router = useRouter();

  // Effectue la validation réelle
  const onConfirm = async () => {
    setLoading(true);
    try {
      // validate api
      const result = await validateCompanyBenefitAndTransaction({
        transactionId: transaction.id,
        type,
      });

      if (result.error) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setConfirmOpen(null);
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast.error("Erreur lors de la validation.");
    } finally {
      setLoading(false);
    }
  };

  // Effectue l'annulation réelle
  const onCancel = async () => {
    setLoading(true);
    try {
      // cancel api
      const result = await cancelCompanyBenefitAndTransaction({
        transactionId: transaction.id,
        type,
      });

      if (result.error) {
        toast.error(result.message);
        return;
      }

      toast.success("Transaction annulée avec succès !");
      setConfirmOpen(null);
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast.error("Erreur lors de l’annulation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Actions sur la transaction"
            className="rounded-xl border border-secondary p-1"
            disabled={loading}
          >
            <Ellipsis className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-4 space-y-4">
          <header>
            <h4 className="text-lg font-semibold leading-tight">Actions</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Valider ou annuler la transaction du{" "}
              <time dateTime={transaction.date.toISOString()}>
                {formatDate(transaction.date)}
              </time>
            </p>
          </header>

          <div className="flex flex-col gap-3">
            <Dialog
              open={confirmOpen === "confirm"}
              onOpenChange={(open) => !open && setConfirmOpen(null)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                  onClick={() => setConfirmOpen("confirm")}
                  disabled={loading}
                >
                  <CircleCheck className="w-5 h-5" />
                  <span>Valider</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm rounded-lg p-6">
                <DialogHeader>
                  <DialogTitle>Confirmer la validation</DialogTitle>
                  <DialogDescription>
                    Êtes-vous sûr de vouloir <strong>valider</strong> la
                    transaction du{" "}
                    <strong>{formatDate(transaction.date)}</strong> ?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" disabled={loading}>
                      Annuler
                    </Button>
                  </DialogClose>
                  <Button onClick={onConfirm} disabled={loading}>
                    {loading ? (
                      <FaSpinner className="animate-spin size-6" />
                    ) : (
                      "Confirmer"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={confirmOpen === "cancel"}
              onOpenChange={(open) => !open && setConfirmOpen(null)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 text-destructive hover:text-red-700"
                  onClick={() => setConfirmOpen("cancel")}
                  disabled={loading}
                >
                  <CircleX className="w-5 h-5" />
                  <span>Annuler</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm rounded-lg p-6">
                <DialogHeader>
                  <DialogTitle>Confirmer l&apos;annulation</DialogTitle>
                  <DialogDescription>
                    Êtes-vous sûr de vouloir{" "}
                    <strong className="text-destructive">annuler</strong> la
                    transaction du{" "}
                    <strong>{formatDate(transaction.date)}</strong> ?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" disabled={loading}>
                      Annuler
                    </Button>
                  </DialogClose>
                  <Button onClick={onCancel} disabled={loading}>
                    {loading ? (
                      <FaSpinner className="animate-spin size-6" />
                    ) : (
                      "Confirmer"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
