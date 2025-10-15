"use client";

import React from "react";
import { Preferences } from "@prisma/client";
import { Button } from "@/components/ui/button"; // shadcn button
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { SiApple } from "react-icons/si";
import { signIn } from "next-auth/react";
import { luminanceColor } from "@/utils/shopFunctions";

type Props = {
  preferences: Preferences;
};

const providers = [
  { name: "Google", Icon: FaGoogle, enabled: true, id: "google" },
  { name: "Apple", Icon: SiApple, enabled: false, id: "apple" },
  { name: "Facebook", Icon: FaFacebookF, enabled: false, id: "facebook" },
];

const ShopCartLogin = ({ preferences }: Props) => {
  const luminance = luminanceColor(preferences.background);

  const handleSignIn = async (providerId: string) => {
    try {
      await signIn(providerId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center 
    space-y-6 w-full max-w-md mx-auto"
    >
      <p
        className="text-sm font-semibold text-muted-foreground 
      uppercase tracking-wide"
      >
        Continuer avec
      </p>

      <div className="grid grid-cols-1 gap-4 w-full">
        {providers.map(({ name, Icon, enabled, id }) => (
          <Button
            key={id}
            variant={enabled ? "default" : "outline"}
            disabled={!enabled}
            className="flex gap-3 items-center justify-center py-3 
            text-base font-semibold hover:scale-105 transition-transform"
            onClick={() => {
              if (enabled) {
                handleSignIn(id);
                console.log(`Sign in with ${name}`);
              }
            }}
            style={{
              backgroundColor: enabled ? preferences.buttonColor : undefined,
              color: enabled
                ? preferences.buttonTextColor
                : luminance === "dark"
                ? "black"
                : "white",
              borderRadius: preferences.buttonRadius,
              opacity: enabled ? 1 : 0.3,
              borderColor: enabled
                ? preferences.buttonColor
                : luminance === "dark"
                ? "black"
                : "white",
            }}
          >
            <Icon className="w-6 h-6" aria-hidden="true" />
            <span>{name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ShopCartLogin;
