import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { showToast } from '@/utils/toast';
import {
    Trash2,
    Plus,
    CheckCircle2,
    Circle,
    ListPlus,
    Edit2,
    LockIcon,
    GlobeIcon,
    Loader2,
    ChevronDown,
    Search,
} from 'lucide-react';
import { useRequest } from '@/utils/request';
import { SectionType } from '@/types/types';
import { useDebounce } from 'use-debounce';
import { useQuery, useMutation } from '@tanstack/react-query'; // 🔥 React Query Imports
import {
    Breadcrumb,
    BreadcrumbItem,
} from '@/components/ui/BreadCrumb/BreadCrumb';

// Enums & Types
enum McqType {
    SINGLE_CHOICE = 'SINGLE_CHOICE',
    MULTI_SELECT = 'MULTI_SELECT',
    TRUE_FALSE = 'TRUE_FALSE',
}

enum SectionMode {
    NONE = 'NONE',
    EXISTING = 'EXISTING',
    NEW = 'NEW',
}

interface McqOption {
    id: string;
    text: string;
    isCorrect: boolean;
}
interface McqDraft {
    id: string;
    title: string;
    explanation: string;
    type: McqType;
    isPublic: boolean;
    options: McqOption[];
}
interface SectionResult {
    id: string;
    title: string;
}

