"use client";

import React from "react";
import { KeyRound, Monitor } from "lucide-react";
import type { Preferences } from "@/lib/generated/prisma/client";
import { getKeyPcTag, withAlpha } from "@/utils/randonarando";
import CopyKeyButton from "./copykeybutton";

export type GameKeyItem = {
  id: string;
  key: string;
  createdAt: string; // ISO
};

type Props = {
  keys: GameKeyItem[];
  preferences: Preferences;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const GameKeysList = ({ keys, preferences }: Props) => {
  const border = withAlpha(preferences.textColor, 0.15);

  return (
    <section className="mx-auto w-full max-w-xl space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Mes clés d'activation</h2>
        {keys.length > 0 && (
          <span className="text-xs opacity-60">
            {keys.length} clé{keys.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {keys.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 border border-dashed px-4 py-10 text-center"
          style={{
            borderColor: border,
            borderRadius: preferences.buttonRadius,
          }}
        >
          <KeyRound className="h-8 w-8 opacity-30" />
          <p className="text-sm opacity-70">
            Vous n'avez pas encore de clé d'activation.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {keys.map((item) => {
            const pcTag = getKeyPcTag(item.key);
            return (
              <li
                key={item.id}
                className="space-y-3 border p-4"
                style={{
                  borderColor: border,
                  borderRadius: preferences.buttonRadius,
                  backgroundColor: withAlpha(preferences.textColor, 0.03),
                }}
              >
                <p className="break-all font-mono text-sm font-semibold tracking-wide">
                  {item.key}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs opacity-70">
                    <span>
                      {formatDate(item.createdAt)} à{" "}
                      {formatTime(item.createdAt)}
                    </span>
                    {pcTag && (
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Monitor className="h-3 w-3" />
                        PC {pcTag}
                      </span>
                    )}
                  </div>
                  <CopyKeyButton value={item.key} preferences={preferences} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default GameKeysList;
