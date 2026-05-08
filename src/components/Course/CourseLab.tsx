import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    Users,
    ShieldUser,
    Settings,
    LayoutList,
    ChevronLeft,
    Loader2,
    PanelLeftClose,
    PanelLeftOpen,
    Lock,
    GraduationCap,
    AlertCircle,
} from 'lucide-react';
import { CourseDetailsTab } from '@/pages/Course/CourseDetailsTab';
import { useRequest } from '@/utils/request';
import { useQuery } from '@tanstack/react-query';
import { CurriculumTab } from '@/pages/Course/CurriculumTab';

const ModeratorsTab = () => (
    <div className="animate-in fade-in">
        <h2 className="text-2xl font-bold">Moderators</h2>
        <p className="text-muted-foreground">
            Assign instructors and TAs to this course.
        </p>
    </div>
);

const MembersTab = () => (
    <div className="animate-in fade-in">
        <h2 className="text-2xl font-bold">Members</h2>
        <p className="text-muted-foreground">Manage enrolled students.</p>
    </div>
);

const OptionsTab = () => (
    <div className="animate-in fade-in">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
            Configure pricing, tags, and publishing status.
        </p>
    </div>
);

// --- MAIN LAYOUT COMPONENT ---
export default function CourseLab() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const request = useRequest();

    const {
        data: courseData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['admin-course', courseId],
        queryFn: async () => {
            const res = await request.get(`/admin/course/${courseId}`);
            return res.data;
        },
        enabled: !!courseId, // Only run this fetch IF there is an ID in the URL
        staleTime: 0,
    });

    // Ensure isCreated is true if we successfully load course data
    useEffect(() => {
        if (courseData?.id) setIsCreated(true);
    }, [courseData]);

    // State Management
    const [activeTab, setActiveTab] = useState('details');
    const [isSaving, setIsSaving] = useState(false);
    const [isCreated, setIsCreated] = useState(!!courseId);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { id: 'details', label: 'Details', icon: BookOpen, requiresId: false },
        {
            id: 'curriculum',
            label: 'Curriculum',
            icon: LayoutList,
            requiresId: true,
        },
        {
            id: 'moderators',
            label: 'Moderators',
            icon: ShieldUser,
            requiresId: true,
        },
        { id: 'members', label: 'Members', icon: Users, requiresId: true },
        {
            id: 'options',
            label: 'Options & Pricing',
            icon: Settings,
            requiresId: true,
        },
    ];

    const handleSaveCourse = (newCourseId: string) => {
        // 1. Unlock the sidebar tabs!
        setIsCreated(true);

        // 2. Silently update the URL so if they refresh, they don't create a duplicate!
        // We use { replace: true } so we don't clutter their browser back-history.
        if (!courseId) {
            navigate(`/admin/course/${newCourseId}/edit`, { replace: true });
        }
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <CourseDetailsTab
                        isCreated={isCreated}
                        onSaveSuccess={handleSaveCourse}
                        initialData={courseData}
                        setIsSaving={setIsSaving}
                        courseId={courseId}
                    />
                );
            case 'curriculum':
                return (
                    <CurriculumTab
                        courseId={courseId}
                        initialData={courseData}
                    />
                );
            case 'moderators':
                return <ModeratorsTab />;
            case 'members':
                return <MembersTab />;
            case 'options':
                return <OptionsTab />;
            default:
                return (
                    <CourseDetailsTab
                        isCreated={isCreated}
                        onSaveSuccess={handleSaveCourse}
                        initialData={courseData}
                        setIsSaving={setIsSaving}
                        courseId={courseId}
                    />
                );
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="font-medium text-muted-foreground">
                    Loading course lab...
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h2 className="text-xl font-bold mb-2">Course Not Found</h2>
                <p className="text-muted-foreground mb-6">
                    The course you are trying to edit does not exist or was
                    deleted.
                </p>
                <Button onClick={() => navigate('/admin/courses')}>
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
            {/* LEFT SIDEBAR */}
            <aside
                className={`
                    border-r border-border bg-card/50 backdrop-blur-xl flex flex-col z-20 shrink-0 shadow-sm 
                    transition-all duration-300 ease-in-out
                    ${isCollapsed ? 'w-20' : 'w-64 sm:w-72'}
                `}
            >
                {/* 🔥 UPDATED: Sidebar Header with Toggle */}
                <div
                    className={`h-16 flex items-center border-b border-border transition-all duration-300 ${
                        isCollapsed ? 'justify-center' : 'justify-between px-4'
                    }`}
                >
                    {!isCollapsed && (
                        <div className="flex items-center gap-2 font-bold text-foreground animate-in fade-in">
                            <div className="w-8 h-8 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                                <GraduationCap size={18} />
                            </div>
                            <span className="tracking-tight">
                                {courseData?.title ?? 'Author new Course'}
                            </span>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-muted-foreground hover:text-foreground shrink-0"
                        title={
                            isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'
                        }
                    >
                        {isCollapsed ? (
                            <PanelLeftOpen size={20} />
                        ) : (
                            <PanelLeftClose size={20} />
                        )}
                    </Button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 overflow-x-hidden">
                    <button
                        onClick={() => navigate('/admin/courses')}
                        title={isCollapsed ? 'Back to Dashboard' : ''}
                        className={`
                            flex items-center rounded-lg text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground mb-4
                            ${
                                isCollapsed
                                    ? 'justify-center p-3 mx-auto w-12'
                                    : 'justify-start px-3 py-2.5 w-full gap-3'
                            }
                        `}
                    >
                        <ChevronLeft
                            size={isCollapsed ? 20 : 18}
                            className="shrink-0"
                        />
                        {!isCollapsed && (
                            <span className="whitespace-nowrap">
                                Back to Dashboard
                            </span>
                        )}
                    </button>

                    <div className="h-px w-full bg-border/50 my-2"></div>

                    {!isCollapsed && (
                        <p className="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 mt-4 animate-in fade-in">
                            Management
                        </p>
                    )}

                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isLocked = item.requiresId && !isCreated;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                disabled={isLocked}
                                onClick={() => setActiveTab(item.id)}
                                title={
                                    isCollapsed
                                        ? `${item.label} ${
                                              isLocked ? '(Locked)' : ''
                                          }`
                                        : ''
                                }
                                className={`
                                    flex items-center rounded-lg text-sm font-medium transition-all duration-200
                                    ${
                                        isCollapsed
                                            ? 'justify-center p-3 mx-auto w-12'
                                            : 'justify-start px-3 py-2.5 w-full gap-3'
                                    }
                                    ${
                                        isLocked
                                            ? 'opacity-40 cursor-not-allowed grayscale'
                                            : 'hover:bg-secondary cursor-pointer'
                                    }
                                    ${
                                        isActive && !isLocked
                                            ? 'bg-primary/10 text-primary hover:bg-primary/15 font-semibold'
                                            : 'text-foreground'
                                    }
                                `}
                            >
                                <div className="relative shrink-0">
                                    <Icon
                                        size={isCollapsed ? 20 : 18}
                                        className={
                                            isActive && !isLocked
                                                ? 'text-primary'
                                                : 'text-muted-foreground'
                                        }
                                    />
                                    {isLocked && isCollapsed && (
                                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-[1px]">
                                            <Lock
                                                size={10}
                                                className="text-muted-foreground"
                                            />
                                        </div>
                                    )}
                                </div>

                                {!isCollapsed && (
                                    <>
                                        <span className="whitespace-nowrap">
                                            {item.label}
                                        </span>
                                        {isLocked && (
                                            <span className="ml-auto text-[10px] uppercase tracking-wider bg-secondary px-2 py-0.5 rounded text-muted-foreground shrink-0">
                                                Locked
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col h-full bg-background relative overflow-y-auto min-w-0">
                {/* Top Toolbar */}
                <header className="h-16 border-b border-border flex items-center justify-between px-8 sticky top-0 bg-background/80 backdrop-blur-md z-10">
                    <h1 className="font-semibold text-lg line-clamp-1 my-3">
                        {isCreated ? 'Editing Course' : 'Drafting New Course'}
                    </h1>

                    {isCreated && (
                        <div className="flex items-center gap-3 shrink-0">
                            <span
                                className={`hidden sm:inline-block text-xs font-medium ${
                                    courseData?.status === 'draft'
                                        ? 'text-amber-500'
                                        : 'text-green-500'
                                } ${
                                    courseData?.status === 'draft'
                                        ? 'bg-amber-500/10'
                                        : 'bg-green-500/10'
                                } px-2.5 py-1 rounded-full border ${
                                    courseData?.status === 'draft'
                                        ? 'border-amber-500/20'
                                        : 'border-green-500/20'
                                }`}
                            >
                                {courseData?.status === 'draft'
                                    ? 'Draft'
                                    : 'Published'}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="shadow-sm"
                            >
                                Preview
                            </Button>
                        </div>
                    )}
                </header>

                {/* Tab Content Rendering */}
                <div className="p-4 sm:p-8 pb-24">
                    {isSaving && (
                        <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                            <div className="bg-card p-4 rounded-xl shadow-xl flex items-center gap-3 border border-border">
                                <Loader2
                                    className="animate-spin text-primary"
                                    size={24}
                                />
                                <span className="font-medium">
                                    Saving course...
                                </span>
                            </div>
                        </div>
                    )}

                    {renderActiveTab()}
                </div>
            </main>
        </div>
    );
}
