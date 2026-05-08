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
        <div className="min-h-screen bg-background">
            {/* --- HERO SECTION (Tightened Up) --- */}
            <div className="relative bg-secondary/30 border-b border-border overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-10 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                </div>

                {/* Reduced padding (py-10 instead of py-20) */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 text-center">
                    {/* Reduced heading size (text-3xl to 5xl) */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Unlock Your Next{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                            Superpower
                        </span>
                    </h1>

                    {/* Reduced margin and text size slightly */}
                    <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                        Master new skills with our expertly crafted courses.
                        Join thousands of learners and start building your
                        future today.
                    </p>

                    {/* Search Bar (Button removed, slightly smaller padding) */}
                    <div className="max-w-xl mx-auto relative animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-muted-foreground/60" />
                        </div>
                        {/* Auto-search input. Notice the 'py-3' instead of 'py-4' to make it sleeker */}
                        <input
                            type="text"
                            placeholder="What do you want to learn today?"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3 bg-background border border-border rounded-full text-base focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-md"
                        />
                    </div>
                </div>
            </div>

            {/* --- MAIN CATALOG SECTION --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Category Pills */}
                <div className="flex items-center justify-center sm:justify-start gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                activeCategory === cat
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                    : 'bg-secondary text-foreground hover:bg-secondary/70 border border-border'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground font-medium">
                            Curating courses for you...
                        </p>
                    </div>
                ) : isError ? (
                    <div className="text-center py-20 text-destructive bg-destructive/10 rounded-2xl border border-destructive/20">
                        <h3 className="text-lg font-bold">
                            Oops! Something went wrong.
                        </h3>
                        <p className="text-sm mt-1">
                            We couldn't load the courses. Please refresh the
                            page.
                        </p>
                    </div>
                ) : data?.data?.length === 0 ? (
                    <div className="text-center py-20 bg-secondary/30 rounded-3xl border-2 border-dashed border-border">
                        <BookOpen className="h-14 w-14 text-muted-foreground/40 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-foreground">
                            No courses found
                        </h3>
                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
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
                                className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Thumbnail */}
                                <div className="h-40 relative overflow-hidden bg-gradient-to-br from-secondary to-secondary/40 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                                        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full text-primary transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                            <PlayCircle
                                                size={24}
                                                className="ml-0.5"
                                            />
                                        </div>
                                    </div>
                                    <BookOpen className="w-12 h-12 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                                </div>

                                {/* Card Body */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
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

                                    <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h3>

                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                        {course.description ||
                                            'Dive deep into this subject and elevate your skills to the next level.'}
                                    </p>

                                    {/* Footer / Price */}
                                    <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                                        <div className="font-bold text-base flex items-center">
                                            {course.type === 'free' ? (
                                                <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-sm">
                                                    Free
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-foreground">
                                                    <IndianRupee
                                                        size={14}
                                                        className="text-muted-foreground mr-0.5"
                                                    />
                                                    {course.amount}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
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
