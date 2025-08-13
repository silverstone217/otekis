"use client";
import React from "react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
  lastItemIndex: number;
  firstIndex: number;
  currentItems: unknown[];
  totalItems: number;
  shopStyle?: string;
};

const PaginationSection = ({
  currentPage,
  setCurrentPage,
  itemsPerPage,
  totalItems,
}: Props) => {
  const pages = [];
  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pages.push(i);
  }

  const handleNextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={handlePreviousPage} title="Prec" />
        </PaginationItem>

        {pages.map((page) => (
          <PaginationItem
            key={page}
            onClick={() => setCurrentPage(page)}
            className={currentPage === page ? "bg-overlay3" : ""}
          >
            <PaginationLink>{page}</PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext onClick={handleNextPage} title="Suiv" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationSection;
