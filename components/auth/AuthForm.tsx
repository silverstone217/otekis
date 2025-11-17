"use client";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { siteName } from "@/utils/data";
import logo from "@/public/images/oteki-logo.png";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { SiApple } from "react-icons/si";

const providers = [
  { name: "Google", Icon: FaGoogle, enabled: true, id: "google" },
  { name: "Apple", Icon: SiApple, enabled: false, id: "apple" },
  { name: "Facebook", Icon: FaFacebookF, enabled: false, id: "facebook" },
];

const AuthForm = () => {
  const handleSignIn = async (providerId: string) => {
    try {
      await signIn(providerId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full flex h-full items-center justify-center gap-10 px-4 flex-col">
      <Link href={"/"} className="flex mb-1 items-center gap-0.5 lg:hidden">
        <Image
          src={logo}
          alt="Logo de l'entreprise"
          priority
          className="object-cover w-10 h-auto shrink-0"
          width={100}
          height={100}
        />
        <span className="capitalize text-4xl font-bold ">
          {siteName!.slice(1)}
        </span>
      </Link>
      <div className="w-full text-center space-y-1">
        <h1 className="font-bold text-2xl">{`Connection à votre compte`}</h1>
        <p className="text-sm opacity-80">
          {`Cliquez sur une option pour vous connecter ou créer un compte sur ${siteName}.`}
        </p>
      </div>

      {/* form */}
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
              opacity: enabled ? 1 : 0.3,
              borderColor: enabled ? "black" : "grey",
            }}
          >
            <Icon className="w-6 h-6" aria-hidden="true" />
            <span>{name}</span>
          </Button>
        ))}
      </div>

      {/* terms */}
      <p className="text-sm">
        En cliquant, vous accetez nos{" "}
        <Link
          href={"/conditions-et-termes"}
          className="font-semibold underline"
        >
          {"conditions générales d'utilisation"}
        </Link>{" "}
        de notre plateforme.
      </p>
    </div>
  );
};

export default AuthForm;
