"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MobileNavItemProps = {
  href: string;
  title: string;
  icon: any;
  setIsOpen: (value: boolean) => void;
};

export const MobileNavItem = ({
  href,
  title,
  icon: Icon,
  setIsOpen,
}: MobileNavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={() => setIsOpen(false)}
      className="group relative flex items-center gap-4 px-4 py-4 transition-all"
    >
      {/* Accent bar */}
      <span
        className={`absolute left-0 top-0 h-full w-1 rounded-r-full transition-all
        ${
          isActive
            ? "bg-neutral-900"
            : "bg-transparent group-hover:bg-neutral-300"
        }`}
      />

      <Icon
        className={`w-5 h-5 transition-all
        ${isActive ? "text-black" : "text-gray-500 group-hover:text-black"}`}
      />

      <span
        className={`transition-all
        ${
          isActive
            ? "font-semibold text-black"
            : "text-gray-600 group-hover:text-black"
        }`}
      >
        {title}
      </span>
    </Link>
  );
};
