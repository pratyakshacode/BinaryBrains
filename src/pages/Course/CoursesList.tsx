import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useRequest } from '@/utils/request';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Search,
    BookOpen,
    IndianRupee,
    Edit3,
    Eye,
    EyeOff,
    Loader2,
} from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
} from '@/components/ui/BreadCrumb/BreadCrumb';

interface CourseListResponse {
    data: any[]; // The courses array
    meta: {
        // Assuming your pagination utility returns a meta object
        total: number;
        page: number;
        lastPage: number;
    };
}

export const CourseList = () => {
    const navigate = useNavigate();
    const request = useRequest();

    // Filters & Pagination State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        'all' | 'published' | 'draft'
    >('all');
    const [page, setPage] = useState(1);

    // Debounce search input to avoid spamming the API
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Fetch Courses API
    const { data, isLoading, isError } = useQuery({
        queryKey: ['courses', page, debouncedSearch, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
            });
            if (debouncedSearch) params.append('title', debouncedSearch);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const res = await request.get(`/admin/course?${params.toString()}`);
            return res.data as CourseListResponse;
        },
    });

    const items: BreadcrumbItem[] = [
        { title: 'Home', url: '/' },
        { title: 'Admin', url: '/admin' },
        { title: 'Courses', url: '/admin/article' },
    ];

    return (
        <div className="max-w-6xl mx-auto min-h-[80vh] relative space-y-5">
            <div className="fixed top-20 left-10 w-[500px] h-[500px] bg-primary/40 blur-[200px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-primary/40 blur-[200px] rounded-full pointer-events-none"></div>
            <div className="flex justify-left w-full">
                <Breadcrumb items={items} />
            </div>
            {/* 1. Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        Courses
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Create, manage, and publish your educational content.
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/admin/course/create')}
                    className="gap-2 shadow-lg shadow-primary/20 h-11 px-6"
                >
                    <Plus size={18} />
                    New Course
                </Button>
            </div>

            {/* 2. Controls Section (Search & Tabs) */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card/50 p-4 rounded-xl border border-border shadow-sm">
                {/* Search Bar */}
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-foreground"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex p-1 bg-background border border-border rounded-lg w-full sm:w-auto">
                    {['all', 'published', 'draft'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => {
                                setStatusFilter(tab as any);
                                setPage(1);
                            }}
                            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                                statusFilter === tab
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Grid Section */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p>Loading your courses...</p>
                </div>
            ) : isError ? (
                <div className="text-center py-24 text-destructive">
                    Failed to load courses. Please try again.
                </div>
            ) : data?.data?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-2xl bg-card/30">
                    <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">No courses found</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mt-1">
                        Get started by creating your first course, or adjust
                        your search filters.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data?.data.map(course => (
                            <div
                                key={course.id}
                                className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/50 transition-all duration-300"
                            >
                                {/* Card Image / Thumbnail Placeholder */}
                                <div className="h-32 bg-secondary/50 relative overflow-hidden flex items-center justify-center">
                                    {/* You can replace this with an actual <img src={course.thumbnail} /> later */}
                                    <BookOpen className="h-10 w-10 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />

                                    {/* Status Badge overlay */}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        {course.status === 'published' ? (
                                            <span className="flex items-center gap-1 bg-green-500/90 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                                                <Eye size={12} /> Published
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 bg-amber-500/90 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                                                <EyeOff size={12} /> Draft
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg text-foreground line-clamp-1 mb-1">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">
                                        {course.description ||
                                            'No description provided.'}
                                    </p>

                                    {/* Footer Info */}
                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <div className="flex items-center gap-1 text-sm font-semibold">
                                            {course.type === 'free' ? (
                                                <span className="text-green-500">
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

                                        {/* Action Button */}
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-8 px-3 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() =>
                                                navigate(
                                                    `/admin/course/${course.id}/edit`
                                                )
                                            }
                                        >
                                            <Edit3 size={14} /> Edit
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Placeholder (You can plug in your standard Shadcn Pagination component here) */}
                    {data && data.meta && data.meta.lastPage > 1 && (
                        <div className="flex justify-center pt-8">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-4 text-sm font-medium">
                                    Page {page} of {data.meta.lastPage}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={page === data.meta.lastPage}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
