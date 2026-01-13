import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from 'lucide-react';

export default function Pagination({ page, totalPages, loading, setPage }) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="mt-4 flex justify-center shadow-lg">
      <div className="join">
        <PrevButton
          disabled={loading || page === 1}
          onClick={() => setPage(page - 1)}
        />

        <DesktopPages pages={pages} currentPage={page} onSelect={setPage} />

        <MobileIndicator page={page} totalPages={totalPages} />

        <NextButton
          disabled={loading || page === totalPages}
          onClick={() => setPage(page + 1)}
        />
      </div>
    </div>
  );
}

function getPageNumbers(page, totalPages) {
  const pages = [1];

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) pages.push('ellipsis-start');

  for (let p = start; p <= end; p++) {
    pages.push(p);
  }

  if (end < totalPages - 1) pages.push('ellipsis-end');

  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

function PrevButton({ disabled, onClick }) {
  return (
    <button
      type="button"
      className="join-item btn"
      disabled={disabled}
      onClick={onClick}
    >
      <ChevronLeftIcon className="h-4 w-4" />
    </button>
  );
}

function NextButton({ disabled, onClick }) {
  return (
    <button
      type="button"
      className="join-item btn"
      disabled={disabled}
      onClick={onClick}
    >
      <ChevronRightIcon className="h-4 w-4" />
    </button>
  );
}

function DesktopPages({ pages, currentPage, onSelect }) {
  return (
    <div className="hidden sm:flex">
      {pages.map((page, index) =>
        typeof page === 'number' ? (
          <PageButton
            key={page}
            page={page}
            active={page === currentPage}
            onClick={() => onSelect(page)}
          />
        ) : (
          <Ellipsis key={`${page}-${index}`} />
        )
      )}
    </div>
  );
}

function PageButton({ page, active, onClick }) {
  return (
    <button
      type="button"
      className={`join-item btn ${
        active ? 'btn-primary pointer-events-none' : ''
      }`}
      onClick={onClick}
    >
      {page}
    </button>
  );
}

function Ellipsis() {
  return (
    <button
      type="button"
      className="join-item btn btn-disabled pointer-events-none"
    >
      <EllipsisIcon className="h-4 w-4" />
    </button>
  );
}

function MobileIndicator({ page, totalPages }) {
  return (
    <div className="join-item btn pointer-events-none sm:hidden">
      {page}/{totalPages}
    </div>
  );
}
