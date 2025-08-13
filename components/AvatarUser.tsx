"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

const AvatarUser = () => {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

  const shortName = user.name ? user.name.slice(0, 2).toUpperCase() : "NN";
  return (
    <Avatar>
      {user.image ? (
        <AvatarImage src={user.image} />
      ) : (
        <AvatarFallback className="font-bold">{shortName}</AvatarFallback>
      )}
    </Avatar>
  );
};

export default AvatarUser;
