"use client";

import { useRouter } from "next/navigation";
import { MouseEvent } from "react";

export function SmoothLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const [path, hash] = href.split("#");

    router.push(path);

    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 300); // petit délai pour laisser la page charger
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="text-blue-500 hover:underline"
    >
      {children}
    </a>
  );
}
