import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRequest } from '@/utils/request';
import { showToast } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/Modal/Modal';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverEvent,
    DragEndEvent,
    DragStartEvent,
    useDroppable, // 🔥 NEW: Required to drop into empty lists
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
    Video,
    FileText,
    Loader2,
    GripVertical,
    Search,
    HelpCircle,
    Filter,
} from 'lucide-react';

// --- Interfaces ---
interface Section {
    id: string;
    title: string;
    type: 'ordinary' | 'mcq';
}

interface Resource {
    id: string;
    title: string;
    type: 'video' | 'article' | 'mcq';
    duration?: string;
}

interface SectionEditorModalProps {
    isOpen: boolean;
    section: Section | null;
    onClose: () => void;
}

// 🔥 NEW: Wrapper to ensure empty areas act as drop zones
const DroppableContainer = ({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) => {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className="min-h-[150px] h-full flex flex-col">
            {children}
        </div>
    );
};

// --- Sub-Component: Sortable Resource Card ---
const SortableResourceItem = ({
    resource,
    containerId,
}: {
    resource: Resource;
    containerId: string;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: resource.id,
        data: { containerId },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-3 mb-2 border border-border rounded-xl bg-background hover:border-primary/50 transition-colors group shadow-sm"
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground focus:outline-none"
            >
                <GripVertical size={16} />
            </button>
            {resource.type === 'video' ? (
                <Video size={16} className="text-purple-500 shrink-0" />
            ) : resource.type === 'mcq' ? (
                <HelpCircle size={16} className="text-amber-500 shrink-0" />
            ) : (
                <FileText size={16} className="text-rose-500 shrink-0" />
            )}
            <div className="flex flex-col min-w-0">
                {/* Applied text-foreground */}
                <span className="text-sm font-medium truncate text-foreground">
                    {resource.title}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {resource.type}
                </span>
            </div>
        </div>
    );
};

