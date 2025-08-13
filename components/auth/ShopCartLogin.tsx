"use client";
import googleIcon from "@/public/icons/googleIcon.svg";
import facebookIcon from "@/public/icons/facebookIcon.svg";
import appleIcon from "@/public/icons/appleIcon.svg";
import Image from "next/image";
import { signIn } from "next-auth/react";
import React from "react";
import { Preferences } from "@prisma/client";

type Props = {
  preferences: Preferences;
};

const ShopCartLogin = ({ preferences }: Props) => {
  const handleSubmitWithGoogle = async () => {
    try {
      await signIn("google", { redirect: false });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full items-center justify-center mt-6">
      {/* continue with google */}
      <p>Continuer avec</p>
      <button
        type="button"
        className=" lg:w-3/4 w-4/5 justify-center flex gap-2 items-center py-3
        hover:scale-110 hover:shadow-2xl transition-all duration-500 ease-in-out"
        onClick={handleSubmitWithGoogle}
        style={{
          backgroundColor: preferences.buttonColor,
          color: preferences.buttonTextColor,
          borderRadius: preferences.buttonRadius,
        }}
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
      </button>
      {/* continue with apple */}
      <button
        type="button"
        className="lg:w-3/4 w-4/5 justify-center flex gap-2 items-center py-3
        hover:scale-110 hover:shadow-2xl transition-all duration-500 ease-in-out"
        // onClick={handleSubmitWithGoogle}
        style={{
          backgroundColor: "dimgray",
          color: preferences.buttonTextColor,
          borderRadius: preferences.buttonRadius,
        }}
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
      </button>

      {/* continue with facebook */}
      <button
        type="button"
        className=" lg:w-3/4 w-4/5 justify-center flex gap-2 items-center py-3 
        hover:scale-110 hover:shadow-2xl transition-all duration-500 ease-in-out"
        // onClick={handleSubmitWithGoogle}
        style={{
          backgroundColor: "dimgray",
          color: preferences.buttonTextColor,
          borderRadius: preferences.buttonRadius,
        }}
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
      </button>
    </div>
  );
};

export default ShopCartLogin;
