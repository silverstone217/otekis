import AuthForm from "@/components/auth/AuthForm";
import GreetingComponent from "@/components/auth/GreetingComponent";
import { getUser } from "@/actions/actions";
import { redirect } from "next/navigation";
import React from "react";

const LoginPage = async () => {
  const user = await getUser();

  if (user) {
    redirect("/");
  }
  return (
    <main
      className="w-full h-[100dvh] grid lg:grid-cols-4 grid-cols-1
  transition-all ease-in-out duration-500
  "
    >
      {/* image and ads */}
      <div
        className="hidden lg:flex flex-col relative col-span-2 2xl:col-span-3 h-full
       transition-all ease-in-out duration-500
      "
      >
        <GreetingComponent />
      </div>

      {/* form and title */}
      <div
        className="col-span-1 lg:col-span-2 2xl:col-span-1 h-full 
       transition-all ease-in-out duration-500
      "
      >
        <AuthForm />
      </div>
    </main>
  );
};

export default LoginPage;
