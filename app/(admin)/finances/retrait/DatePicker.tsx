"use client";

import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // Doit exister dans ui/calendar.tsx ou équivalent
import { Calendar as CalendarIcon, X } from "lucide-react";

type DatePickerProps = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  clearable?: boolean;
};

export function DatePicker({
  value,
  onChange,
  placeholder,
  clearable,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center ">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value
              ? value.toLocaleDateString("fr-FR")
              : placeholder || "Choisir une date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {clearable && value && (
        <Button
          onClick={() => onChange(undefined)}
          type="button"
          variant="ghost"
          size="icon"
          className="ml-2"
        >
          <X />
        </Button>
      )}
    </div>
  );
}
