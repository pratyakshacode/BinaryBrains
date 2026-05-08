import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequest } from '@/utils/request';
import { Button } from '@/components/ui/button';
import {
    FileText,
    HelpCircle,
    PlayCircle,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    PanelRightClose,
    PanelRightOpen,
    Loader2,
    CheckCircle2,
    XCircle,
    ArrowRight,
} from 'lucide-react';

// --- Interfaces ---
interface Resource {
    id: string;
    resourceId?: string;
    title: string;
    resourceTitle?: string;
    type: 'article' | 'mcq' | 'video';
    resourceType?: 'article' | 'mcq' | 'video';
}

interface Section {
    id: string;
    title: string;
    resources?: Resource[];
}

interface Chapter {
    id: string;
    title: string;
    sections: Section[];
}

interface Course {
    id: string;
    title: string;
    curriculumTree: Chapter[];
    enrollment?: {
        progress: number;
        completedResources?: string[]; // 🔥 NEW: Array of completed IDs
    };
}

interface ActiveItem {
    sectionId: string;
    resourceId: string;
    type: string;
    title: string;
}

// Result interface for the server validation
interface ValidationResult {
    isCorrect: boolean;
    correctAnswers: string[];
    explanation?: string;
}

export const LearnWorkspace = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const request = useRequest();
    const queryClient = useQueryClient();

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedChapters, setExpandedChapters] = useState<
        Record<string, boolean>
    >({});
    const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);

    // --- MCQ Playground State ---
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [validationResult, setValidationResult] =
        useState<ValidationResult | null>(null);

    const { data: course, isLoading: isCourseLoading } = useQuery({
        queryKey: ['workspace-course', courseId],
        queryFn: async () => {
            const res = await request.get(`/course/${courseId}`);
            return res.data as Course;
        },
        enabled: !!courseId,
    });

    useEffect(() => {
        if (course?.curriculumTree && !activeItem) {
            const firstChapter = course.curriculumTree[0];
            const firstSection = firstChapter?.sections?.[0];
            const firstResource = firstSection?.resources?.[0];

            if (firstChapter) {
                setExpandedChapters({ [firstChapter.id]: true });
            }

            if (firstSection && firstResource) {
                const rId = firstResource.id || firstResource.resourceId || '';
                const rType =
                    firstResource.type ||
                    firstResource.resourceType ||
                    'article';
                const rTitle =
                    firstResource.title || firstResource.resourceTitle || '';

                if (rId) {
                    setActiveItem({
                        sectionId: firstSection.id,
                        resourceId: rId,
                        type: rType,
                        title: rTitle,
                    });
                }
            }
        }
    }, [course]);

    // Reset MCQ state when switching resources
    useEffect(() => {
        setSelectedOptions([]);
        setValidationResult(null);
    }, [activeItem?.resourceId]);

    const { data: resourceData, isLoading: isResourceLoading } = useQuery({
        queryKey: [
            'workspace-resource',
            courseId,
            activeItem?.sectionId,
            activeItem?.resourceId,
        ],
        queryFn: async () => {
            if (!activeItem) return null;

            const searchParams = new URLSearchParams({
                sectionId: activeItem.sectionId,
                type: activeItem.type,
                id: activeItem.resourceId,
            });

            const res = await request.get(
                `/course/${courseId}/resource?${searchParams.toString()}`
            );
            return res.data;
        },
        enabled: !!courseId && !!activeItem,
    });

    // --- Backend API: Validate MCQ Answer ---
    const validateMutation = useMutation({
        mutationFn: async (payload: { answer: string[] }) => {
            const res = await request.post(`/course/${courseId}/evaluate-mcq`, {
                sectionId: activeItem?.sectionId,
                resourceId: activeItem?.resourceId,
                userAnswers: payload.answer,
            });
            return res.data as ValidationResult;
        },
        onSuccess: data => {
            setValidationResult(data);
        },
    });

    // --- API: Update Progress ---
    const progressMutation = useMutation({
        mutationFn: async (resourceId: string) => {
            const res = await request.post(`course/${courseId}/progress`, {
                resourceId,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['workspace-course', courseId],
            });
        },
    });

    const handleNextLesson = () => {
        if (!activeItem) return;

        // 1. Mark the current item as complete
        progressMutation.mutate(activeItem.resourceId);

        // 2. Move the user to the next resource instantly
        if (nextResource) {
            handleSelectResource(nextResource.sectionId, nextResource.resource);
        }
    };

    // --- Flatten Curriculum for "Next Lesson" feature ---
    const nextResource = useMemo(() => {
        if (!course?.curriculumTree || !activeItem) return null;

        const flatResources: { sectionId: string; resource: Resource }[] = [];
        course.curriculumTree.forEach(chapter => {
            chapter.sections?.forEach(section => {
                section.resources?.forEach(res => {
                    flatResources.push({
                        sectionId: section.id,
                        resource: res,
                    });
                });
            });
        });

        const currentIndex = flatResources.findIndex(
            item =>
                (item.resource.id || item.resource.resourceId) ===
                activeItem.resourceId
        );

        if (currentIndex !== -1 && currentIndex < flatResources.length - 1) {
            return flatResources[currentIndex + 1];
        }
        return null;
    }, [course, activeItem]);

    const toggleChapter = (chapterId: string) => {
        setExpandedChapters(prev => ({
            ...prev,
            [chapterId]: !prev[chapterId],
        }));
        if (!sidebarOpen) setSidebarOpen(true);
    };

    const handleSelectResource = (sectionId: string, resource: Resource) => {
        const rId = resource.id || resource.resourceId || '';
        const rType = resource.type || resource.resourceType || 'article';
        const rTitle = resource.title || resource.resourceTitle || '';

        setActiveItem({
            sectionId,
            resourceId: rId,
            type: rType,
            title: rTitle,
        });

        if (window.innerWidth < 1024) setSidebarOpen(false);
    };

    // --- MCQ Handlers ---
    const handleOptionSelect = (opt: string, isMultiple: boolean) => {
        if (validationResult || validateMutation.isPending) return;

        if (isMultiple) {
            setSelectedOptions(prev =>
                prev.includes(opt)
                    ? prev.filter(o => o !== opt)
                    : [...prev, opt]
            );
        } else {
            setSelectedOptions([opt]);
        }
    };

    const handleSubmitMcq = () => {
        if (selectedOptions.length > 0) {
            validateMutation.mutate({ answer: selectedOptions });
        }
    };

    // --- Sub-Renderers for Content Types ---
    const renderContent = () => {
        if (isResourceLoading) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center h-full">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground font-medium">
                        Loading lesson content...
                    </p>
                </div>
            );
        }

        if (!resourceData || !resourceData.content) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center h-4/5 text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                        <FileText className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        No content selected
                    </h2>
                    <p className="text-muted-foreground max-w-sm">
                        Select a lesson from the curriculum sidebar to start
                        learning.
                    </p>
                </div>
            );
        }

        const { type, content } = resourceData;

        return (
            <div className="max-w-4xl mx-auto w-full pb-20">
                <div className="mb-8 border-b border-border pb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary text-secondary-foreground mb-4">
                        {type === 'mcq' ? (
                            <HelpCircle size={14} />
                        ) : type === 'video' ? (
                            <PlayCircle size={14} />
                        ) : (
                            <FileText size={14} />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {type}
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                        {activeItem?.title}
                    </h1>
                </div>

                {/* --- ARTICLE VIEW --- */}
                {type === 'article' && (
                    <>
                        <div className="prose prose-slate dark:prose-invert max-w-none text-foreground leading-relaxed mb-12">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html:
                                        content.body ||
                                        content.content ||
                                        '<i>No article content found.</i>',
                                }}
                            />
                        </div>
                        <div className="flex justify-end pt-6 border-t border-border">
                            <Button
                                onClick={handleNextLesson}
                                disabled={progressMutation.isPending}
                                className="gap-2 font-bold px-8"
                            >
                                <span className="text-primary-foreground">
                                    {progressMutation.isPending ? (
                                        <Loader2 className="animate-spin" />
                                    ) : nextResource ? (
                                        'Mark as Read & Continue'
                                    ) : (
                                        'Mark as Read'
                                    )}
                                </span>
                                {nextResource &&
                                    !progressMutation.isPending && (
                                        <ArrowRight
                                            size={16}
                                            className="text-primary-foreground"
                                        />
                                    )}
                            </Button>
                        </div>
                    </>
                )}

                {/* --- MCQ PLAYGROUND VIEW --- */}
                {type === 'mcq' &&
                    (() => {
                        const isMultiple =
                            content?.mcqType?.toLowerCase().includes('multi') ||
                            content?.type?.toLowerCase().includes('multi') ||
                            content?.isMultiple === true;

                        return (
                            <div className="bg-card border border-border rounded-xl p-6 sm:p-10 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <HelpCircle
                                                className="text-primary"
                                                size={20}
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">
                                            Knowledge Check
                                        </h3>
                                    </div>
                                    <div className="text-sm font-bold text-foreground bg-secondary px-4 py-1.5 rounded-full border border-border inline-flex w-fit">
                                        {isMultiple
                                            ? 'Multiple Selection'
                                            : 'Single Selection'}
                                    </div>
                                </div>

                                <p className="text-lg sm:text-xl font-semibold mb-8 text-foreground leading-relaxed">
                                    {content.question || content.questionText}
                                </p>

                                <div className="space-y-4 mb-10">
                                    {content.options?.map(
                                        (opt: string, i: number) => {
                                            const optionLetter =
                                                String.fromCharCode(65 + i); // A, B, C, D
                                            const isSelected =
                                                selectedOptions.includes(opt);
                                            const isCorrectOpt =
                                                validationResult?.correctAnswers?.includes(
                                                    opt
                                                );

                                            let btnClass =
                                                'w-full text-left px-4 sm:px-6 py-4 rounded-xl border-2 transition-all flex items-center gap-4 group ';
                                            let badgeClass =
                                                'w-8 h-8 rounded-md flex items-center justify-center shrink-0 font-bold text-sm transition-colors ';

                                            if (!validationResult) {
                                                btnClass += isSelected
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-transparent bg-secondary/50 hover:bg-secondary hover:border-border';

                                                badgeClass += isSelected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-background text-muted-foreground group-hover:text-foreground shadow-sm';
                                            } else {
                                                if (isCorrectOpt) {
                                                    btnClass +=
                                                        'border-green-500 bg-green-500/10 text-foreground';
                                                    badgeClass +=
                                                        'bg-green-500 text-white';
                                                } else if (
                                                    isSelected &&
                                                    !isCorrectOpt
                                                ) {
                                                    btnClass +=
                                                        'border-destructive bg-destructive/10 text-foreground';
                                                    badgeClass +=
                                                        'bg-destructive text-white';
                                                } else {
                                                    btnClass +=
                                                        'border-transparent bg-secondary/30 opacity-50 cursor-not-allowed text-muted-foreground';
                                                    badgeClass +=
                                                        'bg-background text-muted-foreground opacity-50';
                                                }
                                            }

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() =>
                                                        handleOptionSelect(
                                                            opt,
                                                            isMultiple
                                                        )
                                                    }
                                                    disabled={
                                                        !!validationResult ||
                                                        validateMutation.isPending
                                                    }
                                                    className={btnClass}
                                                >
                                                    <div className={badgeClass}>
                                                        {optionLetter}
                                                    </div>

                                                    <span className="text-base font-medium text-foreground flex-1">
                                                        {opt}
                                                    </span>

                                                    {validationResult &&
                                                        isCorrectOpt && (
                                                            <CheckCircle2
                                                                className="text-green-500 shrink-0"
                                                                size={20}
                                                            />
                                                        )}
                                                    {validationResult &&
                                                        isSelected &&
                                                        !isCorrectOpt && (
                                                            <XCircle
                                                                className="text-destructive shrink-0"
                                                                size={20}
                                                            />
                                                        )}
                                                </button>
                                            );
                                        }
                                    )}
                                </div>

                                {validationResult?.explanation && (
                                    <div
                                        className={`p-5 rounded-xl mb-8 border ${
                                            validationResult.isCorrect
                                                ? 'bg-green-500/10 border-green-500/20'
                                                : 'bg-destructive/10 border-destructive/20'
                                        }`}
                                    >
                                        <h4 className="font-bold text-sm uppercase text-foreground tracking-wider mb-2 flex items-center gap-2">
                                            <FileText size={16} /> Explanation
                                        </h4>
                                        <p className="text-sm text-foreground leading-relaxed">
                                            {validationResult.explanation}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-6 border-t border-border">
                                    <div className="flex-1">
                                        {validationResult && (
                                            <div
                                                className={`flex items-center gap-2 ${
                                                    validationResult.isCorrect
                                                        ? 'text-green-600 dark:text-green-500'
                                                        : 'text-destructive'
                                                }`}
                                            >
                                                {validationResult.isCorrect ? (
                                                    <CheckCircle2 size={24} />
                                                ) : (
                                                    <XCircle size={24} />
                                                )}
                                                <span className="font-bold text-lg text-foreground">
                                                    {validationResult.isCorrect
                                                        ? 'Great job!'
                                                        : 'Not quite right.'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {!validationResult ? (
                                        <Button
                                            onClick={handleSubmitMcq}
                                            disabled={
                                                selectedOptions.length === 0 ||
                                                validateMutation.isPending
                                            }
                                            className="px-8 font-bold h-12"
                                        >
                                            <span className="text-primary-foreground">
                                                {validateMutation.isPending ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : (
                                                    'Submit Answer'
                                                )}
                                            </span>
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleNextLesson}
                                            disabled={
                                                progressMutation.isPending
                                            }
                                            className="px-8 font-bold h-12 gap-2"
                                        >
                                            <span className="text-primary-foreground">
                                                {progressMutation.isPending ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : nextResource ? (
                                                    'Continue'
                                                ) : (
                                                    'Finish'
                                                )}
                                            </span>
                                            {nextResource &&
                                                !progressMutation.isPending && (
                                                    <ArrowRight
                                                        size={18}
                                                        className="text-primary-foreground"
                                                    />
                                                )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
            </div>
        );
    };

    if (isCourseLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden w-full lg:w-5/6 mx-auto border border-t-0 border-b-0 shadow-2xl">
            {/* --- TOP NAVBAR --- */}
            <header className="h-[70px] shrink-0 bg-background border-b border-border flex items-center justify-between px-6 z-30 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/course/${courseId}`)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-secondary"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-[1px] h-6 bg-border hidden sm:block"></div>
                    <h2 className="font-bold text-foreground text-base sm:text-lg tracking-tight line-clamp-1">
                        {course?.title || 'Course Workspace'}
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-full border border-border">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Progress
                        </span>
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{
                                    width: `${
                                        course?.enrollment?.progress || 0
                                    }%`,
                                }}
                            ></div>
                        </div>
                        <span className="text-xs font-bold text-foreground">
                            {course?.enrollment?.progress || 0}%
                        </span>
                    </div>

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hidden lg:flex items-center gap-2 p-2 px-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors border border-border"
                    >
                        {sidebarOpen ? (
                            <PanelRightClose size={18} />
                        ) : (
                            <PanelRightOpen size={18} />
                        )}
                        <span className="text-foreground">
                            {sidebarOpen
                                ? 'Hide Curriculum'
                                : 'Show Curriculum'}
                        </span>
                    </button>

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary border border-border"
                    >
                        {sidebarOpen ? (
                            <PanelRightClose size={20} />
                        ) : (
                            <PanelRightOpen size={20} />
                        )}
                    </button>
                </div>
            </header>

            {/* --- MAIN LAYOUT --- */}
            <div className="flex-1 flex overflow-hidden bg-muted/10">
                {/* LEFT: Content Area */}
                <main className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-12 custom-scrollbar bg-background transition-all duration-300">
                    {renderContent()}
                </main>

                {/* RIGHT: Curriculum Sidebar */}
                <aside
                    className={`
                        absolute lg:relative right-0 top-0 h-full bg-background border-l border-border shrink-0 z-40 transition-all duration-300 ease-in-out flex flex-col shadow-xl lg:shadow-none
                        ${
                            sidebarOpen
                                ? 'w-80 lg:w-[380px] translate-x-0'
                                : 'w-0 lg:w-[80px] translate-x-full lg:translate-x-0 overflow-x-hidden'
                        }
                    `}
                >
                    <div
                        className={`p-5 border-b border-border shrink-0 flex items-center bg-card transition-all ${
                            sidebarOpen ? 'justify-between' : 'justify-center'
                        }`}
                    >
                        <h3
                            className={`font-bold text-base text-foreground whitespace-nowrap overflow-hidden transition-all duration-300 ${
                                sidebarOpen
                                    ? 'opacity-100 w-auto'
                                    : 'opacity-0 w-0'
                            }`}
                        >
                            Course Content
                        </h3>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className={`lg:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors ${
                                sidebarOpen ? 'block' : 'hidden'
                            }`}
                        >
                            <PanelRightClose size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        {course?.curriculumTree?.map((chapter, cIdx) => (
                            <div
                                key={chapter.id}
                                className="border-b border-border bg-card"
                            >
                                <button
                                    onClick={() => toggleChapter(chapter.id)}
                                    className={`w-full flex items-center transition-colors text-left group ${
                                        sidebarOpen
                                            ? 'px-5 py-4 justify-between hover:bg-secondary/50'
                                            : 'p-4 justify-center hover:bg-secondary/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div
                                            className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${
                                                expandedChapters[chapter.id]
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-secondary text-muted-foreground group-hover:text-foreground'
                                            }`}
                                        >
                                            {cIdx + 1}
                                        </div>
                                        <div
                                            className={`whitespace-nowrap transition-all duration-300 ${
                                                sidebarOpen
                                                    ? 'opacity-100 w-auto'
                                                    : 'opacity-0 w-0 hidden'
                                            }`}
                                        >
                                            <div className="text-[11px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">
                                                Chapter {cIdx + 1}
                                            </div>
                                            <div className="text-sm font-bold text-foreground truncate max-w-[220px]">
                                                {chapter.title}
                                            </div>
                                        </div>
                                    </div>
                                    {sidebarOpen && (
                                        <div className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                                            {expandedChapters[chapter.id] ? (
                                                <ChevronUp size={18} />
                                            ) : (
                                                <ChevronDown size={18} />
                                            )}
                                        </div>
                                    )}
                                </button>

                                {expandedChapters[chapter.id] && (
                                    <div className="bg-background py-2">
                                        {chapter.sections?.map(section => (
                                            <div
                                                key={section.id}
                                                className="mb-2 last:mb-0"
                                            >
                                                <div
                                                    className={`py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/30 whitespace-nowrap overflow-hidden transition-all ${
                                                        sidebarOpen
                                                            ? 'px-5 opacity-100 block'
                                                            : 'px-0 opacity-0 hidden'
                                                    }`}
                                                >
                                                    {section.title}
                                                </div>

                                                <div>
                                                    {section.resources?.map(
                                                        (resource, rIdx) => {
                                                            const rId =
                                                                resource.id ||
                                                                resource.resourceId ||
                                                                '';
                                                            const rType =
                                                                resource.type ||
                                                                resource.resourceType ||
                                                                'article';
                                                            const rTitle =
                                                                resource.title ||
                                                                resource.resourceTitle ||
                                                                '';

                                                            const isActive =
                                                                activeItem?.resourceId ===
                                                                rId;

                                                            // 🔥 NEW: Check if this exact resourceId is in the completed array
                                                            const isCompleted =
                                                                course?.enrollment?.completedResources?.includes(
                                                                    rId
                                                                );

                                                            return (
                                                                <button
                                                                    key={
                                                                        rId ||
                                                                        rIdx
                                                                    }
                                                                    onClick={() =>
                                                                        handleSelectResource(
                                                                            section.id,
                                                                            resource
                                                                        )
                                                                    }
                                                                    title={
                                                                        !sidebarOpen
                                                                            ? rTitle
                                                                            : undefined
                                                                    }
                                                                    className={`w-full py-3 flex items-center transition-all border-l-4 overflow-hidden ${
                                                                        sidebarOpen
                                                                            ? 'px-5 gap-3 justify-start'
                                                                            : 'px-0 justify-center'
                                                                    } ${
                                                                        isActive
                                                                            ? 'bg-primary/5 border-primary text-primary'
                                                                            : 'border-transparent hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                                                                    }`}
                                                                >
                                                                    <div className="shrink-0 flex justify-center w-6 relative">
                                                                        {rType ===
                                                                        'mcq' ? (
                                                                            <HelpCircle
                                                                                size={
                                                                                    18
                                                                                }
                                                                                className={
                                                                                    isActive
                                                                                        ? 'text-primary'
                                                                                        : 'text-muted-foreground'
                                                                                }
                                                                            />
                                                                        ) : rType ===
                                                                          'video' ? (
                                                                            <PlayCircle
                                                                                size={
                                                                                    18
                                                                                }
                                                                                className={
                                                                                    isActive
                                                                                        ? 'text-primary'
                                                                                        : 'text-muted-foreground'
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            <FileText
                                                                                size={
                                                                                    18
                                                                                }
                                                                                className={
                                                                                    isActive
                                                                                        ? 'text-primary'
                                                                                        : 'text-muted-foreground'
                                                                                }
                                                                            />
                                                                        )}

                                                                        {/* Show tiny green dot if sidebar is closed but completed */}
                                                                        {isCompleted &&
                                                                            !sidebarOpen && (
                                                                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 border border-background rounded-full"></div>
                                                                            )}
                                                                    </div>
                                                                    <span
                                                                        className={`text-sm text-foreground whitespace-nowrap truncate transition-all ${
                                                                            sidebarOpen
                                                                                ? 'opacity-100 w-auto flex-1 text-left'
                                                                                : 'opacity-0 w-0 hidden'
                                                                        } ${
                                                                            isActive
                                                                                ? 'font-bold'
                                                                                : 'font-medium'
                                                                        }`}
                                                                    >
                                                                        {rTitle}
                                                                    </span>

                                                                    {/* 🔥 NEW: Completed Checkmark logic */}
                                                                    {isCompleted &&
                                                                        sidebarOpen && (
                                                                            <div className="shrink-0 ml-auto">
                                                                                <CheckCircle2
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                    className="text-green-500"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                </button>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
};
