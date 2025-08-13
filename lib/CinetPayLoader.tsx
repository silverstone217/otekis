"use client";
import Script from "next/script";

export default function CinetPayLoader() {
  return (
    <Script
      src="https://cdn.cinetpay.com/seamless/main.js"
      strategy="afterInteractive"
      onLoad={() => {
        console.log("CinetPay script loaded");
      }}
    />
  );
}
