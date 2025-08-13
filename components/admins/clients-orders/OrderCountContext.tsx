"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

const OrderCountContext = createContext<number>(0);

export const useOrderCount = () => useContext(OrderCountContext);

export const OrderCountProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [count, setCount] = useState(0);
  const WaitTime = 10000;

  useEffect(() => {
    // Poll toutes les 10 secondes (remplace par WebSocket si possible)
    const fetchCount = async () => {
      try {
        const res = await fetch(
          "/api/admins/orders/count?status=en%20cours%20de%20traitement"
        );
        const data = await res.json();
        setCount(data.count);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, WaitTime);
    return () => clearInterval(interval);
  }, []);

  return (
    <OrderCountContext.Provider value={count}>
      {children}
    </OrderCountContext.Provider>
  );
};
