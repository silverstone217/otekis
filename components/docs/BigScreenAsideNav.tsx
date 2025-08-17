import { LinksDocumentation } from "@/utils/documentation";
import Link from "next/link";
import React from "react";

const BigScreenAsideNav = () => {
  return (
    <div>
      {LinksDocumentation.map((link, idx) => (
        <Link
          key={idx}
          href={link.url}
          className="block p-2 hover:bg-gray-200 text-lg font-medium"
        >
          {link.title}
        </Link>
      ))}
    </div>
  );
};

export default BigScreenAsideNav;
