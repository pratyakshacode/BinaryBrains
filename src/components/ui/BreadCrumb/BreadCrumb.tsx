// src/components/ui/Breadcrumb.tsx
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
    title: string;
    url: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string; // Allows you to pass custom margins if needed
}

export const Breadcrumb = ({ items, className = 'mb-6' }: BreadcrumbProps) => {
    if (!items || items.length === 0) return null;

    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center text-sm font-medium ${className}`}
        >
            <ol className="flex items-center flex-wrap gap-1 sm:gap-2">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="flex items-center">
                            {isLast ? (
                                // The Last Item (Current Page) - Solid text, no hover
                                <span
                                    className="text-foreground font-semibold tracking-wide pointer-events-none"
                                    aria-current="page"
                                >
                                    {item.title}
                                </span>
                            ) : (
                                // Previous Items - Clickable links with hover effects
                                <>
                                    <Link
                                        to={item.url}
                                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                                    >
                                        {/* Auto-inject a Home icon for the first item if it makes sense */}
                                        {index === 0 &&
                                            (item.title.toLowerCase() ===
                                                'home' ||
                                                item.title.toLowerCase() ===
                                                    'dashboard') && (
                                                <Home
                                                    size={14}
                                                    className="mb-0.5"
                                                />
                                            )}
                                        {item.title}
                                    </Link>

                                    {/* The Separator */}
                                    <ChevronRight
                                        size={14}
                                        className="mx-1 sm:mx-2 text-muted-foreground/50 shrink-0"
                                    />
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};
