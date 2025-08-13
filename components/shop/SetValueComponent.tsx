import { Preferences } from "@prisma/client";
import React from "react";
import { Label } from "../ui/label";
import { luminanceColor } from "@/utils/shopFunctions";

type Props = {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  title: string | undefined;
  TypeData: {
    value: string;
    label: string;
  }[];
  preferences: Preferences;
  All: string;
};

const SetValueComponent = ({
  value,
  setValue,
  TypeData,
  title,
  All,
  preferences,
}: Props) => {
  return (
    <div className="pb-4 border-b">
      {title && <Label>{title}</Label>}
      <div className="mt-4 flex flex-wrap items-start justify-start gap-4">
        {TypeData.map((stat, idx) => (
          <span
            role="button"
            key={idx}
            onClick={() => {
              if (stat) setValue(stat.value);
            }}
            style={{
              borderColor:
                value === stat.value ? preferences.buttonColor : "transparent",
              borderRadius: preferences.buttonRadius,
              color: preferences.textColor,
              backgroundColor:
                luminanceColor(preferences.background) === "light"
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(19, 19, 19, 0.3)",
            }}
            className={`group px-4 py-2 item-center border-2 hover:border-primary flex flex-col gap-2 text-sm
                ${
                  value === stat.value
                    ? `border-2 text-[${preferences.buttonColor}]`
                    : "opacity-70 border-secondary"
                } 
                tabular-nums ${
                  title?.includes("taille") ? "uppercase" : "capitalize"
                }
              cursor-pointer  transition-all duration-500 ease-in-out rounded opacity-70`}
          >
            <span>{stat.label}</span>
          </span>
        ))}
        {/* all */}
        <span
          role="button"
          onClick={() => {
            setValue("");
          }}
          style={{
            borderColor: value === "" ? preferences.buttonColor : "transparent",
            borderRadius: preferences.buttonRadius,
            color: preferences.textColor,
            backgroundColor:
              luminanceColor(preferences.background) === "light"
                ? "rgba(255, 255, 255, 0.3)"
                : "rgba(19, 19, 19, 0.3)",
          }}
          className={`group px-4 py-2 item-center border-2 hover:border-primary flex flex-col gap-2 text-sm
                ${
                  value === ""
                    ? `border-2 text-[${preferences.buttonColor}]`
                    : "opacity-70 border-secondary"
                } 
                  capitalize tabular-nums
                cursor-pointer  transition-all duration-500 ease-in-out rounded opacity-70`}
        >
          {All}
        </span>
      </div>
    </div>
  );
};

export default SetValueComponent;
