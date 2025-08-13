import { redirect } from "next/navigation";
import React from "react";

function page() {
  return redirect("/finances/transfert");
}

export default page;
