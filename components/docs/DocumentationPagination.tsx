import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type NavProps = {
  currentUrl: string; // url complète de la page actuelle pour trouver l'index
  links: { title: string; url: string }[];
};

export function DocumentationPagination({ currentUrl, links }: NavProps) {
  // Trouve l'index courant dans la liste des liens
  const currentIndex = links.findIndex((link) => link.url === currentUrl);

  // Page précédente (null si aucune)
  const prevPage = currentIndex > 0 ? links[currentIndex - 1] : null;
  // Page suivante (null si dernière)
  const nextPage =
    currentIndex !== -1 && currentIndex < links.length - 1
      ? links[currentIndex + 1]
      : null;

  return (
    <nav
      className="flex justify-between items-center border-t border-gray-200 mt-12 pt-6 text-gray-700 dark:text-gray-300"
      aria-label="Navigation documentation"
    >
      {/* Lien précédent - à gauche */}
      <div className="min-w-[150px] max-w-[45vw]">
        {prevPage ? (
          <Link
            href={prevPage.url}
            className="flex items-center gap-2 hover:underline group ease-in-out duration-300"
            aria-label={`Page précédente : ${prevPage.title}`}
          >
            <ArrowLeft
              className="w-5 h-5 group-hover:-translate-x-1 ease-in-out duration-300"
              aria-hidden="true"
            />
            <span
              className="font-semibold break-words whitespace-normal"
              style={{ wordBreak: "break-word" }}
            >
              {prevPage.title}
            </span>
          </Link>
        ) : (
          <span className="text-gray-400" aria-hidden="true">
            &nbsp;
          </span>
        )}
      </div>

      {/* Page actuelle */}
      <div className="hidden lg:block text-center flex-grow font-medium text-gray-900 dark:text-gray-100 truncate">
        {currentIndex !== -1 ? links[currentIndex].title : "Documentation"}
      </div>

      {/* Lien suivant - à droite */}
      <div className="min-w-[150px] max-w-[45vw] text-right">
        {nextPage ? (
          <Link
            href={nextPage.url}
            className="flex items-center gap-2 justify-end hover:underline group ease-in-out duration-300"
            aria-label={`Page suivante : ${nextPage.title}`}
          >
            <span
              className="font-semibold break-words whitespace-normal text-right"
              style={{ wordBreak: "break-word" }}
            >
              {nextPage.title}
            </span>
            <ArrowRight
              className="w-5 h-5 group-hover:translate-x-1 ease-in-out duration-300"
              aria-hidden="true"
            />
          </Link>
        ) : (
          <span className="text-gray-400" aria-hidden="true">
            &nbsp;
          </span>
        )}
      </div>
    </nav>
  );
}
