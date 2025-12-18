import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from 'lucide-react';

const Pagination = ({ page, totalPages, loading, setPage }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    pages.push(1);

    if (start > 2) {
      pages.push('start-ellipsis');
    }

    for (let p = start; p <= end; p++) {
      pages.push(p);
    }

    if (end < totalPages - 1) {
      pages.push('end-ellipsis');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex justify-center mt-4">
      <div className="join">
        <button
          type="button"
          className="join-item btn"
          disabled={loading || page === 1}
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex">
          {pages.map((p, i) =>
            typeof p === 'number' ? (
              <button
                type="button"
                key={p}
                className={`join-item btn ${p === page ? 'btn-active' : ''}`}
                disabled={p === page}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ) : (
              <button
                type="button"
                key={p + i}
                className="join-item btn btn-disabled pointer-events-none"
              >
                <EllipsisIcon className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        <div className="sm:hidden join-item btn pointer-events-none">
          {page}/{totalPages}
        </div>

        <button
          type="button"
          className="join-item btn"
          disabled={loading || page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
