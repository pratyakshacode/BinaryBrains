import { useRequest } from '@/utils/request';
import { GET_ARTICLE_ROUTE } from '@/utils/Urlpaths';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

const ShowArticle = () => {
    const { articleId } = useParams<{ articleId: string }>();
    const { get } = useRequest();

    const getArticle = async () => {
        const response = await get(
            GET_ARTICLE_ROUTE.replace(':articleId', articleId!)
        );
        return response.data;
    };

    const {
        data: article,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['article', articleId],
        queryFn: getArticle,
        enabled: !!articleId,
    });

    // 1. Loading State (Dark Mode Optimized)
    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-1/2 mb-8"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-5/6"></div>
                </div>
            </div>
        );
    }

    // 2. Error State (Dark Mode Optimized)
    if (isError || !article) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Article not found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    The article you are looking for does not exist or an error
                    occurred.
                </p>
            </div>
        );
    }

    // 3. Success State
    return (
        <article className="max-w-6xl mx-auto px-4 py-10 lg:py-10 text-foreground bg-background transition-colors relative">
            <div className="fixed top-20 left-10 w-[500px] h-[500px] bg-primary/40 blur-[200px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-10 right-40 w-[400px] h-[400px] bg-primary/40 blur-[200px] rounded-full pointer-events-none"></div>
            {/* Header Section */}
            <header className="mb-10 border border-gray-200 dark:border-zinc-800 pb-8 bg-muted px-4 py-5 rounded-2xl">
                <h1 className="text-3xl text-muted-foreground lg:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
                    {article.title}
                </h1>

                {article.description && (
                    <p className="text-md text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        {article.description}
                    </p>
                )}

                {/* Metadata Row */}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold mr-2">
                            {article.createdBy?.firstName?.charAt(0) || 'U'}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-300">
                            {article.createdBy?.firstName}{' '}
                            {article.createdBy?.lastName}
                        </span>
                    </div>
                    <span>•</span>
                    <time dateTime={article.createdAt}>
                        {new Date(article.createdAt).toLocaleDateString(
                            'en-US',
                            {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            }
                        )}
                    </time>
                </div>
            </header>

            {/* Main Content Section */}
            <div
                className="prose prose-lg prose-indigo dark:prose-invert max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Footer / Interaction Section */}
            <footer className="border-t border-gray-200 dark:border-zinc-800 pt-8 flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514"
                        />
                    </svg>
                    <span className="font-medium">
                        {article.likeCount || 0}
                    </span>
                </button>

                <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.514"
                        />
                    </svg>
                    <span className="font-medium">
                        {article.dislikeCount || 0}
                    </span>
                </button>
            </footer>
        </article>
    );
};

export default ShowArticle;
