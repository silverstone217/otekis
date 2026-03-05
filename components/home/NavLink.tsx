"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  title: string;
};

export const NavLink = ({ href, title }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className="group relative px-1 py-2 text-sm transition-all"
    >
      <span
        className={`transition-all
        ${isActive ? "font-semibold text-black" : "text-gray-600 group-hover:text-black"}`}
      >
        {title}
      </span>

      {/* underline accent */}
      <span
        className={`absolute left-0 -bottom-1 h-0.5 w-full transition-all
        ${isActive ? "bg-neutral-900" : "bg-transparent group-hover:bg-neutral-400"}`}
      />
    </Link>
  );
};
