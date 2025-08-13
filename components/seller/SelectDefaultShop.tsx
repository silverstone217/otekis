"use client";
import { Shop } from "@prisma/client";
import { useEffect, useState } from "react";

type Props = {
  shops: Shop[];
};

const useSelectDefaultShop = ({ shops }: Props) => {
  const [selected, setSelected] = useState<Shop["id"] | null>(null);

  useEffect(() => {
    // if (!shops) return;
    const storedShop = localStorage.getItem("shop");
    if (storedShop) {
      const jsonId = JSON.parse(storedShop);
      if (shops.find((shop) => shop.id === jsonId)) {
        setSelected(jsonId);
      } else {
        const defaultShop = shops[0].id;
        localStorage.setItem("shop", JSON.stringify(defaultShop));
        setSelected(defaultShop);
      }
      setSelected(jsonId);
    } else {
      const defaultShop = shops[0].id;
      localStorage.setItem("shop", JSON.stringify(defaultShop));
      setSelected(defaultShop);
    }
    // console.log("infinite selected");
  }, [shops]);

  return selected;
};

export default useSelectDefaultShop;
