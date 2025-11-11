"use client";
import React, { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { communesKinshasa, communesQuartiers } from "@/utils/zones";

type Props = {
  setCommune: React.Dispatch<React.SetStateAction<string>>;
  setQuartier: React.Dispatch<React.SetStateAction<string>>;
  commune: string;
  quartier: string;
  loading: boolean;
  className?: string;
};

const SelectZones = ({
  commune,
  loading,
  quartier,
  setCommune,
  setQuartier,
  className,
}: Props) => {
  const SelectedCommune = useMemo(() => {
    const newComm = communesQuartiers.find(
      (q) => q.name.toLowerCase() === commune.toLowerCase()
    );

    return newComm ? newComm.quartiers : [];
  }, [commune]);

  return (
    <div className={`${className} w-full grid grid-cols-1 gap-4`}>
      {/* Commune */}
      <Select
        value={commune}
        onValueChange={(val) => {
          setCommune(val);
          setQuartier("");
        }}
        disabled={loading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choisir votre commune *" />
        </SelectTrigger>
        <SelectContent className="w-full">
          {communesKinshasa.map((com, idx) => {
            return (
              <SelectItem key={idx.toString()} value={com.toLowerCase()}>
                {com}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Quartier */}

      <Select
        value={quartier}
        onValueChange={(val) => {
          setQuartier(val);
        }}
        disabled={loading || commune === ""}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choisir votre quartier *" />
        </SelectTrigger>
        <SelectContent className="w-full">
          {SelectedCommune.map((quar, idx) => {
            return (
              <SelectItem key={idx.toString()} value={quar.toLowerCase()}>
                {quar}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectZones;
