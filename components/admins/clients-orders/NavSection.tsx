"use client";

import { AdminOrdersLinkPages } from "@/utils/dataAdd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";

const NavSection = () => {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // Fonction pour scroller l'élément cliqué dans la vue du parent (nav)
  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    const target = event.currentTarget;

    // Sur mobile uniquement (tu peux ajuster la condition)
    // if (window.innerWidth <= 1524 && navRef.current) {
    // scrollIntoView avec options pour centrer horizontalement
    target.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
    // }
  };

  // Fonction pour transformer scroll vertical en scroll horizontal
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) === 0) return; // Ignore si déjà scroll horizontal ou pas de scroll vertical

      e.preventDefault();
      nav.scrollBy({
        left: e.deltaY,
        behavior: "smooth",
      });
    };

    nav.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      nav.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="w-full flex items-center gap-6 overflow-x-auto no-scrollbar px-4 border rounded-md
      no-horizontal-scrollbar
      "
      aria-label="Filtrer les commandes par statut"
    >
      {AdminOrdersLinkPages.map(({ label, value }) => {
        const href = `/commandes/status/${value}`;
        const isActive = pathname === href;

        return (
          <Link
            key={value}
            href={href}
            aria-current={isActive ? "page" : undefined}
            onClick={handleClick}
            className={`
              shrink-0 pt-3 pb-2 px-3 capitalize text-sm border-b-4 transition-all duration-300 ease-in-out
              ${
                isActive
                  ? "font-semibold border-primary text-primary"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
            `}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavSection;
