"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck, User } from "lucide-react";
import { DeliveryCompany, Preferences } from "@prisma/client";
import { DELIVERS_API_KEY } from "@/utils/envVariables";
import { isEmptyString } from "@/utils/functions";
import { capitalizeText } from "@/utils/shopFunctions";

interface DeliveryChoiceProps {
  deliveryChoice: string;
  setDeliveryChoice: React.Dispatch<React.SetStateAction<string>>;
  setDeliveryPrice: React.Dispatch<
    React.SetStateAction<number | "Zone non couvert" | "non-specifie">
  >;
  commune: string;
  quartier: string;
  preferences: Preferences;
  deliveryPrice: number | "Zone non couvert" | "non-specifie";
  deliveryService: DeliveryCompany[];
}

// ORIGIN ADDRESS
const OriginAdress = {
  commune: "Bandalungwa",
  quartier: "Makelele",
};

const parcel = {
  weight: 5,
  length: 10,
  width: 10,
};

interface DeliveryService {
  tarifId: string;
  name: string;
  price: number;
  express: boolean;
  company: {
    id: string;
    name: string;
    logo: string | null;
    contact: {
      email: string | null;
      phone: string | null;
      address: string | null;
      facebook: string | null;
      whatsapp: string | null;
      website: string | null;
    };
  };
}

const ChoiceDeliveryService = ({
  commune,
  deliveryChoice,
  preferences,
  quartier,
  setDeliveryChoice,
  deliveryPrice,
  setDeliveryPrice,
  deliveryService,
}: DeliveryChoiceProps) => {
  const [companies, setCompanies] = useState<DeliveryService[]>([]);
  const [loading, setLoading] = useState(false);

  const apikey = DELIVERS_API_KEY;
  const API_URL = "https://delivers.vercel.app/api/get-pricing";

  useEffect(() => {
    if (!apikey || isEmptyString(quartier) || isEmptyString(commune)) return;
    setDeliveryChoice("");

    const getData = async () => {
      setLoading(true);
      try {
        const formData = {
          origin: OriginAdress,
          destination: { commune, quartier },
          parcel,
          express: false,
        };

        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "x-api-key": apikey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result: DeliveryService[] = await response.json();

        // Filtrage : garder seulement les services dont le company.name est dans deliveryService
        const filteredCompanies = result.filter((service) =>
          deliveryService.some(
            (registered) =>
              registered.name.toLowerCase() ===
              service.company.name.toLowerCase()
          )
        );

        setCompanies(filteredCompanies);
      } catch (error) {
        console.log("Erreur de choix de livraison", error);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [apikey, commune, quartier, setDeliveryChoice, deliveryService]);

  //   PRICE
  useEffect(() => {
    if (!deliveryChoice) {
      // Aucun choix effectué
      setDeliveryPrice("non-specifie");
      return;
    }

    // Recherche le service correspondant dans la liste des compagnies
    const selectedService = companies.find(
      (service) => service.name.toLowerCase() === deliveryChoice.toLowerCase()
    );

    if (selectedService) {
      setDeliveryPrice(selectedService.price);
    } else {
      // Si aucun service ne correspond
      setDeliveryPrice("Zone non couvert");
    }
  }, [deliveryChoice, companies, setDeliveryPrice]);

  return (
    <div
      className="w-full grid gap-4 p-4 border-2"
      style={{
        borderRadius: preferences.buttonRadius,
      }}
    >
      <h2 className="uppercase text-sm font-bold">Choix de livraison</h2>

      {loading && (
        <p className="text-sm font-light">Chargement des services...</p>
      )}

      <Select
        value={deliveryChoice}
        onValueChange={(val) => setDeliveryChoice(val)}
        disabled={isEmptyString(quartier) || loading}
      >
        <SelectTrigger
          className="w-full"
          style={{
            borderRadius: preferences.buttonRadius,
            backgroundColor: preferences.background,
          }}
        >
          <SelectValue placeholder="Service de livraison" />
        </SelectTrigger>

        <SelectContent
          style={{
            borderRadius: preferences.buttonRadius,
            backgroundColor: preferences.background,
            color: preferences.textColor,
          }}
        >
          {/* Services de livraison */}
          {companies
            .filter((d) => d.company.name !== "self-pick-up")
            .map((service) => (
              <SelectItem key={service.tarifId} value={service.name}>
                <div className="flex justify-between items-center">
                  <div className="capitalize flex items-center gap-2">
                    <Truck className="size-4 shrink-0" />
                    <span>{capitalizeText(service.company.name)}</span>
                  </div>
                  {/* <span className="font-semibold">
                    {service.price.toLocaleString("fr-FR")} FC
                  </span> */}
                </div>
              </SelectItem>
            ))}

          {/* Self pick-up */}
          {/* {companies
            .filter((d) => d.company.name === "self-pick-up")
            .map((service) => (
              <SelectItem key={service.tarifId} value={service.name}>
                <div className="capitalize flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <User className="size-4 shrink-0" />
                    <span>Récupérer soi-même</span>
                  </div>
                  <span className="font-semibold">
                    {service.price.toLocaleString("fr-FR")} FC
                  </span>
                </div>
              </SelectItem>
            ))} */}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChoiceDeliveryService;
