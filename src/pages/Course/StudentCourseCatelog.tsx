import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useRequest } from '@/utils/request';
import {
    Search,
    BookOpen,
    Star,
    IndianRupee,
    ArrowRight,
    Loader2,
    PlayCircle,
} from 'lucide-react';

// --- Interfaces ---
interface Course {
    id: string;
    title: string;
    description: string;
    type: 'free' | 'paid';
    amount: number;
    thumbnail?: string;
    category?: string;
}

interface CourseListResponse {
    data: Course[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}

// Mock Categories for the UI
const CATEGORIES = ['All', 'Development', 'Design', 'Business', 'Marketing'];

export const StudentCourseCatalog = () => {
    const request = useRequest();

    // --- State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // --- API: Fetch PUBLISHED Courses Only ---
    const { data, isLoading, isError } = useQuery({
        queryKey: ['student-courses', debouncedQuery, activeCategory],
        queryFn: async () => {
            const params = new URLSearchParams({
                limit: '12',
                status: 'published',
            });
            if (debouncedQuery) params.append('title', debouncedQuery);
            if (activeCategory !== 'All')
                params.append('category', activeCategory);

            const res = await request.get(`/course?${params.toString()}`);
            return res.data as CourseListResponse;
        },
    });

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-[#050b14] flex flex-col transition-colors">
            {/* --- GLASSMORPHISM BACKGROUND GLOWS --- */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] dark:blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/3 z-0"></div>
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] dark:blur-[150px] pointer-events-none -translate-x-1/2 z-0"></div>
            <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] dark:blur-[150px] pointer-events-none translate-y-1/3 z-0"></div>

            {/* --- HERO SECTION --- */}
            <div className="relative z-10 w-full pt-12 pb-8 lg:pt-16 lg:pb-12 text-center px-4 sm:px-6 border-b border-slate-200/50 dark:border-white/5 bg-white/30 dark:bg-black/10 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white transition-colors animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Unlock Your Next{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-500">
                            Superpower
                        </span>
                    </h1>

                    <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 transition-colors animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                        Master new skills with our expertly crafted courses.
                        Join thousands of learners and start building your
                        future today.
                    </p>

                    {/* Search Bar (Glassy) */}
                    <div className="max-w-xl mx-auto relative animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="What do you want to learn today?"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-base focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-lg shadow-slate-200/40 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                        />
                    </div>
                </div>
            </div>

            {/* --- MAIN CATALOG SECTION --- */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full flex-1">
                {/* Category Pills */}
                <div className="flex items-center justify-center sm:justify-start gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 backdrop-blur-md border ${
                                activeCategory === cat
                                    ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/30'
                                    : 'bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid Container */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-teal-500 mb-4" />
                        <p className="text-slate-600 dark:text-slate-400 font-medium">
                            Curating courses for you...
                        </p>
                    </div>
                ) : isError ? (
                    <div className="text-center py-20 bg-red-500/10 dark:bg-red-500/5 backdrop-blur-md rounded-3xl border border-red-500/20 text-red-600 dark:text-red-400">
                        <h3 className="text-lg font-bold">
                            Oops! Something went wrong.
                        </h3>
                        <p className="text-sm mt-1">
                            We couldn't load the courses. Please refresh the
                            page.
                        </p>
                    </div>
                ) : data?.data?.length === 0 ? (
                    <div className="text-center py-20 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-none">
                        <BookOpen className="h-14 w-14 text-slate-400 dark:text-slate-500 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            No courses found
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                            We couldn't find any published courses matching your
                            search. Try different keywords!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data?.data.map(course => (
                            <Link
                                to={`/course/${course.id}`}
                                key={course.id}
                                className="group flex flex-col bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-teal-500/50 hover:bg-white/80 dark:hover:bg-white/10 shadow-xl shadow-slate-200/40 dark:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Thumbnail */}
                                <div className="h-40 relative overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-white/5 dark:to-white/10 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full text-teal-600 dark:text-teal-500 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                                            <PlayCircle
                                                size={24}
                                                className="ml-0.5"
                                            />
                                        </div>
                                    </div>
                                    <BookOpen className="w-12 h-12 text-slate-400 dark:text-white/20 group-hover:scale-110 transition-transform duration-500" />
                                </div>

                                {/* Card Body */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded-md">
                                            {course.category || 'Technology'}
                                        </span>
                                        {/* Mock Rating */}
                                        <div className="flex items-center text-amber-500 text-xs font-bold gap-1">
                                            <Star
                                                size={12}
                                                className="fill-current"
                                            />{' '}
                                            4.8
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 leading-tight mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                        {course.title}
                                    </h3>

                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 flex-1 transition-colors">
                                        {course.description ||
                                            'Dive deep into this subject and elevate your skills to the next level.'}
                                    </p>

                                    {/* Footer / Price */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10 mt-auto transition-colors">
                                        <div className="font-bold text-base flex items-center">
                                            {course.type === 'free' ? (
                                                <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-sm border border-emerald-500/20">
                                                    Free
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-slate-900 dark:text-white transition-colors">
                                                    <IndianRupee
                                                        size={14}
                                                        className="text-slate-500 dark:text-slate-400 mr-0.5"
                                                    />
                                                    {course.amount}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Details <ArrowRight size={16} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
