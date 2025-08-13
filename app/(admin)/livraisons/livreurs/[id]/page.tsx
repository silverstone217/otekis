import { getUser } from "@/actions/actions";
import { getDeliveryManById } from "@/actions/deliverymenActions";
import { DeliveryAgentProfile } from "@/components/admins/delivrery/deliveryAgentProfile";
import { PERMITED_ROLES } from "@/utils/dataAdd";
import { DeliveryAgent, DeliveryOrder } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

async function DeliveryManWIthIDPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  if (!id) redirect("/livraisons/livreurs");

  const user = await getUser();
  if (!user) {
    return null;
  }

  const role = user.role;
  if (!PERMITED_ROLES.includes(role)) {
    return null;
  }

  const agent = await getDeliveryManById(id);

  if (!agent) redirect("/livraisons/livreurs");

  return (
    <div>
      <DeliveryAgentProfile agent={agent} />
    </div>
  );
}

export default DeliveryManWIthIDPage;
