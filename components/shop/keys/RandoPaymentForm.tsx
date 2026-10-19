"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Monitor, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Preferences } from "@/lib/generated/prisma/client";
import { buyRandoNaRandoKey } from "@/actions/gameaction";
import {
  normalizeHwid,
  validateHwid,
  validatePaymentNumber,
  withAlpha,
} from "@/utils/randonarando";
import GeneratedKeyCard from "./GeneratedKeyCard";

type Props = {
  preferences: Preferences;
  shopSlug: string;
  /** HWID reçu dans l'URL (?hwid=...) */
  initialHwid: string;
  price: number;
  currency: "USD" | "CDF";
};

const RandoPaymentForm = ({
  preferences,
  shopSlug,
  initialHwid,
  price,
  currency,
}: Props) => {
  const router = useRouter();

  const [hwid, setHwid] = useState(initialHwid);
  const [paymentNumber, setPaymentNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<{
    key: string;
    hwid: string;
  } | null>(null);

  const hwidError = useMemo(() => (hwid ? validateHwid(hwid) : null), [hwid]);
  const paymentError = useMemo(
    () => (paymentNumber ? validatePaymentNumber(paymentNumber) : null),
    [paymentNumber],
  );

  const canSubmit =
    !loading &&
    !!hwid &&
    !!paymentNumber &&
    !validateHwid(hwid) &&
    !validatePaymentNumber(paymentNumber);

  const priceLabel = `${price.toLocaleString()} ${currency === "USD" ? "$" : "CDF"}`;

  const fieldStyle = {
    borderColor: withAlpha(preferences.textColor, 0.25),
    borderRadius: preferences.buttonRadius,
    backgroundColor: "transparent",
    color: preferences.textColor,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setGenerated(null);

    try {
      toast.info(
        "Vous avez 30 secondes pour valider le paiement sur votre mobile.",
      );

      const result = await buyRandoNaRandoKey({
        hwid: normalizeHwid(hwid),
        paymentNumber,
        shopSlug,
      });

      if (result.error || !result.key) {
        toast.error(result.message || "Le paiement a échoué");
        return;
      }

      toast.success(result.message);
      setGenerated({ key: result.key.key, hwid: normalizeHwid(hwid) });
      setPaymentNumber("");
      router.refresh(); // met à jour la liste des clés
    } catch {
      toast.error("Erreur lors du paiement, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      {generated && (
        <GeneratedKeyCard
          gameKey={generated.key}
          hwid={generated.hwid}
          preferences={preferences}
          onDismiss={() => setGenerated(null)}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 border p-5 sm:p-6"
        style={{
          borderColor: withAlpha(preferences.textColor, 0.15),
          borderRadius: preferences.buttonRadius,
          backgroundColor: withAlpha(preferences.textColor, 0.03),
        }}
      >
        {/* HWID */}
        <div className="space-y-2">
          <label
            htmlFor="hwid"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Monitor className="h-4 w-4" />
            1. HWID de votre ordinateur
          </label>
          <Input
            id="hwid"
            value={hwid}
            onChange={(e) => setHwid(e.target.value.toUpperCase())}
            placeholder="Collez le HWID copié depuis le jeu"
            className="font-mono text-sm"
            style={fieldStyle}
            maxLength={64}
            autoComplete="off"
            spellCheck={false}
            disabled={loading}
            aria-invalid={!!hwidError}
          />
          {hwidError ? (
            <p className="text-xs text-red-500">{hwidError}</p>
          ) : (
            <p className="text-xs opacity-70">
              Copiez-le depuis le jeu. La clé sera liée à cet ordinateur.
            </p>
          )}
        </div>

        {/* PAIEMENT */}
        <div className="space-y-2">
          <label
            htmlFor="paymentNumber"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Phone className="h-4 w-4" />
            2. Numéro de paiement mobile
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
              +243
            </span>
            <Input
              id="paymentNumber"
              type="tel"
              inputMode="numeric"
              value={paymentNumber}
              onChange={(e) =>
                setPaymentNumber(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Numéro Mobile Money"
              className="pl-14"
              style={fieldStyle}
              maxLength={9}
              disabled={loading}
              aria-invalid={!!paymentError}
            />
          </div>
          {paymentError ? (
            <p className="text-xs text-red-500">{paymentError}</p>
          ) : (
            <p className="text-xs opacity-70">
              9 chiffres sans le 0. Vous validerez le paiement sur votre
              téléphone.
            </p>
          )}
        </div>

        {/* CTA */}
        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-12 w-full"
          style={{
            backgroundColor: preferences.buttonColor,
            color: preferences.buttonTextColor,
            borderRadius: preferences.buttonRadius,
          }}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading
            ? "Paiement en cours..."
            : `Payer ${priceLabel} et générer ma clé`}
        </Button>

        <p className="text-center text-xs opacity-60">
          3. Une fois la clé générée, saisissez-la dans le jeu pour l'activer.
        </p>
      </form>
    </div>
  );
};

export default RandoPaymentForm;
