"use client";
import { OrderWithProductInfo } from "@/app/(shop)/[slug]/commandes/page";
import { Preferences, Shop } from "@/lib/generated/prisma/client";
import { ChevronRight, Ellipsis, Search } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusOrderData } from "@/utils/paymentData";
import Link from "next/link";
import Image from "next/image";
import PaginationSection from "@/components/PaginationSection";

interface MainOrdersProps {
  myOrders: OrderWithProductInfo[];
  shopPreferences: Preferences;
  shop: Shop;
  currency?: "$" | "CDF";
  exchange: number;
}

const MainOrders = ({ myOrders, shopPreferences, shop }: MainOrdersProps) => {
  // HEADER NUM POSITION
  const Header = shopPreferences?.Header ?? "0";
  const shopUrl = `/${shop.slug}`;
  // Paginations
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstIndex = lastItemIndex - itemsPerPage;

  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState("");
  const [statusPayment, setStatusPayment] = useState("tout");

  const filteredOrders = useMemo(() => {
    if (myOrders.length < 1) return [];

    return myOrders
      .filter(
        (order) =>
          order.id.toLowerCase().includes(searchText.toLowerCase()) ||
          (order?.ShipmentNumber &&
            order?.ShipmentNumber.toLowerCase().includes(
              searchText.toLowerCase(),
            )),
      )
      .filter(
        (order) =>
          status === "tout" || status === "" || order.status === status,
      );
  }, [myOrders, searchText, status]);

  //   currentItems for pagination
  const currentItems = useMemo(
    () => filteredOrders.slice(firstIndex, lastItemIndex),
    [filteredOrders, firstIndex, lastItemIndex],
  );

  return (
    <div
      className={`w-full flex flex-col gap-6 px-2 lg:px-4 mx-auto max-w-7xl
        ${Number(Header) === 3 ? "pt-24" : "pt-4"}
    `}
    >
      {/* conatainer */}
      <div className="grid w-full gap-10">
        {/* top filter */}
        <div className="w-full grid grid-cols-2 gap-4 overflow-hidden items-center">
          {/* search Text */}
          <div className="relative w-full ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 z-10" />

            <input
              type="search"
              placeholder="Numero de suivie ou de commande..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`
          w-full focus:outline-none focus:ring-0 py-2
          border outline-none pl-12 pr-2 outline-gray-500 h-full text-sm
          focus:border-gray-500 focus:outline-gray-500 focus:ring-gray-500
          
  `}
              style={{
                borderColor: shopPreferences.buttonColor,
                outline: shopPreferences.buttonColor,
                borderRadius: shopPreferences.buttonRadius,
                color: shopPreferences.textColor,
                backgroundColor:
                  shopPreferences.background === "#ffffff"
                    ? "transparent"
                    : "rgba(19, 19, 19, 0.3)",
              }}
            />
          </div>

          {/* Status */}
          <div
            style={
              {
                "--background": shopPreferences.background,
                "--border-color": shopPreferences.buttonColor,
                "--border-radius": shopPreferences.buttonRadius,
                "--text-color": shopPreferences.textColor,
              } as React.CSSProperties
            }
          >
            <Select value={status} onValueChange={(val) => setStatus(val)}>
              <SelectTrigger
                className="w-full h-12 outline-none focus:outline-none focus:ring-0 capitalize 
              "
                style={{
                  backgroundColor:
                    shopPreferences.background === "#ffffff"
                      ? "transparent"
                      : "rgba(19, 19, 19, 0.3)",
                  borderColor: shopPreferences.buttonColor,
                  outline: shopPreferences.buttonColor,
                  borderRadius: shopPreferences.buttonRadius,
                  color: shopPreferences.textColor,
                }}
              >
                <SelectValue placeholder="Status de la commande" />
              </SelectTrigger>
              <SelectContent
                className=" w-full outline-none focus:outline-none focus:ring-0 p-3"
                style={{
                  borderColor: shopPreferences.buttonColor,
                  outline: shopPreferences.buttonColor,
                  borderRadius: shopPreferences.buttonRadius,
                  color: shopPreferences.textColor,
                  backgroundColor: shopPreferences.background,
                }}
              >
                <SelectItem value="tout">Tout</SelectItem>
                {StatusOrderData.toSorted().map((st, idx) => (
                  <SelectItem key={idx} value={st} className="capitalize">
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* orders list */}
        {filteredOrders.length < 1 && (
          <div className="w-full text-center opacity-70 py-4">
            <p>Aucune commande trouvée!</p>
          </div>
        )}

        {filteredOrders.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3
          2xl:grid-cols-4 gap-6
          "
          >
            {currentItems.map((order, index) => (
              <div
                key={index}
                className="flex w-full flex-col gap-2 text-xs  py-4 shadow-md px-2
                transition-all duration-500 ease-in-out border-b
                "
                style={{
                  borderColor: shopPreferences.buttonColor,
                  //   borderRadius: shopPreferences.buttonRadius,
                }}
              >
                {/* top */}
                <Link
                  href={shopUrl + "/commandes/" + order.id}
                  className="w-full flex items-center justify-between gap-x-4 gap-y-1.5 flex-wrap
                transition-all duration-500 ease-in-out group
                "
                >
                  <div className="capitalize shrink-0 font-bold text-sm flex items-center gap-2">
                    <span
                      className="capitalize shrink-0 font-bold text-sm
                    group-hover:opacity-65 transition-all duration-500 ease-in-out
                    "
                    >
                      {order.status}
                    </span>
                    <ChevronRight className="size-5" />
                  </div>
                  <p className="text-[10px] opacity-75">{order.id}</p>
                  <p className="text-[10px] opacity-75">
                    fait le{" "}
                    {order.createdAt.toLocaleDateString("fr-Fr", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </Link>

                {/* center with items */}
                <div className={`grid grid-cols-5 gap-2 mt-2`}>
                  {order.productInfo &&
                    order.productInfo.slice(0, 4).map(
                      (item, idx) =>
                        item.image &&
                        item.articleId && (
                          <Link
                            key={idx}
                            href={shopUrl + "/catalogues/" + item.productId}
                          >
                            <Image
                              src={item.image}
                              alt={item.articleId.toString()}
                              width={600}
                              height={600}
                              priority
                              className="object-cover w-full h-20
                              transition-all duration-500 ease-in-out
                              "
                              style={{
                                borderColor: shopPreferences.buttonColor,
                                borderRadius: shopPreferences.buttonRadius,
                              }}
                            />
                          </Link>
                        ),
                    )}
                  {/* more ... */}
                  {order.productInfo.length > 4 && (
                    <div
                      className="w-full border flex items-center justify-center h-20
                      flex-col text-[10px] opacity-75
                      "
                      style={{
                        borderColor: shopPreferences.buttonColor,
                        borderRadius: shopPreferences.buttonRadius,
                      }}
                    >
                      <span>
                        {order.productInfo.length - 4}{" "}
                        {order.productInfo.length - 4 > 1
                          ? "restants"
                          : "restant"}
                      </span>
                      <Ellipsis className="opacity-75" />
                    </div>
                  )}
                </div>

                {/* bottom */}
                <div className="flex w-full items-center gap-2.5 flex-wrap mt-2 text-[10px] opacity-75">
                  <p>
                    {order.orderItems
                      .reduce((acc, x) => acc + x.quantity, 0)
                      .toString()
                      .padStart(2, "0")}{" "}
                    articles
                  </p>

                  <span
                    className="size-1 rounded-full"
                    style={{
                      backgroundColor: shopPreferences.buttonColor,
                    }}
                  />
                  <p className="font-medium">
                    {order.totalAmount.toString().padStart(2, "0")}{" "}
                    <span className="text-xs">
                      {order.currency === "USD" ? "$" : "CDF"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="py-4" />

      {/* pagination section */}
      <PaginationSection
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        lastItemIndex={lastItemIndex}
        firstIndex={firstIndex}
        currentItems={currentItems}
        totalItems={filteredOrders.length}
      />
    </div>
  );
};

export default MainOrders;
