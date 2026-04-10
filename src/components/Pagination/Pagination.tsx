import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    limit: number;
    onLimitChange: (limit: number) => void;
    limitOptions?: number[];
}

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    limit,
    onLimitChange,
    limitOptions = [10, 20, 30, 50],
}: PaginationProps) => {
    // Prevent rendering if there's only 1 page and no items
    if (totalPages <= 0) return null;

    // Smart logic to generate page numbers with ellipses
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(
                    1,
                    '...',
                    totalPages - 3,
                    totalPages - 2,
                    totalPages - 1,
                    totalPages
                );
            } else {
                pages.push(
                    1,
                    '...',
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    '...',
                    totalPages
                );
            }
        }
        return pages;
    };

    return (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border mt-8">
            {/* Limit Selector */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows per page</span>
                <div className="relative">
                    <select
                        value={limit}
                        onChange={e => {
                            onLimitChange(Number(e.target.value));
                            onPageChange(1); // Reset to page 1 when limit changes
                        }}
                        className="h-8 pl-2 pr-6 bg-card border border-border rounded-md text-foreground outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer transition-colors"
                    >
                        {limitOptions.map(opt => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                    {/* Custom tiny arrow for the select */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                            className="w-3 h-3 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft size={16} />
                </Button>

                {getPageNumbers().map((page, idx) => (
                    <React.Fragment key={idx}>
                        {page === '...' ? (
                            <div className="h-8 w-8 flex items-center justify-center text-muted-foreground">
                                <MoreHorizontal size={16} />
                            </div>
                        ) : (
                            <Button
                                variant={
                                    currentPage === page ? 'default' : 'ghost'
                                }
                                className={`h-8 w-8 p-0 ${
                                    currentPage !== page &&
                                    'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => onPageChange(page as number)}
                            >
                                {page}
                            </Button>
                        )}
                    </React.Fragment>
                ))}

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight size={16} />
                </Button>
            </div>
        </div>
    );
};

export default Pagination;
