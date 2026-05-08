import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRequest } from '@/utils/request';
import { showToast } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    GripVertical,
    Plus,
    Save,
    FolderOpen,
    FileText,
    Loader2,
    Trash2,
    LayoutList,
    Edit3,
} from 'lucide-react';
import { SectionLibraryDrawer } from '@/components/CourseSection/SectionLibraryDrawer';
import { SectionEditorModal } from '@/components/CourseSection/SectionEditorModal';
import { SectionType } from '@/types/types';

// --- Interfaces ---
interface Section {
    id: string;
    title: string;
    type: SectionType;
    description: string;
}

interface Chapter {
    id: string;
    title: string;
    sections: Section[];
}

// --- Sub-Component: Sortable Section ---
const SortableSection = ({
    section,
    onRemove,
    onEdit,
}: {
    section: Section;
    onRemove: (id: string) => void;
    onEdit: (section: any) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-3 ml-8 mt-2 bg-background border border-border rounded-lg shadow-sm group"
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            >
                <GripVertical size={16} />
            </button>
            <FileText size={16} className="text-blue-500" />
            <span className="text-sm font-medium flex-1">{section.title}</span>

            {/* 🔥 NEW: Actions Container */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                <button
                    onClick={onEdit}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary"
                    title="Edit Section Content"
                >
                    <Edit3 size={16} />
                </button>
                <button
                    onClick={() => onRemove(section.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors rounded-md hover:bg-secondary"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

// --- Sub-Component: Sortable Chapter ---
const SortableChapter = ({
    chapter,
    children,
    onRemove,
    onAddSection,
}: {
    chapter: Chapter;
    children: React.ReactNode;
    onRemove: (id: string) => void;
    onAddSection: (chapterId: string) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: chapter.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="p-4 bg-card/50 backdrop-blur-sm border border-border rounded-xl shadow-sm"
        >
            <div className="flex items-center gap-3 group">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                >
                    <GripVertical size={20} />
                </button>
                <FolderOpen size={20} className="text-primary" />
                <span className="text-base font-bold flex-1">
                    {chapter.title}
                </span>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddSection(chapter.id)}
                        className="h-8 px-2 text-xs"
                    >
                        <Plus size={14} className="mr-1" /> Add Section
                    </Button>
                    <button
                        onClick={() => onRemove(chapter.id)}
                        className="text-muted-foreground hover:text-red-500 p-1"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Render nested sections here */}
            <div className="mt-2">
                <SortableContext
                    items={chapter.sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {children}
                </SortableContext>
            </div>
        </div>
    );
};

// --- Main Tab Component ---
export const CurriculumTab = ({
    courseId,
    initialData,
}: {
    courseId?: string;
    initialData?: any;
}) => {
    const request = useRequest();

    // Initialize state with existing curriculum or an empty array
    const [chapters, setChapters] = useState<Chapter[]>(
        initialData?.curriculumTree || []
    );
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
    const [editingSection, setEditingSection] = useState<Section | null>(null);

    // --- dnd-kit Sensors ---
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // 5px movement required to start dragging (prevents accidental drags when clicking)
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const openSectionDrawer = (chapterId: string) => {
        setActiveChapterId(chapterId);
        setIsDrawerOpen(true);
    };

    // This gets called by the Drawer when a user selects or creates a section
    const handleSectionSelected = (section: Section) => {
        if (!activeChapterId) return;

        setChapters(
            chapters.map(ch => {
                if (ch.id === activeChapterId) {
                    // Check to prevent adding the exact same section twice to one chapter
                    if (ch.sections.some(s => s.id === section.id)) {
                        showToast({
                            title: 'Already Added',
                            description:
                                'This section is already in this chapter.',
                            variant: 'destructive',
                        });
                        return ch;
                    }
                    return { ...ch, sections: [...ch.sections, section] };
                }
                return ch;
            })
        );

        setIsDrawerOpen(false);
    };

    // --- API Mutation ---
    const saveCurriculumMutation = useMutation({
        mutationFn: async (curriculumTree: Chapter[]) => {
            const res = await request.put(
                `/admin/course/${courseId}/curriculum`,
                { curriculumTree }
            );
            return res.data;
        },
        onSuccess: () => {
            showToast({
                title: 'Curriculum Saved',
                description: 'The course structure has been updated.',
                duration: 3000,
            });
        },
        onError: () => {
            showToast({
                title: 'Error',
                description: 'Failed to save curriculum.',
                variant: 'destructive',
            });
        },
    });

    // --- Drag Handlers ---
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            // 1. Check if the dragged item is a CHAPTER
            const isChapter = chapters.some(ch => ch.id === active.id);

            if (isChapter) {
                setChapters(items => {
                    const oldIndex = items.findIndex(
                        item => item.id === active.id
                    );
                    const newIndex = items.findIndex(
                        item => item.id === over.id
                    );
                    return arrayMove(items, oldIndex, newIndex);
                });
                return;
            }

            // 2. If not a chapter, it must be a SECTION!
            // Find which chapter this section currently lives in
            let sourceChapterId: string | null = null;
            chapters.forEach(ch => {
                if (ch.sections.some(s => s.id === active.id)) {
                    sourceChapterId = ch.id;
                }
            });

            if (sourceChapterId) {
                setChapters(items =>
                    items.map(ch => {
                        if (ch.id === sourceChapterId) {
                            const oldIndex = ch.sections.findIndex(
                                s => s.id === active.id
                            );
                            const newIndex = ch.sections.findIndex(
                                s => s.id === over.id
                            );
                            return {
                                ...ch,
                                sections: arrayMove(
                                    ch.sections,
                                    oldIndex,
                                    newIndex
                                ),
                            };
                        }
                        return ch;
                    })
                );
            }
        }
    };

    // --- Mock Data Generators (Replace with modals later) ---
    const handleAddChapter = () => {
        const newChapter: Chapter = {
            id: `chapter-${Date.now()}`,
            title: `New Chapter ${chapters.length + 1}`,
            sections: [],
        };
        setChapters([...chapters, newChapter]);
    };

    const handleRemoveChapter = (id: string) =>
        setChapters(chapters.filter(ch => ch.id !== id));

    const handleRemoveSection = (chapterId: string, sectionId: string) => {
        setChapters(
            chapters.map(ch => {
                if (ch.id === chapterId) {
                    return {
                        ...ch,
                        sections: ch.sections.filter(
                            sec => sec.id !== sectionId
                        ),
                    };
                }
                return ch;
            })
        );
    };

    // --- Render ---
    if (!courseId) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground">
                    Save details first
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    You must create the course draft before building the
                    curriculum.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionLibraryDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onSelect={handleSectionSelected}
                chapterId={activeChapterId}
            />
            <SectionEditorModal
                isOpen={!!editingSection}
                section={editingSection as Section}
                onClose={() => setEditingSection(null)}
            />
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">
                        Course Curriculum
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Drag and drop to arrange your syllabus.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleAddChapter}
                        className="gap-2"
                    >
                        <Plus size={16} /> Add Chapter
                    </Button>
                    <Button
                        onClick={() => saveCurriculumMutation.mutate(chapters)}
                        disabled={saveCurriculumMutation.isPending}
                        className="gap-2 shadow-md shadow-primary/20"
                    >
                        {saveCurriculumMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        Save Layout
                    </Button>
                </div>
            </div>

            {/* dnd-kit Context */}
            <div className="bg-secondary/30 rounded-2xl p-6 min-h-[400px]">
                {chapters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-60 pt-20">
                        <LayoutList
                            size={40}
                            className="mb-4 text-muted-foreground"
                        />
                        <p className="text-sm font-medium">
                            Your curriculum is empty.
                        </p>
                        <p className="text-xs mt-1">
                            Click "Add Chapter" to get started.
                        </p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={chapters.map(ch => ch.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {chapters.map(chapter => (
                                    <SortableChapter
                                        key={chapter.id}
                                        chapter={chapter}
                                        onRemove={handleRemoveChapter}
                                        onAddSection={openSectionDrawer}
                                    >
                                        {/* Nested Sections (Currently rendering visually, future iteration can add nested SortableContext here) */}
                                        {chapter.sections.map(section => (
                                            <SortableSection
                                                key={section.id}
                                                section={section}
                                                onRemove={secId =>
                                                    handleRemoveSection(
                                                        chapter.id,
                                                        secId
                                                    )
                                                }
                                                onEdit={() =>
                                                    setEditingSection(section)
                                                }
                                            />
                                        ))}
                                    </SortableChapter>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
};
