"use client";
import { DeliveryCompany, Preferences } from "@prisma/client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck, User } from "lucide-react";

interface DeliveryChoiceProps {
  deliveryChoice: string;
  setDeliveryChoice: React.Dispatch<React.SetStateAction<string>>;
  address: string;
  preferences: Preferences;
  deliveryService: DeliveryCompany[];
}

const DeliveryChoiceComponent = ({
  deliveryChoice,
  setDeliveryChoice,
  address,
  preferences,
  deliveryService,
}: DeliveryChoiceProps) => {
  return (
    <div
      className="w-full grid gap-4 p-4 border-2"
      style={{
        borderRadius: preferences.buttonRadius,
      }}
    >
      <h2 className="uppercase  text-sm font-bold">Choix de livraison</h2>
      <Select
        value={deliveryChoice}
        onValueChange={(val) => setDeliveryChoice(val)}
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
          {/* other service/company  */}
          {deliveryService
            .filter((d) => d.name !== "self-pick-up")
            .map((service, index) => {
              return (
                <SelectItem key={index} value={service.name}>
                  <div className="capitalize flex items-center gap-2">
                    <Truck className="size-4 shrink-0" />
                    <span>{service.name}</span>
                  </div>
                </SelectItem>
              );
            })}

          {/* only self pick up */}
          {deliveryService
            .filter((d) => d.name === "self-pick-up")
            .map((service, index) => {
              return (
                <SelectItem key={index} value={service.name}>
                  <div className="capitalize flex items-center gap-2">
                    <User className="size-4 shrink-0" />
                    <span>Recuperer soi-meme</span>
                  </div>
                </SelectItem>
              );
            })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DeliveryChoiceComponent;