const CreateMcqPage = () => {
    const navigate = useNavigate();
    const request = useRequest();

    // Editor & Batch State
    const [mcqBatch, setMcqBatch] = useState<McqDraft[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [explanation, setExplanation] = useState('');
    const [type, setType] = useState<McqType>(McqType.SINGLE_CHOICE);
    const [isPublic, setIsPublic] = useState(true);
    const [options, setOptions] = useState<McqOption[]>([
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
    ]);

    // Destination State
    const [sectionMode, setSectionMode] = useState<SectionMode>(
        SectionMode.NONE
    );

    // New Section State
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [newSectionDesc, setNewSectionDesc] = useState('');
    const [newSectionIsPublic, setNewSectionIsPublic] = useState(true); // 🔥 New Public Toggle for Sections

    // Searchable Dropdown State
    const [selectedSection, setSelectedSection] =
        useState<SectionResult | null>(null);
    const [sectionSearchTerm, setSectionSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(sectionSearchTerm, 500);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // ----------------------------------------------------------------
    // REACT QUERY: Data Fetching (Replaces useEffect)
    // ----------------------------------------------------------------
    const { data: existingSections = [], isFetching: isFetchingSections } =
        useQuery({
            queryKey: ['sections', debouncedSearchTerm],
            queryFn: async () => {
                const response = await request.get(
                    `/section?limit=10&page=1&title=${debouncedSearchTerm}`
                );
                return (
                    response?.data?.data?.records || response?.data?.data || []
                );
            },
            enabled: sectionMode === SectionMode.EXISTING, // Only runs if the dropdown is active
            staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        });

    // ----------------------------------------------------------------
    // REACT QUERY: Mutations (Replaces manual try/catch blocks)
    // ----------------------------------------------------------------
    const createSectionMutation = useMutation({
        mutationFn: (newSection: any) => request.post('/section', newSection),
    });

    const createMcqBatchMutation = useMutation({
        mutationFn: (formattedMcqs: any) =>
            request.post('/mcq', { mcqs: formattedMcqs }),
        onSuccess: () => {
            showToast({
                title: 'Success!',
                description: `Successfully published ${mcqBatch.length} questions.`,
                variant: 'default',
            });
            setMcqBatch([]);
            // navigate('/admin/dashboard');
        },
        onError: error => {
            console.error(error);
            showToast({
                title: 'Error',
                description: 'Failed to publish batch.',
                variant: 'destructive',
            });
        },
    });

    // ----------------------------------------------------------------
    // Editor Logic
    // ----------------------------------------------------------------
    const handleTypeChange = (newType: McqType) => {
        setType(newType);
        if (newType === McqType.TRUE_FALSE) {
            setOptions([
                { id: '1', text: 'True', isCorrect: false },
                { id: '2', text: 'False', isCorrect: false },
            ]);
        } else {
            setOptions([
                { id: '1', text: '', isCorrect: false },
                { id: '2', text: '', isCorrect: false },
            ]);
        }
    };

    const toggleCorrectAnswer = (targetId: string) => {
        setOptions(prev =>
            prev.map(opt => {
                if (opt.id === targetId)
                    return { ...opt, isCorrect: !opt.isCorrect };
                if (
                    type === McqType.SINGLE_CHOICE ||
                    type === McqType.TRUE_FALSE
                )
                    return { ...opt, isCorrect: false };
                return opt;
            })
        );
    };

    const addOption = () => {
        if (options.length >= 6)
            return showToast({
                description: 'Max 6 options allowed.',
                variant: 'destructive',
            });
        setOptions([
            ...options,
            { id: Date.now().toString(), text: '', isCorrect: false },
        ]);
    };

    const removeOption = (targetId: string) => {
        if (options.length <= 2)
            return showToast({
                description: 'At least 2 options required.',
                variant: 'destructive',
            });
        setOptions(options.filter(opt => opt.id !== targetId));
    };

    const resetEditor = () => {
        setTitle('');
        setExplanation('');
        handleTypeChange(McqType.SINGLE_CHOICE);
        setIsPublic(true);
        setEditingId(null);
    };

    const addToBatch = () => {
        if (!title.trim())
            return showToast({
                description: 'Question title is required.',
                variant: 'destructive',
            });
        if (!options.some(opt => opt.isCorrect))
            return showToast({
                description: 'Select at least one correct answer.',
                variant: 'destructive',
            });
        if (options.some(opt => !opt.text.trim()))
            return showToast({
                description: 'Fill in all option text fields.',
                variant: 'destructive',
            });

        const draft: McqDraft = {
            id: editingId || Date.now().toString(),
            title,
            explanation,
            type,
            isPublic,
            options,
        };

        if (editingId) {
            setMcqBatch(prev =>
                prev.map(q => (q.id === editingId ? draft : q))
            );
            showToast({ description: 'Question updated in batch.' });
        } else {
            setMcqBatch(prev => [...prev, draft]);
            showToast({ description: 'Question added to batch!' });
        }
        resetEditor();
    };

    const editFromBatch = (draft: McqDraft) => {
        setEditingId(draft.id);
        setTitle(draft.title);
        setExplanation(draft.explanation);
        setType(draft.type);
        setIsPublic(draft.isPublic);
        setOptions(draft.options);
    };

    const removeFromBatch = (id: string) => {
        setMcqBatch(prev => prev.filter(q => q.id !== id));
        if (editingId === id) resetEditor();
    };

    // ----------------------------------------------------------------
    // Master Submit Logic (Orchestrating Mutations)
    // ----------------------------------------------------------------
    const handlePublishAll = async () => {
        if (mcqBatch.length === 0)
            return showToast({
                description: 'Your batch is empty! Add a question first.',
                variant: 'destructive',
            });
        if (sectionMode === SectionMode.EXISTING && !selectedSection)
            return showToast({
                description: 'Please select an existing section.',
                variant: 'destructive',
            });
        if (sectionMode === SectionMode.NEW && !newSectionTitle.trim())
            return showToast({
                description: 'Please provide a title for the new section.',
                variant: 'destructive',
            });

        let finalSectionId = selectedSection?.id || null;

        // STEP 1: Create Section if needed
        if (sectionMode === SectionMode.NEW) {
            try {
                const sectionRes = await createSectionMutation.mutateAsync({
                    title: newSectionTitle,
                    description: newSectionDesc,
                    type: SectionType.MCQ,
                    isPublic: newSectionIsPublic, // 🔥 Passed the new state to backend
                });
                finalSectionId = sectionRes.data.id;
            } catch (error) {
                return showToast({
                    title: 'Error',
                    description: 'Failed to create new section.',
                    variant: 'destructive',
                });
            }
        }

        // STEP 2: Format and send MCQs
        const formattedMcqs = mcqBatch.map(q => ({
            title: q.title,
            explanation: q.explanation,
            type: q.type,
            isPublic: q.isPublic,
            options: q.options.map(o => o.text),
            correctAnswer: q.options.filter(o => o.isCorrect).map(o => o.text),
            sectionId: sectionMode !== SectionMode.NONE ? finalSectionId : null,
        }));

        createMcqBatchMutation.mutate(formattedMcqs);
    };

    const items: BreadcrumbItem[] = [
        { title: 'Home', url: '/' },
        { title: 'Admin', url: '/admin' },
        { title: "MCQ's", url: '/admin/mcq' },
        { title: 'Author', url: '/admin/mcq/create' },
    ];

    return (
        <div className="relative min-h-screen flex flex-col items-center py-4 px-2 overflow-hidden w-full">
            <div className="fixed top-20 left-10 w-[500px] h-[500px] bg-primary/50 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-primary/50 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="w-full flex justify-start max-w-6xl">
                <Breadcrumb items={items} />
            </div>
            <div className="relative z-10 w-full max-w-6xl space-y-8">
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                        Author MCQ's
                    </h1>
                    <p className="text-muted-foreground">
                        Draft multiple questions and assign them to a section
                        all at once.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Editor */}
                    <div className="lg:col-span-7 space-y-6 bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <h2 className="text-xl font-semibold text-foreground">
                                {editingId
                                    ? 'Editing Question'
                                    : 'Draft New Question'}
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">
                                    Public Question
                                </span>
                                <Switch
                                    checked={isPublic}
                                    onCheckedChange={setIsPublic}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground ml-1">
                                Question Title
                            </label>
                            <Textarea
                                placeholder="E.g., Which of the following is NOT a JavaScript framework?"
                                className="resize-none h-24 text-foreground bg-background border-input focus-visible:ring-primary text-lg"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-end">
                                <label className="text-sm font-medium text-foreground ml-1">
                                    Answer Options
                                </label>
                                <select
                                    className="bg-background border border-border text-foreground text-sm rounded-lg px-3 py-1.5 focus:ring-primary outline-none"
                                    value={type}
                                    onChange={e =>
                                        handleTypeChange(
                                            e.target.value as McqType
                                        )
                                    }
                                >
                                    <option value={McqType.SINGLE_CHOICE}>
                                        Single Choice
                                    </option>
                                    <option value={McqType.MULTI_SELECT}>
                                        Multi Select
                                    </option>
                                    <option value={McqType.TRUE_FALSE}>
                                        True / False
                                    </option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                {options.map((opt, index) => (
                                    <div
                                        key={opt.id}
                                        className="flex items-center gap-3"
                                    >
                                        <button
                                            onClick={() =>
                                                toggleCorrectAnswer(opt.id)
                                            }
                                            className={`p-1.5 rounded-full transition-colors ${
                                                opt.isCorrect
                                                    ? 'text-green-500 bg-green-500/10'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                            }`}
                                        >
                                            {opt.isCorrect ? (
                                                <CheckCircle2 size={24} />
                                            ) : (
                                                <Circle size={24} />
                                            )}
                                        </button>
                                        <Input
                                            value={opt.text}
                                            onChange={e =>
                                                setOptions(
                                                    options.map(o =>
                                                        o.id === opt.id
                                                            ? {
                                                                  ...o,
                                                                  text: e.target
                                                                      .value,
                                                              }
                                                            : o
                                                    )
                                                )
                                            }
                                            placeholder={`Option ${index + 1}`}
                                            disabled={
                                                type === McqType.TRUE_FALSE
                                            }
                                            className={`h-12 bg-background border-input flex-grow text-foreground ${
                                                opt.isCorrect
                                                    ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                                                    : ''
                                            }`}
                                        />
                                        {type !== McqType.TRUE_FALSE && (
                                            <button
                                                onClick={() =>
                                                    removeOption(opt.id)
                                                }
                                                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {type !== McqType.TRUE_FALSE &&
                                options.length < 6 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={addOption}
                                        className="mt-2 text-primary border-primary/20 hover:bg-primary/10 gap-2"
                                    >
                                        <Plus size={16} /> Add Option
                                    </Button>
                                )}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-border">
                            <label className="text-sm font-medium text-foreground ml-1">
                                Explanation (Optional)
                            </label>
                            <Textarea
                                placeholder="Explain why the correct answer is right."
                                className="resize-none h-20 bg-background text-foreground border-input focus-visible:ring-primary"
                                value={explanation}
                                onChange={e => setExplanation(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            {editingId && (
                                <Button
                                    variant="outline"
                                    onClick={resetEditor}
                                    className="w-1/3"
                                >
                                    Cancel Edit
                                </Button>
                            )}
                            <Button
                                onClick={addToBatch}
                                className="w-full gap-2 text-md font-semibold"
                            >
                                <ListPlus size={20} />
                                {editingId ? 'Update in Batch' : 'Add to Batch'}
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Queue & Destination */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* BATCH QUEUE */}
                        <div className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl flex flex-col max-h-[400px]">
                            <h3 className="font-semibold text-lg text-foreground border-b border-border pb-3 flex justify-between">
                                Question Batch{' '}
                                <span className="bg-primary/20 text-primary text-sm px-2 py-0.5 rounded-full">
                                    {mcqBatch.length}
                                </span>
                            </h3>
                            <div className="overflow-y-auto flex-grow pt-4 space-y-3 pr-2">
                                {mcqBatch.length === 0 ? (
                                    <p className="text-muted-foreground text-sm text-center py-10">
                                        Your batch is empty. Draft a question
                                        and add it here.
                                    </p>
                                ) : (
                                    mcqBatch.map((q, i) => (
                                        <div
                                            key={q.id}
                                            className="bg-background border border-border rounded-lg p-3 flex justify-between items-start gap-3 group transition-all hover:border-primary/50"
                                        >
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <p className="text-xs text-primary font-bold tracking-wide">
                                                        Q{i + 1} -{' '}
                                                        {q.type.replace(
                                                            '_',
                                                            ' '
                                                        )}
                                                    </p>
                                                    {q.isPublic ? (
                                                        <span className="flex items-center gap-1 text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-medium">
                                                            <GlobeIcon
                                                                size={10}
                                                            />{' '}
                                                            Public
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-[10px] bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full font-medium">
                                                            <LockIcon
                                                                size={10}
                                                            />{' '}
                                                            Private
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-foreground line-clamp-2 pr-2">
                                                    {q.title}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() =>
                                                        editFromBatch(q)
                                                    }
                                                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        removeFromBatch(q.id)
                                                    }
                                                    className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* SECTION DESTINATION */}
                        <div className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl space-y-5">
                            <h3 className="font-semibold text-lg text-foreground border-b border-border pb-3">
                                Destination
                            </h3>

                            <select
                                className="w-full h-12 bg-background border border-input text-foreground rounded-lg px-3 focus:ring-primary outline-none"
                                value={sectionMode}
                                onChange={e =>
                                    setSectionMode(
                                        e.target.value as SectionMode
                                    )
                                }
                            >
                                <option value={SectionMode.NONE}>
                                    Don't add to a section (Author only)
                                </option>
                                <option value={SectionMode.EXISTING}>
                                    Add to Existing Section
                                </option>
                                <option value={SectionMode.NEW}>
                                    Create a New Section
                                </option>
                            </select>

                            {/* 🔥 THE NEW SEARCHABLE COMBOBOX DROPDOWN */}
                            {sectionMode === SectionMode.EXISTING && (
                                <div className="relative animate-in fade-in">
                                    {/* The Trigger/Input */}
                                    <div
                                        className="flex items-center w-full h-12 bg-background border border-input rounded-lg px-3 cursor-text focus-within:ring-2 focus-within:ring-primary"
                                        onClick={() => setIsDropdownOpen(true)}
                                    >
                                        <Search className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
                                        <input
                                            type="text"
                                            className="w-full h-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                                            placeholder="Search and select section..."
                                            value={
                                                isDropdownOpen
                                                    ? sectionSearchTerm
                                                    : selectedSection?.title ||
                                                      ''
                                            }
                                            onChange={e => {
                                                setSectionSearchTerm(
                                                    e.target.value
                                                );
                                                setIsDropdownOpen(true);
                                            }}
                                            onFocus={() =>
                                                setIsDropdownOpen(true)
                                            }
                                            onBlur={() =>
                                                setTimeout(
                                                    () =>
                                                        setIsDropdownOpen(
                                                            false
                                                        ),
                                                    200
                                                )
                                            } // Timeout allows click event to fire on items
                                        />
                                        {isFetchingSections ? (
                                            <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                                        )}
                                    </div>

                                    {/* The Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className="top-full left-0 right-0 mt-2 border border-border rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                                            {existingSections.length === 0 &&
                                            !isFetchingSections ? (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    No sections found.
                                                </div>
                                            ) : (
                                                existingSections.map(
                                                    (sec: SectionResult) => (
                                                        <div
                                                            key={sec.id}
                                                            className="px-4 py-3 text-sm text-foreground bg-background hover:bg-secondary cursor-pointer border-b border-border/50 last:border-0 transition-colors"
                                                            onClick={() => {
                                                                setSelectedSection(
                                                                    sec
                                                                );
                                                                setSectionSearchTerm(
                                                                    ''
                                                                ); // Clear search term on select
                                                                setIsDropdownOpen(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            {sec.title}
                                                        </div>
                                                    )
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {sectionMode === SectionMode.NEW && (
                                <div className="space-y-4 animate-in fade-in">
                                    <Input
                                        placeholder="New Section Title"
                                        value={newSectionTitle}
                                        onChange={e =>
                                            setNewSectionTitle(e.target.value)
                                        }
                                        className="h-12 bg-background text-foreground"
                                    />
                                    <Textarea
                                        placeholder="Brief description of this section..."
                                        value={newSectionDesc}
                                        onChange={e =>
                                            setNewSectionDesc(e.target.value)
                                        }
                                        className="resize-none h-20 bg-background text-foreground"
                                    />

                                    {/* 🔥 NEW SWITCH: Section Privacy Toggle */}
                                    <div className="flex items-center justify-between bg-background border border-input rounded-lg p-4">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                Make Section Public
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Students can see this section.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={newSectionIsPublic}
                                            onCheckedChange={
                                                setNewSectionIsPublic
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* FINAL PUBLISH BUTTON */}
                        <Button
                            onClick={handlePublishAll}
                            disabled={
                                createMcqBatchMutation.isPending ||
                                createSectionMutation.isPending ||
                                mcqBatch.length === 0
                            }
                            className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20"
                        >
                            {createMcqBatchMutation.isPending ||
                            createSectionMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{' '}
                                    Publishing...
                                </>
                            ) : (
                                `Publish ${mcqBatch.length} Question${
                                    mcqBatch.length === 1 ? '' : 's'
                                }`
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateMcqPage;
