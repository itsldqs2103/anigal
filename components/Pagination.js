import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from "lucide-react";

const Pagination = ({ page, totalPages, loading, setPage }) => {
    if (totalPages <= 1) {
        return null;
    }

    const getPageNumbers = () => {
        const pages = [];

        if (page > 2) {
            pages.push(1);
        }

        if (page > 3) {
            pages.push("start-ellipsis");
        }

        for (
            let p = Math.max(1, page - 1);
            p <= Math.min(totalPages, page + 1);
            p++
        ) {
            pages.push(p);
        }

        if (page < totalPages - 2) {
            pages.push("end-ellipsis");
        }

        if (page < totalPages - 1) {
            if (pages[pages.length - 1] !== totalPages) {
                pages.push(totalPages);
            }
        }

        if (page === totalPages && !pages.includes(totalPages)) {
            pages.push(totalPages);
        }

        return [...new Set(pages)];
    };

    const pages = getPageNumbers();

    return (
        <div className="flex justify-center mt-4">
            <div className="join">
                <button type="button"
                    className="join-item btn"
                    disabled={loading || page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>

                <div className="hidden sm:flex">
                    {pages.map((p, i) =>
                        typeof p === "number" ? (
                            <button type="button"
                                key={p}
                                className={`join-item btn ${p === page ? 'btn-active' : ''}`}
                                disabled={p === page}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        ) : (
                            <button type="button"
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

                <button type="button"
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