"use client";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { capitalizeText } from "@/utils/shopFunctions";
import { siteName } from "@/utils/data";
import { Separator } from "../ui/separator";
import { LinksDocumentation } from "@/utils/documentation";
import Link from "next/link";

const SmallScreenSheetNav = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu />
      </SheetTrigger>
      <SheetContent
        className="w-[80%] flex flex-col h-screen 
      overflow-x-hidden overflow-y-auto"
      >
        <SheetHeader className="px-4">
          <SheetTitle className="text-lg font-bold">
            {capitalizeText(siteName!)} - docs
          </SheetTitle>
        </SheetHeader>
        <SheetDescription hidden></SheetDescription>
        <Separator />
        {/* Add your navigation links or content here */}
        <div className="flex-1 py-2 px-4">
          {LinksDocumentation.map((link, idx) => (
            <Link
              key={idx}
              href={link.url}
              className="block p-2 hover:bg-gray-200 text-lg font-medium"
            >
              {link.title}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SmallScreenSheetNav;
