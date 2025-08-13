"use client";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { returnDataValue } from "@/utils/functions";
import { ColorsData } from "@/utils/dataAdd";
import { capitalizeText } from "@/utils/shopFunctions";

type Props = {
  color: string;
};

const UniqueColorsWithTooltip = ({ color }: Props) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            key={color}
            className={` flex items-center justify-center border-2 
                    ${
                      color === "other" || color === "multicolor"
                        ? "px-1"
                        : "w-6 h-6 border-gray-200"
                    }`}
          >
            <div
              className="w-full h-full"
              style={{ backgroundColor: color! }}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {capitalizeText(returnDataValue(color, ColorsData))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UniqueColorsWithTooltip;
