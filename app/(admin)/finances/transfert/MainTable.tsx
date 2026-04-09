"use client";
// import { getCurrencySymbol } from "@/actions/companyAction";
import { TransfertColumns } from "@/components/admins/finances/transfert/transfertTable/TransfertColumns";
import { TransfertDataTable } from "@/components/admins/finances/transfert/transfertTable/TransfertTableData";
import { Shop, WithdrawalHistory } from "@/lib/generated/prisma/client";
import React from "react";

type Props = {
  shops: Shop[];
  currencySymbol: "$" | "CDF";
  allWidithdraw: WithdrawalHistory[];
};

const MainTable = ({ shops, currencySymbol, allWidithdraw }: Props) => {
  //   const [currencySymbol, setCurrencySymbol] = useState<string | null>(null);
  // const [loading, setLoading] = useState(true);

  //   useEffect(() => {
  //     async function fetchData() {
  //       // Exemple d’appel API pour récupérer la devise et les shops
  //       const resCurrency = await getCurrencySymbol();

  //       setCurrencySymbol(resCurrency);
  //       setLoading(false);
  //     }
  //     fetchData();
  //   }, []);

  const columns = TransfertColumns(currencySymbol);

  return (
    <TransfertDataTable
      columns={columns}
      data={shops}
      currencySymbol={currencySymbol}
      allWidithdraw={allWidithdraw}
    />
  );
};

export default MainTable;
