"use client";

import { IconLikeComponent } from "@/types/data";
import React from "react";

export const MenuIconTwoBarre: IconLikeComponent = ({
  className,
  style,
  ...props
}) => {
  return (
    <svg
      className={className}
      style={style}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="3" y1="7" x2="26" y2="7" />
      <line x1="3" y1="13" x2="26" y2="13" /> {/* rapprochée de la première */}
    </svg>
  );
};

export const MenuIconText: IconLikeComponent = ({
  className,
  style,
  ...props
}) => {
  return (
    <div
      className={`px-2 py-1 border  text-xs font-medium ${className ?? ""}`}
      style={style}
      {...props}
    >
      Menu
    </div>
  );
};
