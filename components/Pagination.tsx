"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  label: string;
}

export default function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  label,
}: PaginationProps) {
  const pageCount = Math.ceil(totalItems / pageSize);

  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const firstVisiblePage = Math.max(1, Math.min(page - 2, pageCount - 4));
  const visiblePages = Array.from(
    { length: Math.min(pageCount, 5) },
    (_, index) => firstVisiblePage + index
  );

  const buttonClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 px-2 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label={`Paginasi ${label}`}
      className="flex flex-col gap-3 border-t border-neutral-800 pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs text-neutral-500" aria-live="polite">
        Menampilkan <span className="font-semibold text-neutral-300">{start}–{end}</span> dari {totalItems} {label}
      </p>
      {pageCount > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={buttonClass}
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft size={15} />
          </button>
          {visiblePages.map((pageNumber) => (
            <button
              type="button"
              key={pageNumber}
              className={`${buttonClass} ${pageNumber === page ? "border-[#174A3A] bg-[#174A3A] text-[#FCFBF7] hover:bg-[#245B45]" : ""}`}
              onClick={() => onPageChange(pageNumber)}
              aria-label={`Halaman ${pageNumber}`}
              aria-current={pageNumber === page ? "page" : undefined}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            className={buttonClass}
            onClick={() => onPageChange(page + 1)}
            disabled={page === pageCount}
            aria-label="Halaman berikutnya"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </nav>
  );
}
