import React from "react";
import { Label } from "../ui/label";

type Props = {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  title: string | undefined;
  TypeData: {
    value: string;
    label: string;
  }[];
};

const SetValueComponent = ({ value, setValue, TypeData, title }: Props) => {
  return (
    <div className="pb-4 border-b">
      {title && <Label>{title}</Label>}
      <div className="mt-4 flex flex-wrap items-start justify-start gap-4">
        {TypeData.map((stat, idx) => (
          <span
            role="button"
            key={idx}
            onClick={() => {
              setValue(stat.value);
            }}
            className={`group px-4 py-2 item-center border-2 hover:border-primary flex flex-col gap-2 text-sm
                        ${
                          value === stat.value
                            ? "border-primary border-2 text-primary"
                            : "text-gray-500 border-secondary"
                        } 
                        transition-all duration-500 ease-in-out rounded text-gray-500`}
          >
            <span className="text-sm capitalize">{stat.label}</span>
          </span>
        ))}

        {/* all */}
        <span
          role="button"
          onClick={() => {
            setValue("");
          }}
          className={`group px-4 py-2 item-center border-2 hover:border-primary flex flex-col gap-2 text-sm
                        ${
                          value === ""
                            ? "border-primary border-2 text-primary"
                            : "text-gray-500 border-secondary"
                        } 
                        transition-all duration-500 ease-in-out rounded text-gray-500`}
        >
          <span className="text-sm capitalize">{"Tout"}</span>
        </span>
      </div>
    </div>
  );
};

export default SetValueComponent;
