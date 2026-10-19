"use client";

import React from "react";
import { CheckCircle2, X } from "lucide-react";
import type { Preferences } from "@/lib/generated/prisma/client";
import { withAlpha } from "@/utils/randonarando";
import CopyKeyButton from "./copykeybutton";

type Props = {
  gameKey: string;
  hwid: string;
  preferences: Preferences;
  onDismiss: () => void;
};

const GeneratedKeyCard = ({ gameKey, hwid, preferences, onDismiss }: Props) => {
  return (
    <div
      role="status"
      className="relative space-y-4 border p-5 sm:p-6"
      style={{
        borderColor: preferences.buttonColor,
        borderRadius: preferences.buttonRadius,
        backgroundColor: withAlpha(preferences.buttonColor, 0.06),
      }}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer"
        className="absolute right-3 top-3 rounded-full p-1 opacity-60 transition hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2">
        <CheckCircle2
          className="h-5 w-5"
          style={{ color: preferences.buttonColor }}
        />
        <h3 className="font-semibold">Votre clé d'activation</h3>
      </div>

      <p
        className="break-all border px-4 py-3 text-center font-mono text-base font-semibold tracking-wider sm:text-lg"
        style={{
          borderRadius: preferences.buttonRadius,
          borderColor: withAlpha(preferences.textColor, 0.15),
          backgroundColor: withAlpha(preferences.textColor, 0.04),
        }}
      >
        {gameKey}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs opacity-70">
          Cette clé fonctionne uniquement avec l'ordinateur dont le HWID est{" "}
          <span className="break-all font-mono">{hwid}</span>. Saisissez-la dans
          le jeu pour l'activer.
        </p>
        <CopyKeyButton
          value={gameKey}
          preferences={preferences}
          variant="solid"
          label="Copier la clé"
        />
      </div>
    </div>
  );
};

export default GeneratedKeyCard;
