"use client";
import { SessionProvider } from "next-auth/react";
import React, { FC, ReactNode } from "react";

interface ProviderProps {
  children: ReactNode;
}

const AuthProvider: FC<ProviderProps> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default AuthProvider;
