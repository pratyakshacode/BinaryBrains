// src/pages/admin/UpdateMcqModal.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { useRequest } from '@/utils/request';
import { showToast } from '@/utils/toast';
import { Modal } from '@/components/Modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Trash2,
    Plus,
    CheckCircle2,
    Circle,
    Search,
    Loader2,
    CheckIcon,
} from 'lucide-react';
import { SectionType } from '@/types/types';

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

interface UpdateMcqModalProps {
    isOpen: boolean;
    onClose: () => void;
    mcqId: string | null;
}

export const UpdateMcqModal = ({
    isOpen,
    onClose,
    mcqId,
}: UpdateMcqModalProps) => {
    const request = useRequest();
    const queryClient = useQueryClient();

    // Editor State
    const [title, setTitle] = useState('');
    const [explanation, setExplanation] = useState('');
    const [type, setType] = useState<McqType>(McqType.SINGLE_CHOICE);
    const [options, setOptions] = useState<McqOption[]>([]);

    // Section State
    const [sectionMode, setSectionMode] = useState<SectionMode>(
        SectionMode.NONE
    );
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [newSectionDesc, setNewSectionDesc] = useState('');
    const [newSectionIsPublic, setNewSectionIsPublic] = useState(true);

    // Searchable Combobox State
    const [sectionSearchTerm, setSectionSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(sectionSearchTerm, 500);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedSectionTitle, setSelectedSectionTitle] = useState('');

    // --- 1. Fetch MCQ Data ---
    const { data: mcqData, isLoading: isFetchingMcq } = useQuery({
        queryKey: ['mcq', mcqId],
        queryFn: async () => {
            const res = await request.get(`/mcq/${mcqId}`);
            return res.data;
        },
        enabled: !!mcqId && isOpen,
    });

    // Populate state when data arrives
    useEffect(() => {
        if (mcqData) {
            setTitle(mcqData.title);
            setExplanation(mcqData.explanation || ''); // Map explanation to your description field
            setType(mcqData.type as McqType);

            // Map string options array back to UI objects
            const formattedOptions = mcqData.options.map(
                (optText: string, i: number) => ({
                    id: i.toString(),
                    text: optText,
                    isCorrect: mcqData.correctAnswer.includes(optText),
                })
            );
            setOptions(formattedOptions);

            if (mcqData.sectionId) {
                setSectionMode(SectionMode.EXISTING);
                setSelectedSectionId(mcqData.sectionId);
                // Ideally, backend would send sectionTitle too, but we can leave placeholder
                setSelectedSectionTitle(mcqData.sectionTitle);
            } else {
                setSectionMode(SectionMode.NONE);
            }
        }
    }, [mcqData]);

    // --- 2. Fetch Sections for Combobox ---
    const { data: existingSections = [], isFetching: isFetchingSections } =
        useQuery({
            queryKey: ['sections', debouncedSearchTerm],
            queryFn: async () => {
                const res = await request.get(
                    `/section?limit=10&page=1&title=${debouncedSearchTerm}`
                );
                return res?.data?.data?.records || res?.data?.data || [];
            },
            enabled: sectionMode === SectionMode.EXISTING && isOpen,
        });

    // --- 3. Mutations ---
    const updateMcqMutation = useMutation({
        mutationFn: (payload: any) => request.put(`/mcq/${mcqId}`, payload),
        onSuccess: () => {
            showToast({
                title: 'Success',
                description: 'MCQ updated successfully.',
            });
            queryClient.invalidateQueries({ queryKey: ['mcqs'] });
            onClose();
        },
        onError: () =>
            showToast({
                title: 'Error',
                description: 'Failed to update MCQ.',
                variant: 'destructive',
            }),
    });

    const handleSave = async () => {
        if (
            !title.trim() ||
            !options.some(opt => opt.isCorrect) ||
            options.some(opt => !opt.text.trim())
        ) {
            return showToast({
                description:
                    'Please fill all required fields and select a correct answer.',
                variant: 'destructive',
            });
        }

        let finalSectionId =
            sectionMode === SectionMode.EXISTING ? selectedSectionId : null;

        // Create Section on the fly if needed
        if (sectionMode === SectionMode.NEW) {
            if (!newSectionTitle.trim())
                return showToast({
                    description: 'New section title required.',
                    variant: 'destructive',
                });
            try {
                const sectionRes = await request.post('/section', {
                    title: newSectionTitle,
                    description: newSectionDesc,
                    type: SectionType.MCQ,
                    isPublic: newSectionIsPublic,
                });
                finalSectionId = sectionRes.data.id;
            } catch (err) {
                return showToast({
                    description: 'Failed to create new section.',
                    variant: 'destructive',
                });
            }
        }

        // Send Update Payload
        updateMcqMutation.mutate({
            title,
            explanation,
            type,
            options: options.map(o => o.text),
            correctAnswer: options.filter(o => o.isCorrect).map(o => o.text),
            sectionId: finalSectionId,
        });
    };

    // --- Editor Helpers (same as Create) ---
    const toggleCorrectAnswer = (id: string) => {
        setOptions(prev =>
            prev.map(opt => {
                if (opt.id === id) return { ...opt, isCorrect: !opt.isCorrect };
                if (type !== McqType.MULTI_SELECT)
                    return { ...opt, isCorrect: false };
                return opt;
            })
        );
    };

    if (isFetchingMcq) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Edit Question">
                <div className="py-20 flex justify-center">
                    <Loader2 className="animate-spin w-8 h-8 text-primary" />
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Question"
            maxWidth="max-w-4xl"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-foreground">
                {/* LEFT: MCQ Editor */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Question Title
                        </label>
                        <Textarea
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="resize-none h-20"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <label className="text-sm font-medium">
                                Options
                            </label>
                            <select
                                className="bg-background border rounded px-2 py-1 text-sm"
                                value={type}
                                onChange={e => {
                                    setType(e.target.value as McqType);
                                    if (e.target.value === McqType.TRUE_FALSE)
                                        setOptions([
                                            {
                                                id: '1',
                                                text: 'True',
                                                isCorrect: false,
                                            },
                                            {
                                                id: '2',
                                                text: 'False',
                                                isCorrect: false,
                                            },
                                        ]);
                                }}
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
                        {options.map(opt => (
                            <div
                                key={opt.id}
                                className="flex gap-2 items-center"
                            >
                                <button
                                    onClick={() => toggleCorrectAnswer(opt.id)}
                                    className={`p-1 rounded-full ${
                                        opt.isCorrect
                                            ? 'text-green-500'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {opt.isCorrect ? (
                                        <CheckCircle2 size={20} />
                                    ) : (
                                        <Circle size={20} />
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
                                                          text: e.target.value,
                                                      }
                                                    : o
                                            )
                                        )
                                    }
                                    disabled={type === McqType.TRUE_FALSE}
                                />
                                {type !== McqType.TRUE_FALSE && (
                                    <button
                                        onClick={() =>
                                            setOptions(
                                                options.filter(
                                                    o => o.id !== opt.id
                                                )
                                            )
                                        }
                                        className="text-red-500"
                                    >
                                        <Trash2 size={18} color="red" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {type !== McqType.TRUE_FALSE && options.length < 6 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setOptions([
                                        ...options,
                                        {
                                            id: Date.now().toString(),
                                            text: '',
                                            isCorrect: false,
                                        },
                                    ])
                                }
                            >
                                <Plus size={16} className="mr-1" /> Add Option
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Explanation
                        </label>
                        <Textarea
                            value={explanation}
                            onChange={e => setExplanation(e.target.value)}
                            className="resize-none h-16"
                        />
                    </div>
                </div>

                {/* RIGHT: Section Assignment */}
                <div className="space-y-6 bg-secondary/20 p-5 rounded-xl border border-border">
                    <h3 className="font-semibold border-b pb-2">
                        Section Assignment
                    </h3>
                    <select
                        className="w-full h-10 border rounded-lg px-3 bg-background"
                        value={sectionMode}
                        onChange={e =>
                            setSectionMode(e.target.value as SectionMode)
                        }
                    >
                        <option value={SectionMode.NONE}>
                            No Section (Bank Only)
                        </option>
                        <option value={SectionMode.EXISTING}>
                            Existing Section
                        </option>
                        <option value={SectionMode.NEW}>New Section</option>
                    </select>

                    {/* Combobox Search */}
                    {sectionMode === SectionMode.EXISTING && (
                        <div className="relative">
                            <div
                                className="flex items-center w-full h-10 border rounded-lg px-3 bg-background cursor-text"
                                onClick={() => setIsDropdownOpen(true)}
                            >
                                <Search className="w-4 h-4 mr-2 opacity-50" />
                                <input
                                    className="w-full bg-transparent outline-none text-sm"
                                    placeholder="Search..."
                                    value={
                                        isDropdownOpen
                                            ? sectionSearchTerm
                                            : selectedSectionTitle
                                    }
                                    onChange={e => {
                                        setSectionSearchTerm(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onBlur={() =>
                                        setTimeout(
                                            () => setIsDropdownOpen(false),
                                            200
                                        )
                                    }
                                />
                                {isFetchingSections && (
                                    <Loader2 className="w-4 h-4 animate-spin opacity-50" />
                                )}
                            </div>
                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl z-[99999] max-h-48 overflow-y-auto">
                                    {existingSections.map((sec: any) => (
                                        <div
                                            key={sec.id}
                                            className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-900 dark:text-slate-100 flex justify-between items-center"
                                            onClick={() => {
                                                setSelectedSectionId(sec.id);
                                                setSelectedSectionTitle(
                                                    sec.title
                                                );
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            {sec.title}{' '}
                                            {sec.id === selectedSectionId && (
                                                <CheckIcon size={15} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {sectionMode === SectionMode.NEW && (
                        <div className="space-y-3">
                            <Input
                                placeholder="Section Title"
                                value={newSectionTitle}
                                onChange={e =>
                                    setNewSectionTitle(e.target.value)
                                }
                            />
                            <Textarea
                                placeholder="Description..."
                                value={newSectionDesc}
                                onChange={e =>
                                    setNewSectionDesc(e.target.value)
                                }
                            />
                            <div className="flex justify-between items-center bg-background p-3 rounded border">
                                <span className="text-sm">Make Public</span>
                                <Switch
                                    checked={newSectionIsPublic}
                                    onCheckedChange={setNewSectionIsPublic}
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-4 mt-auto">
                        <Button
                            onClick={handleSave}
                            disabled={updateMcqMutation.isPending}
                            className="w-full"
                        >
                            {updateMcqMutation.isPending ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : null}{' '}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
