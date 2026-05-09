import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRequest } from '@/utils/request';
import { Button } from '@/components/ui/button';
import { showToast } from '@/utils/toast';
import {
    Search,
    Plus,
    X,
    FileText,
    HelpCircle,
    Loader2,
    LibraryBig,
} from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { SectionType } from '@/types/types';

interface Section {
    id: string;
    title: string;
    type: SectionType;
    description: string;
}

interface SectionLibraryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (section: Section) => void;
    chapterId: string | null; // Keeps track of which chapter we are adding to
}

export const SectionLibraryDrawer = ({
    isOpen,
    onClose,
    onSelect,
}: SectionLibraryDrawerProps) => {
    const request = useRequest();

    // UI State
    const [activeTab, setActiveTab] = useState<'search' | 'create'>('search');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Create State
    const [newTitle, setNewTitle] = useState('');
    const [newType, setNewType] = useState<'ordinary' | 'mcq'>('ordinary');
    const [newDescription, setNewDescription] = useState('');

    // --- Debounce Logic for Search ---
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // --- API: Search Sections ---
    const { data: searchResults, isLoading: isSearching } = useQuery({
        queryKey: ['search-sections', debouncedQuery],
        queryFn: async () => {
            const res = await request.get(`/section/?title=${debouncedQuery}`);
            return res?.data?.data as Section[];
        },
        enabled: isOpen && activeTab === 'search', // Only fetch when drawer is open
    });

    // --- API: Create Section ---
    const createMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await request.post('/section', payload);
            return res.data as Section;
        },
        onSuccess: newSection => {
            showToast({
                title: 'Section Created',
                description: 'Added to your library and chapter.',
            });
            setNewTitle(''); // Reset form
            onSelect(newSection); // Send back to parent
        },
        onError: () => {
            showToast({
                title: 'Error',
                description: 'Could not create section.',
                variant: 'destructive',
            });
        },
    });

    const handleCreate = () => {
        if (!newTitle.trim()) return;
        createMutation.mutate({
            title: newTitle,
            description: newDescription,
            type: newType,
            isPublic: true,
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all duration-300 ${
                    isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onClick={onClose}
            />

            {/* Slide-over Drawer */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-background">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <LibraryBig size={18} />
                        </div>
                        <h2 className="font-semibold text-lg">
                            Section Library
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-4 border-b border-border bg-background/50">
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`flex-1 pb-2 text-sm font-medium transition-all border-b-2 ${
                            activeTab === 'search'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Search Library
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`flex-1 pb-2 text-sm font-medium transition-all border-b-2 ${
                            activeTab === 'create'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Create New
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* TAB: SEARCH */}
                    {activeTab === 'search' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search by section title..."
                                    value={searchQuery}
                                    onChange={e =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2 mt-4">
                                {isSearching ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="animate-spin text-primary" />
                                    </div>
                                ) : searchResults?.length === 0 ? (
                                    <div className="text-center p-8 text-muted-foreground text-sm">
                                        No sections found.
                                    </div>
                                ) : (
                                    searchResults?.map(section => (
                                        <div
                                            key={section.id}
                                            className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/50 transition-colors bg-background group"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {section.type === 'mcq' ? (
                                                    <HelpCircle
                                                        size={16}
                                                        className="text-amber-500 shrink-0"
                                                    />
                                                ) : (
                                                    <FileText
                                                        size={16}
                                                        className="text-blue-500 shrink-0"
                                                    />
                                                )}
                                                <span className="text-sm font-medium truncate">
                                                    {section.title}
                                                </span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() =>
                                                    onSelect(section)
                                                }
                                                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: CREATE */}
                    {activeTab === 'create' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Section Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Introduction to Hooks"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="section-description"
                                    className="text-sm font-medium"
                                >
                                    Section Description
                                </label>
                                <Textarea
                                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    id="section-description"
                                    value={newDescription}
                                    onChange={e =>
                                        setNewDescription(e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Content Type
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label
                                        className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${
                                            newType === 'ordinary'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="sectionType"
                                            value="ordinary"
                                            checked={newType === 'ordinary'}
                                            onChange={() =>
                                                setNewType('ordinary')
                                            }
                                            className="hidden"
                                        />
                                        <FileText size={24} className="mb-2" />
                                        <span className="text-sm font-medium">
                                            Lesson
                                        </span>
                                    </label>
                                    <label
                                        className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${
                                            newType === 'mcq'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="sectionType"
                                            value="mcq"
                                            checked={newType === 'mcq'}
                                            onChange={() => setNewType('mcq')}
                                            className="hidden"
                                        />
                                        <HelpCircle
                                            size={24}
                                            className="mb-2"
                                        />
                                        <span className="text-sm font-medium">
                                            Quiz / MCQ
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <Button
                                onClick={handleCreate}
                                disabled={
                                    createMutation.isPending || !newTitle.trim()
                                }
                                className="w-full gap-2 mt-4"
                            >
                                {createMutation.isPending ? (
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Plus size={16} />
                                )}
                                Create & Add Section
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
