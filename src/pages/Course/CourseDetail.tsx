import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequest } from '@/utils/request';
import { showToast } from '@/utils/toast'; // Assuming you have this from earlier
import { Button } from '@/components/ui/button';
import {
    Star,
    IndianRupee,
    Clock,
    BookOpen,
    Award,
    MonitorPlay,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    FileText,
    HelpCircle,
    PlayCircle,
    ArrowLeft,
    Loader2,
} from 'lucide-react';

// --- Interfaces ---
interface Section {
    id: string;
    title: string;
    type?: 'ordinary' | 'mcq';
}

interface Chapter {
    id: string;
    title: string;
    sections: Section[];
}

interface Course {
    id: string;
    title: string;
    description: string;
    type: 'free' | 'paid';
    amount: number;
    duration: number; // in minutes or hours depending on your logic
    tags: string[];
    rating: number;
    instructors: any[];
    curriculumTree: Chapter[];
    thumbnail?: string;
    isEnrolled?: boolean;
    enrollment?: {
        id: string;
        progress: number;
    };
}

export const CourseDetail = () => {
    const { courseId: id } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const request = useRequest();
    const queryClient = useQueryClient();

    // State for syllabus accordion
    const [expandedChapters, setExpandedChapters] = useState<
        Record<string, boolean>
    >({});

    // --- API: Fetch Single Course ---
    const {
        data: course,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['course-detail', id],
        queryFn: async () => {
            const res = await request.get(`/course/${id}`);
            return res.data as Course;
        },
        enabled: !!id,
    });

    // --- API: Enroll Mutation ---
    const enrollMutation = useMutation({
        mutationFn: async () => {
            const res = await request.post(`/course/${id}/enroll`, {});
            return res.data;
        },
        onSuccess: () => {
            showToast({
                title: 'Success!',
                description: 'You are now enrolled in the course.',
            });
            // Force the course details to refetch so the button changes to "Go to Course"
            queryClient.invalidateQueries({ queryKey: ['course-detail', id] });

            // Optional: You could also instantly redirect them to the player
            // navigate(`/learn/${id}`);
        },
        onError: (error: any) => {
            const errorMsg =
                error?.response?.data?.message ||
                'Failed to enroll. Please try again.';
            showToast({
                title: 'Enrollment Failed',
                description: errorMsg,
                variant: 'destructive',
            });
        },
    });

    const toggleChapter = (chapterId: string) => {
        setExpandedChapters(prev => ({
            ...prev,
            [chapterId]: !prev[chapterId],
        }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground animate-pulse">
                    Loading course details...
                </p>
            </div>
        );
    }

    if (isError || !course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-destructive/20 rounded-full blur-[100px]"></div>
                </div>
                <div className="relative z-10 text-center p-10 bg-card/20 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                    <h2 className="text-2xl font-bold mb-2 text-foreground">
                        Course not found
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        The course you are looking for doesn't exist or has been
                        removed.
                    </p>
                    <Button
                        onClick={() => navigate('/courses')}
                        className="rounded-xl shadow-lg"
                    >
                        Browse Catalog
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden pb-24">
            {/* --- UPGRADED AMBIENT GLASS BACKGROUND --- */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-60">
                {/* Richer, wider orbs for better refraction */}
                <div className="absolute -top-[10%] right-[0%] w-[700px] h-[700px] bg-primary/20 rounded-full blur-[140px]"></div>
                <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] right-[20%] w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[150px]"></div>
            </div>

            {/* --- TOP NAVIGATION --- */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    to="/courses"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-all px-4 py-2 bg-card/20 backdrop-blur-md border border-white/5 rounded-full shadow-sm hover:bg-card/40"
                >
                    <ArrowLeft size={16} className="mr-2" /> Back to Catalog
                </Link>
            </div>

            {/* --- HERO SECTION --- */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Hero Content & Syllabus */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-12">
                        {/* Title & Meta */}
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                {course.tags?.slice(0, 3).map((tag, i) => (
                                    <span
                                        key={i}
                                        className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-[1.15] drop-shadow-sm">
                                {course.title}
                            </h1>

                            <p className="text-lg sm:text-xl text-muted-foreground/90 leading-relaxed font-medium">
                                {course.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/10 dark:border-white/5">
                                <div className="flex items-center gap-2 bg-amber-500/10 backdrop-blur-md border border-amber-500/20 px-3 py-1.5 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                                    <Star
                                        className="text-amber-500 fill-amber-500"
                                        size={18}
                                    />
                                    <span className="font-bold text-amber-500">
                                        {course.rating || '4.8'}
                                    </span>
                                    <span className="text-amber-500/70 text-sm font-medium">
                                        (1,204 ratings)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground bg-card/30 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                                    <BookOpen size={16} />
                                    <span className="text-sm font-semibold text-foreground">
                                        {course.curriculumTree?.length || 0}{' '}
                                        Chapters
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* What You'll Learn (Premium Glass Box) */}
                        <div className="bg-gradient-to-br from-card/40 to-card/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] group-hover:bg-primary/10 transition-colors duration-700"></div>

                            <h3 className="text-2xl font-bold mb-8 relative z-10 text-foreground">
                                What you'll learn
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 relative z-10">
                                {[
                                    'Master the core concepts from scratch',
                                    'Build real-world, production-ready projects',
                                    'Learn industry best practices',
                                    'Prepare for technical interviews',
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-4 group/item"
                                    >
                                        <div className="bg-green-500/10 p-1.5 rounded-full border border-green-500/20 mt-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                                            <CheckCircle2
                                                className="text-green-500"
                                                size={16}
                                            />
                                        </div>
                                        <span className="text-sm sm:text-base font-medium text-muted-foreground group-hover/item:text-foreground transition-colors">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Curriculum Tree */}
                        <div className="space-y-8">
                            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                Course Syllabus
                            </h3>

                            {!course.curriculumTree ||
                            course.curriculumTree.length === 0 ? (
                                <div className="p-12 text-center bg-card/20 backdrop-blur-md border border-dashed border-white/20 rounded-[2rem] text-muted-foreground">
                                    Curriculum is currently being updated.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {course.curriculumTree.map(
                                        (chapter, index) => {
                                            const isExpanded =
                                                expandedChapters[chapter.id];
                                            return (
                                                <div
                                                    key={chapter.id}
                                                    className="bg-gradient-to-b from-card/40 to-card/20 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[1.5rem] overflow-hidden transition-all shadow-[0_4px_24px_rgba(0,0,0,0.06)] relative before:absolute before:inset-0 before:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] before:pointer-events-none"
                                                >
                                                    <button
                                                        onClick={() =>
                                                            toggleChapter(
                                                                chapter.id
                                                            )
                                                        }
                                                        className="w-full px-6 sm:px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-5 text-left">
                                                            <div className="w-10 h-10 rounded-full bg-secondary/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-all">
                                                                {index + 1}
                                                            </div>
                                                            <span className="font-bold text-lg text-foreground">
                                                                {chapter.title}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 sm:flex">
                                                            <span className="text-sm font-semibold text-muted-foreground/80 bg-background/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
                                                                {chapter
                                                                    .sections
                                                                    ?.length ||
                                                                    0}{' '}
                                                                lessons
                                                            </span>
                                                            <div
                                                                className={`p-2 rounded-full border transition-all ${
                                                                    isExpanded
                                                                        ? 'bg-primary/10 border-primary/30 text-primary'
                                                                        : 'border-white/10 text-muted-foreground group-hover:border-white/20'
                                                                }`}
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronUp
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <ChevronDown
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>

                                                    {/* Expanded Sections (Deeper glass look) */}
                                                    {isExpanded &&
                                                        chapter.sections &&
                                                        chapter.sections
                                                            .length > 0 && (
                                                            <div className="border-t border-white/5 bg-black/5 dark:bg-black/20 backdrop-blur-2xl">
                                                                {chapter.sections.map(
                                                                    (
                                                                        section,
                                                                        sIdx
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                section.id
                                                                            }
                                                                            className="px-6 sm:px-8 py-5 flex items-center justify-between hover:bg-white/5 transition-colors group/sec border-b border-white/5 last:border-0 relative before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-primary before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                                                                        >
                                                                            <div className="flex items-center gap-4 pl-2">
                                                                                <div className="p-2 rounded-lg bg-card/50 backdrop-blur-md border border-white/10 shadow-sm">
                                                                                    {section.type ===
                                                                                    'mcq' ? (
                                                                                        <HelpCircle
                                                                                            size={
                                                                                                16
                                                                                            }
                                                                                            className="text-amber-500"
                                                                                        />
                                                                                    ) : (
                                                                                        <PlayCircle
                                                                                            size={
                                                                                                16
                                                                                            }
                                                                                            className="text-primary"
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-sm sm:text-base font-semibold text-muted-foreground group-hover/sec:text-foreground transition-colors">
                                                                                    {
                                                                                        section.title
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-xs font-bold text-primary opacity-0 group-hover/sec:opacity-100 transition-opacity uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
                                                                                Preview
                                                                            </span>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sticky Enrollment Card */}
                    <div className="lg:col-span-5 xl:col-span-4 relative mt-8 lg:mt-0">
                        <div className="sticky top-10 bg-gradient-to-b from-card/60 to-card/30 backdrop-blur-3xl border border-white/20 p-6 sm:p-8 rounded-[2.5rem] relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

                            {/* Video Preview Mockup */}
                            <div className="w-full aspect-video bg-gradient-to-br from-secondary/80 to-background rounded-3xl mb-8 flex items-center justify-center relative overflow-hidden border border-white/10 group cursor-pointer shadow-inner">
                                <div className="absolute inset-0 bg-teal-600/20 group-hover:bg-black/10 transition-colors z-0"></div>
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50"></div>

                                <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-5 rounded-full text-primary transform group-hover:scale-110 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)] relative z-10 border border-white/50">
                                    <PlayCircle size={36} className="ml-1" />
                                </div>
                                <div className="absolute bottom-5 left-0 right-0 text-center text-white text-sm font-bold tracking-wide z-10 drop-shadow-md">
                                    Preview Course
                                </div>
                            </div>

                            {/* Price (Scaled Down) */}
                            <div className="mb-8 flex items-end gap-2 px-2">
                                {course.type === 'free' ? (
                                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 tracking-tight drop-shadow-sm">
                                        Free
                                    </span>
                                ) : (
                                    <>
                                        <IndianRupee
                                            size={32}
                                            className="text-foreground mb-1 opacity-80"
                                        />
                                        <span className="text-4xl font-black text-foreground tracking-tight drop-shadow-sm">
                                            {course.amount}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* CTA: Dynamic based on enrollment status */}
                            {course.isEnrolled ? (
                                <Button
                                    onClick={() =>
                                        navigate(`/course/${course.id}/learn`)
                                    }
                                    className="w-full h-16 text-lg font-bold rounded-2xl shadow-[0_10px_40px_rgba(var(--primary),0.3)] mb-5 hover:-translate-y-0.5 transition-transform bg-primary text-primary-foreground border border-primary-foreground/10"
                                >
                                    Go to Course
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => enrollMutation.mutate()}
                                    disabled={enrollMutation.isPending}
                                    className="w-full h-16 text-lg font-bold rounded-2xl shadow-[0_10px_40px_rgba(var(--primary),0.3)] mb-5 hover:-translate-y-0.5 transition-transform bg-primary text-primary-foreground border border-primary-foreground/10 flex items-center justify-center"
                                >
                                    {enrollMutation.isPending ? (
                                        <Loader2
                                            size={24}
                                            className="animate-spin"
                                        />
                                    ) : course.type === 'free' ? (
                                        'Enroll for Free'
                                    ) : (
                                        'Buy Now'
                                    )}
                                </Button>
                            )}

                            <p className="text-center text-xs font-medium text-muted-foreground mb-8">
                                30-Day Money-Back Guarantee
                            </p>

                            {/* Included List */}
                            <div className="space-y-5 pt-8 border-t border-white/10 px-2 relative before:absolute before:top-[-1px] before:left-[10%] before:right-[10%] before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent">
                                <h4 className="font-extrabold text-sm text-foreground">
                                    This course includes:
                                </h4>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                                        <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20 shadow-sm">
                                            <MonitorPlay
                                                size={16}
                                                className="text-primary"
                                            />
                                        </div>
                                        {course.duration || '24'} hours
                                        on-demand video
                                    </li>
                                    <li className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                                        <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20 shadow-sm">
                                            <FileText
                                                size={16}
                                                className="text-primary"
                                            />
                                        </div>
                                        12 downloadable resources
                                    </li>
                                    <li className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                                        <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20 shadow-sm">
                                            <Clock
                                                size={16}
                                                className="text-primary"
                                            />
                                        </div>
                                        Full lifetime access
                                    </li>
                                    <li className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                                        <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20 shadow-sm">
                                            <Award
                                                size={16}
                                                className="text-primary"
                                            />
                                        </div>
                                        Certificate of completion
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
