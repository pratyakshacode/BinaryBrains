import { Input } from '@/components/ui/input';
import { useRequest } from '@/utils/request';
import { GET_ALL_ARTICLES_ROUTE } from '@/utils/Urlpaths';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import Pagination from '@/components/Pagination/Pagination';

const AllArticles = () => {
    // 1. Hook into the URL search parameters
    const [searchParams, setSearchParams] = useSearchParams();

    // 2. Initialize state from the URL (falling back to defaults if empty)
    const [searchQuery, setSearchQuery] = useState<string>(
        searchParams.get('title') || ''
    );
    const [debouncedTitle] = useDebounce(searchQuery, 1000);

    const [page, setPage] = useState<number>(
        Number(searchParams.get('page')) || 1
    );
    const [limit, setLimit] = useState<number>(
        Number(searchParams.get('limit')) || 10
    );

    const { get } = useRequest();

    // 3. Update the URL dynamically whenever the debounced search, page, or limit changes
    useEffect(() => {
        const params = new URLSearchParams();

        if (debouncedTitle) params.set('title', debouncedTitle);
        params.set('page', page.toString());
        params.set('limit', limit.toString());

        // { replace: true } prevents building up a massive browser history stack
        // every time the user types a letter or clicks next page
        setSearchParams(params, { replace: true });
    }, [debouncedTitle, page, limit, setSearchParams]);

    const getArticles = async () => {
        // FIXED: Included page and limit in the API request!
        let url = `${GET_ALL_ARTICLES_ROUTE}?page=${page}&limit=${limit}`;
        if (debouncedTitle) {
            url += `&title=${debouncedTitle}`;
        }
        return await get(url);
    };

    const { data, isLoading, isError } = useQuery({
        // FIXED: Added page and limit to the queryKey so React Query knows to refetch
        queryKey: ['articles', debouncedTitle, page, limit],
        queryFn: getArticles,
    });

    return (
        <div className="flex flex-col w-full items-center max-w-7xl mx-auto min-h-screen pt-10 px-4 text-foreground bg-background transition-colors">
            <div className="w-full flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground transition-colors flex items-center gap-3">
                    <FileText className="text-primary" size={36} />
                    All Articles
                </h1>

                <div className="relative w-full md:w-96">
                    {/* Used the leftSection prop from the custom Input component we made earlier */}
                    <Input
                        placeholder="Search articles by title or description..."
                        className="h-12 bg-card/60 backdrop-blur-sm border-border text-foreground transition-all"
                        value={searchQuery}
                        rightSection={
                            <Search
                                className="text-muted-foreground"
                                size={18}
                            />
                        }
                        // When the user starts typing a new search, bump them back to page 1
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            {/* 1. Error State */}
            {isError && (
                <div className="w-full py-20 text-center text-destructive">
                    <p className="text-lg">
                        Failed to load articles. Please try again later.
                    </p>
                </div>
            )}

            {/* 3. Empty Search State */}
            {!isLoading && !isError && data?.data?.data?.length === 0 && (
                <div className="w-full py-20 flex flex-col items-center justify-center text-center">
                    <Search
                        className="text-muted-foreground/50 mb-4"
                        size={48}
                    />
                    <h3 className="text-xl font-semibold text-foreground">
                        No articles found
                    </h3>
                    <p className="text-muted-foreground">
                        We couldn't find anything matching "{searchQuery}"
                    </p>
                </div>
            )}

            {/* 4. Success State (The Cards) */}
            {!isLoading && !isError && data?.data?.data?.length > 0 && (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                    {data?.data?.data?.map((article: any) => (
                        <div
                            key={article.id}
                            className="group flex flex-col justify-between bg-card/60 backdrop-blur-xl border border-border rounded-xl p-6 transition-all duration-300 hover:bg-card/80 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
                        >
                            <div>
                                <h2 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                    {article.title}
                                </h2>
                                <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                                    {article.description ||
                                        'No description provided.'}
                                </p>
                            </div>

                            <Link
                                to={`/article/${article.id}`}
                                className="inline-flex items-center text-primary font-semibold text-sm hover:underline transition-colors mt-auto w-fit"
                            >
                                Read Article
                                <svg
                                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Component */}
            {!isLoading && !isError && data?.data?.data?.length > 0 && (
                <Pagination
                    currentPage={page}
                    totalPages={data?.data?.totalPages || 1}
                    onPageChange={newPage => setPage(newPage)}
                    limit={limit}
                    onLimitChange={newLimit => setLimit(newLimit)}
                />
            )}
        </div>
    );
};

export default AllArticles;
