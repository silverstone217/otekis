"use client";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import googleIcon from "@/public/icons/googleIcon.svg";
import facebookIcon from "@/public/icons/facebookIcon.svg";
import appleIcon from "@/public/icons/appleIcon.svg";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { siteName } from "@/utils/data";

const AuthForm = () => {
  const handleSubmitWithGoogle = async () => {
    try {
      await signIn("google");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full flex h-full items-center justify-center gap-10 px-4 flex-col">
      <Link
        href={"/"}
        className="font-extrabold tracking-tight text-3xl capitalize lg:hidden"
      >
        {siteName}.
      </Link>
      <div className="w-full text-center space-y-1">
        <h1 className="font-bold text-2xl">{`Connection à votre compte`}</h1>
        <p className="text-sm opacity-80">{` Continuer avec pour connecter a votre compte ou créer un nouveau.`}</p>
      </div>

      {/* form */}
      <div className="flex flex-col gap-6 w-full items-center justify-center">
        {/* continue with google */}

        <Button
          type="button"
          className="w-11/12 lg:w-3/4 flex gap-2 items-center py-5 "
          onClick={handleSubmitWithGoogle}
        >
          <Image
            src={googleIcon}
            alt="google Icon"
            width={500}
            height={500}
            priority
            className="size-6 object-cover"
          />
          <span>Google</span>
        </Button>
        {/* continue with apple */}
        <Button
          type="button"
          className="w-11/12 lg:w-3/4 flex gap-2 items-center py-5"
          //onClick={handleSubmitWithGoogle}
          disabled
        >
          <Image
            src={appleIcon}
            alt="apple Icon"
            width={500}
            height={500}
            priority
            className="size-6 object-cover"
          />
          <span>Apple</span>
        </Button>

        {/* continue with facebook */}
        <Button
          type="button"
          className="w-11/12 lg:w-3/4 flex gap-2 items-center py-5"
          disabled
        >
          <Image
            src={facebookIcon}
            alt="facebook Icon"
            width={500}
            height={500}
            priority
            className="size-6 object-cover"
          />
          <span>Facebook</span>
        </Button>
      </div>

      {/* terms */}
      <p className="text-sm">
        En cliquant, vous accetez nos{" "}
        <Link href={"#"} className="font-semibold underline">
          {"conditions générales d'utilisation"}
        </Link>{" "}
        de notre plateforme.
      </p>
    </div>
  );
};

export default AuthForm;
