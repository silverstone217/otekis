"use client";

import Link from "next/link";
import { CiMail, CiYoutube } from "react-icons/ci";
import { MdOutlineLocalPhone } from "react-icons/md";
import { SlSocialFacebook } from "react-icons/sl";
import { FaInstagram } from "react-icons/fa";

export function SocialLinks() {
  const socialLinks = [
    {
      icon: <CiMail size={22} />,
      label: "Email",
      href: "mailto:servigroup.social@gmail.com",
    },
    {
      icon: <MdOutlineLocalPhone size={22} />,
      label: "Téléphone",
      href: "tel:+243813350706",
    },
    {
      icon: <SlSocialFacebook size={22} />,
      label: "Facebook",
      href: "https://www.facebook.com/share/1ASu5V2mD6/",
    },
    {
      icon: <FaInstagram size={22} />,
      label: "Instagram",
      href: "https://www.instagram.com/servigroups?igsh=bzlxcWZ3OTRiaHpm",
    },
    {
      icon: <CiYoutube size={22} />,
      label: "YouTube",
      href: "https://youtube.com/@servigroupsocial?si=JqMvcjcldJpWiJgn",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-5 mt-4">
      {socialLinks.map(({ icon, label, href }) => (
        <Link
          key={label}
          href={href}
          target={href.startsWith("http") ? "_blank" : "_self"}
          rel="noopener noreferrer"
          aria-label={label}
          className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 
          hover:scale-110 transition-all duration-300 ease-in-out 
          text-gray-600 hover:text-gray-900 shadow-sm"
        >
          {icon}
        </Link>
      ))}
    </div>
  );
}
