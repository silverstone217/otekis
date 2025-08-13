import { redirect } from "next/navigation";

function page() {
  return redirect("/livraisons/livreurs");
}

export default page;
