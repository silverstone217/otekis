import { useCurrentUser } from "@/hooks/UserAuth";
import React, { useState } from "react";

const Stats = () => {
  const user = useCurrentUser();

  return (
    <div>
      Stats
      <br />
      <p>
        {user?.supplierBenefitAmount} USD
        <br />
        {user?.supplierBenefitAmountCDF} CDF
      </p>
    </div>
  );
};

export default Stats;