export const SectionEditorModal = ({
    isOpen,
    section,
    onClose,
}: SectionEditorModalProps) => {
    const request = useRequest();

    // --- State ---
    const [linkedResources, setLinkedResources] = useState<Resource[]>([]);
    const [availableResources, setAvailableResources] = useState<Resource[]>(
        []
    );

    // Search & Filter State for Right Column
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const [resourceFilter, setResourceFilter] = useState<
        'video' | 'article' | 'mcq'
    >(section?.type === 'mcq' ? 'mcq' : 'video');

    useEffect(() => {
        if (section) {
            setResourceFilter(section.type === 'mcq' ? 'mcq' : 'video');
        }
    }, [section]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // --- API: Fetch Resources (Dual Columns) ---
    const { isLoading } = useQuery({
        queryKey: [
            'section-resources',
            section?.id,
            debouncedQuery,
            resourceFilter,
        ],
        queryFn: async () => {
            if (!section) return null;

            try {
                // 1. Fetch Left Column (Already Linked to Section)
                const linkedRes = await request.get(`/section/${section.id}`);
                const mappedLinked = linkedRes.data.resources.map((r: any) => ({
                    id: r.resourceId,
                    title: r.resourceTitle,
                    type: r.resourceType,
                }));

                const searchParams = new URLSearchParams();
                searchParams.set(
                    'type',
                    section.type === 'mcq' ? 'mcq' : resourceFilter
                );
                searchParams.set('sectionId', section.id);
                searchParams.set('query', debouncedQuery);

                // 2. Fetch Right Column (Available from Library)
                const availableRes = await request.get(
                    `resources?${searchParams}`
                );

                setLinkedResources(mappedLinked);
                setAvailableResources(availableRes.data || []);
                return true;
            } catch (error) {
                console.error('Failed to load resources:', error);
                showToast({
                    title: 'Error',
                    description: 'Could not load resources.',
                    variant: 'destructive',
                });
                return false;
            }
        },
        enabled: isOpen && !!section?.id,
    });

    // --- API: Save Final Layout ---
    const saveMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await request.put(
                `section/${section?.id}/resources`,
                payload
            );
            return res.data;
        },
        onSuccess: () => {
            showToast({
                title: 'Layout Saved',
                description: 'Section resources have been updated.',
            });
            onClose();
        },
        onError: () => {
            showToast({
                title: 'Error',
                description: 'Failed to save layout.',
                variant: 'destructive',
            });
        },
    });

    const handleSaveLayout = () => {
        const payload = {
            resources: linkedResources.map(res => ({
                resourceId: res.id,
                resourceTitle: res.title,
                resourceType: res.type,
            })),
        };
        saveMutation.mutate(payload);
    };

    // --- dnd-kit Sensors & Handlers ---
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        console.log('Drag Started:', event);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeContainer =
            active.data.current?.sortable?.containerId ||
            (linkedResources.find(x => x.id === active.id)
                ? 'linked'
                : 'available');
        // Resolves to 'linked' or 'available' perfectly when hovering over the empty DroppableContainer
        const overContainer =
            over.data.current?.sortable?.containerId || over.id;

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        )
            return;

        if (activeContainer === 'available' && overContainer === 'linked') {
            const item = availableResources.find(x => x.id === active.id);
            if (item) {
                setAvailableResources(prev =>
                    prev.filter(x => x.id !== active.id)
                );
                setLinkedResources(prev => [...prev, item]);
            }
        } else if (
            activeContainer === 'linked' &&
            overContainer === 'available'
        ) {
            const item = linkedResources.find(x => x.id === active.id);
            if (item) {
                setLinkedResources(prev =>
                    prev.filter(x => x.id !== active.id)
                );
                setAvailableResources(prev => [...prev, item]);
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeContainer = linkedResources.find(x => x.id === active.id)
            ? 'linked'
            : 'available';
        const overContainer = linkedResources.find(x => x.id === over.id)
            ? 'linked'
            : 'available';

        if (activeContainer === overContainer) {
            const currentList =
                activeContainer === 'linked'
                    ? linkedResources
                    : availableResources;
            const setList =
                activeContainer === 'linked'
                    ? setLinkedResources
                    : setAvailableResources;

            const oldIndex = currentList.findIndex(
                item => item.id === active.id
            );
            const newIndex = currentList.findIndex(item => item.id === over.id);

            if (oldIndex !== newIndex) {
                setList(arrayMove(currentList, oldIndex, newIndex));
            }
        }
    };

    if (!section) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Manage Resources: ${section.title}`}
            maxWidth="max-w-5xl"
        >
            <div className="flex flex-col h-[65vh]">
                {isLoading &&
                !availableResources.length &&
                !linkedResources.length ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-primary w-8 h-8" />
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">
                            {/* LEFT COLUMN: Attached Resources */}
                            <div className="flex flex-col h-full bg-secondary/10 border border-border rounded-xl overflow-hidden relative">
                                <div className="p-4 border-b border-border bg-background flex items-center justify-between shrink-0">
                                    {/* Applied text-foreground */}
                                    <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>{' '}
                                        Attached to Section
                                    </h3>
                                    {/* Applied text-foreground */}
                                    <span className="text-xs font-medium bg-secondary text-foreground px-2 py-1 rounded-md">
                                        {linkedResources.length}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                    {/* 🔥 NEW: Droppable Wrapper handles the empty state intercepts */}
                                    <DroppableContainer id="linked">
                                        <SortableContext
                                            id="linked"
                                            items={linkedResources.map(
                                                r => r.id
                                            )}
                                            strategy={
                                                verticalListSortingStrategy
                                            }
                                        >
                                            <div className="min-h-[100px] h-full">
                                                {linkedResources.length ===
                                                0 ? (
                                                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground opacity-60">
                                                        <span className="text-foreground opacity-80">
                                                            Drag resources here
                                                        </span>
                                                    </div>
                                                ) : (
                                                    linkedResources.map(res => (
                                                        <SortableResourceItem
                                                            key={res.id}
                                                            resource={res}
                                                            containerId="linked"
                                                        />
                                                    ))
                                                )}
                                            </div>
                                        </SortableContext>
                                    </DroppableContainer>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Available Resources */}
                            <div className="flex flex-col h-full bg-secondary/10 border border-border rounded-xl overflow-hidden relative">
                                <div className="p-4 border-b border-border bg-background shrink-0 space-y-3">
                                    <div className="flex items-center justify-between">
                                        {/* Applied text-foreground */}
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>{' '}
                                            Global Library
                                        </h3>

                                        {section.type === 'ordinary' && (
                                            <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-2 py-1">
                                                <Filter
                                                    size={14}
                                                    className="text-muted-foreground"
                                                />
                                                <select
                                                    value={resourceFilter}
                                                    onChange={e =>
                                                        setResourceFilter(
                                                            e.target.value as
                                                                | 'video'
                                                                | 'article'
                                                                | 'mcq'
                                                        )
                                                    }
                                                    className="bg-transparent text-xs font-medium text-foreground outline-none cursor-pointer"
                                                >
                                                    <option
                                                        value="video"
                                                        className="text-foreground"
                                                    >
                                                        Videos
                                                    </option>
                                                    <option
                                                        value="article"
                                                        className="text-foreground"
                                                    >
                                                        Articles
                                                    </option>
                                                    <option
                                                        value="mcq"
                                                        className="text-foreground"
                                                    >
                                                        MCQs
                                                    </option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder={`Search ${
                                                section.type === 'mcq'
                                                    ? 'MCQs'
                                                    : resourceFilter + 's'
                                            }...`}
                                            value={searchQuery}
                                            onChange={e =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-xs focus:ring-2 focus:ring-primary/50 outline-none transition-all text-foreground"
                                        />
                                    </div>
                                </div>

                                {isLoading && (
                                    <div className="absolute inset-0 top-[104px] z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                                        <Loader2 className="animate-spin text-primary w-6 h-6" />
                                    </div>
                                )}

                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                    <DroppableContainer id="available">
                                        <SortableContext
                                            id="available"
                                            items={availableResources.map(
                                                r => r.id
                                            )}
                                            strategy={
                                                verticalListSortingStrategy
                                            }
                                        >
                                            <div className="min-h-[100px] h-full">
                                                {availableResources.length ===
                                                    0 && !isLoading ? (
                                                    <div className="text-center p-8 text-sm text-muted-foreground">
                                                        No resources match your
                                                        search.
                                                    </div>
                                                ) : (
                                                    availableResources.map(
                                                        res => (
                                                            <SortableResourceItem
                                                                key={res.id}
                                                                resource={res}
                                                                containerId="available"
                                                            />
                                                        )
                                                    )
                                                )}
                                            </div>
                                        </SortableContext>
                                    </DroppableContainer>
                                </div>
                            </div>
                        </div>
                    </DndContext>
                )}

                {/* Footer Actions */}
                <div className="pt-6 flex justify-end gap-3 shrink-0 mt-auto">
                    {/* Applied text-foreground to Cancel button */}
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={saveMutation.isPending}
                        className="text-foreground"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveLayout}
                        disabled={saveMutation.isPending}
                        className="shadow-md shadow-primary/20 gap-2"
                    >
                        {saveMutation.isPending && (
                            <Loader2 size={16} className="animate-spin" />
                        )}
                        <span className="text-primary-foreground">
                            Save Section Layout
                        </span>
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
