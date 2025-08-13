"use client";

import React from "react";

interface TimelineStep {
  id: string | number;
  title: string;
  description?: string;
  date?: string | Date;
  completed: boolean;
  isError?: boolean;
  isPending?: boolean;
}

interface OrderTimelineProps {
  status: string;
}

const STATUS_STEPS: Record<
  string,
  { id: number; title: string; description: string }[]
> = {
  "en cours de traitement": [
    {
      id: 1,
      title: "Commande reçue",
      description: "Commande passée par le client",
    },
  ],
  "en attente de livraison": [
    {
      id: 1,
      title: "Commande reçue",
      description: "Commande passée par le client",
    },
    {
      id: 2,
      title: "Préparation terminée",
      description: "Commande prête à être livrée",
    },
  ],
  "en cours de livraison": [
    {
      id: 1,
      title: "Commande reçue",
      description: "Commande passée par le client",
    },
    {
      id: 2,
      title: "Préparation terminée",
      description: "Commande prête à être livrée",
    },
    {
      id: 3,
      title: "En cours d'expédition",
      description: "Commande en cours de livraison",
    },
  ],
  livré: [
    {
      id: 1,
      title: "Commande reçue",
      description: "Commande passée par le client",
    },
    {
      id: 2,
      title: "Préparation terminée",
      description: "Commande prête à être livrée",
    },
    {
      id: 3,
      title: "En cours d'expédition",
      description: "Commande en cours de livraison",
    },
    { id: 4, title: "Livrée", description: "Commande reçue par le client" },
  ],
};

const ERROR_STATUSES = ["annulé", "refusé", "en cours d'annulation"];
const PENDING_STATUS = "reporté";

// Nouveaux statuts à traiter comme "reporté"
const RETURN_STATUSES = [
  "retourné",
  "en cours de retour",
  "en attente de retour",
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus === PENDING_STATUS ||
    RETURN_STATUSES.includes(normalizedStatus)
  ) {
    // Affiche le même design que "reporté"
    let title = "Commande reportée";
    let description = "La commande est reportée et en attente.";

    // Personnalisation du texte selon le statut retourné
    if (normalizedStatus === "retourné") {
      title = "Commande retournée";
      description = "La commande a été retournée par le client.";
    } else if (normalizedStatus === "en cours de retour") {
      title = "Retour en cours";
      description = "La commande est en cours de retour.";
    } else if (normalizedStatus === "en attente de retour") {
      title = "Retour en attente";
      description = "Le retour de la commande est en attente.";
    }

    return (
      <ol className="relative border-l border-gray-400">
        <li className="mb-10 ml-6 last:mb-0">
          <span
            className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
            aria-label={`Statut ${normalizedStatus}`}
          />
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
        </li>
      </ol>
    );
  }

  if (ERROR_STATUSES.includes(normalizedStatus)) {
    return (
      <ol className="relative border-l border-red-600">
        <li className="mb-10 ml-6 last:mb-0">
          <span
            className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 ring-8 ring-white"
            aria-label="Statut erreur"
          >
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-red-700">
              Commande {status}
            </h3>
            <p className="text-sm text-red-600">La commande est {status}.</p>
          </div>
        </li>
      </ol>
    );
  }

  const baseSteps = STATUS_STEPS[normalizedStatus] || [];

  const timelineSteps = baseSteps.map((step, idx) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    completed: idx < baseSteps.length - 1 || normalizedStatus === "livré",
  }));

  return (
    <ol className="relative border-l border-gray-300 dark:border-gray-600">
      {timelineSteps.map((step) => (
        <li key={step.id} className="mb-10 ml-6 last:mb-0">
          <span
            className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white ${
              step.completed ? "bg-green-500" : "bg-gray-300 dark:bg-gray-500"
            }`}
            aria-label={
              step.completed ? "Étape complétée" : "Étape non complétée"
            }
          >
            {step.completed && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <div className="flex flex-col">
            <h3
              className={`text-lg font-semibold ${
                step.completed
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {step.title}
            </h3>
            {step.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {step.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};
