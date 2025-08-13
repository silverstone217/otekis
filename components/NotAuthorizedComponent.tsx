"use client";
import React from "react";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const NotAuthorizedComponent = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  if (!user) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl flex flex-col gap-6 h-[70dvh] items-center justify-center">
      <h1 className="xl:text-4xl text-2xl lg:text-3xl font-extrabold text-center">
        {"Vous n'êtes pas autorisé à accéder à cette page."}
      </h1>
      <p className="lg:text-xl text-center">
        {`Seul les membres designés peuvent voire les contenus de cette page.`}
      </p>
      <Button
        onClick={() => router.push("/")}
        className="w-3/5 py-5 items-center justify-center font-normal"
      >
        Retour en lieu sur
      </Button>
    </div>
  );
};

export default NotAuthorizedComponent;
