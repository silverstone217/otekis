"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Preferences } from "@/lib/generated/prisma/client";
import { withAlpha } from "@/utils/randonarando";

type Props = {
  value: string;
  preferences: Preferences;
  /** "solid" = couleur du bouton de la boutique, "subtle" = discret */
  variant?: "solid" | "subtle";
  label?: string;
  className?: string;
};

const CopyKeyButton = ({
  value,
  preferences,
  variant = "subtle",
  label = "Copier",
  className,
}: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Clé copiée");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier, sélectionnez la clé manuellement.");
    }
  };

  const style =
    variant === "solid"
      ? {
          backgroundColor: preferences.buttonColor,
          color: preferences.buttonTextColor,
          borderRadius: preferences.buttonRadius,
        }
      : {
          backgroundColor: "transparent",
          color: preferences.textColor,
          border: `1px solid ${withAlpha(preferences.textColor, 0.2)}`,
          borderRadius: preferences.buttonRadius,
        };

  return (
    <Button
      type="button"
      size="sm"
      onClick={handleCopy}
      className={className}
      style={style}
      aria-label="Copier la clé d'activation"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copié" : label}
    </Button>
  );
};

export default CopyKeyButton;
