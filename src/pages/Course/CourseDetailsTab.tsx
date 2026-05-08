import { useState, KeyboardEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRequest } from '@/utils/request';
import { showToast } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import {
    Save,
    X,
    Tag as TagIcon,
    IndianRupee,
    BookType,
    Loader2,
    Archive,
    EyeOff,
    Eye,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface CourseDetailsProps {
    isCreated: boolean;
    courseId?: string; // Passed down from the URL params if editing
    initialData?: any;
    setIsSaving: (isSaving: boolean) => void;
    onSaveSuccess: (newCourseId: string) => void;
}

export const CourseDetailsTab = ({
    isCreated,
    courseId,
    onSaveSuccess,
    initialData,
    setIsSaving,
}: CourseDetailsProps) => {
    const request = useRequest();

    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(
        initialData?.description || ''
    );
    const [type, setType] = useState<'free' | 'paid'>(
        initialData?.type || 'free'
    );
    const [amount, setAmount] = useState<number | ''>(
        initialData?.amount || ''
    );
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [status, setStatus] = useState<'draft' | 'published'>(
        initialData?.status || 'draft'
    );
    const [archived, setArchived] = useState<boolean>(
        initialData?.archived || false
    );

    const [tagInput, setTagInput] = useState('');

    // --- API Mutations ---
    const saveMutation = useMutation({
        mutationFn: async (payload: any) => {
            if (isCreated && courseId) {
                // UPDATE EXISTING
                const res = await request.put(`/courses/${courseId}`, payload);
                return res.data;
            } else {
                // CREATE NEW
                const res = await request.post('/admin/course', payload);
                return res.data;
            }
        },
        onMutate: () => setIsSaving(true), // Trigger parent loading overlay
        onSettled: () => setIsSaving(false), // Remove parent loading overlay
        onSuccess: data => {
            showToast({
                title: isCreated ? 'Course Updated' : 'Course Created!',
                description: isCreated
                    ? 'Your changes have been saved.'
                    : 'Your course draft is ready. Tabs unlocked!',
                duration: 3000,
            });

            if (!isCreated && data?.id) {
                onSaveSuccess(data.id);
            }
        },
        onError: (error: any) => {
            showToast({
                title: 'Error saving course',
                description:
                    error.response?.data?.message ||
                    'Something went wrong. Please try again.',
                variant: 'destructive',
            });
        },
    });

    // --- Handlers ---
    const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = () => {
        if (!title.trim() || !description.trim()) {
            showToast({
                title: 'Validation Error',
                description: 'Title and description are required.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            title,
            description,
            type,
            amount: type === 'paid' ? Number(amount) : 0,
            tags,
            status,
            archived,
        };

        saveMutation.mutate(payload);
    };

    return (
        <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="border-b border-border pb-4">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    Course Details
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    Define the core metadata and pricing for this course.
                </p>
            </div>

            <div className="space-y-6 bg-card/50 backdrop-blur-sm rounded-xl shadow-sm">
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <BookType size={16} className="text-primary" /> Course
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Weekend React Bootcamp"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm shadow-sm"
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="What will students learn in this program?"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-sm resize-y text-sm"
                    />
                </div>

                {/* Grid for Type and Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pricing & Type */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            Enrollment Type
                        </label>
                        <div className="flex gap-3">
                            <label
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border cursor-pointer transition-all text-sm ${
                                    type === 'free'
                                        ? 'border-primary bg-primary/10 text-primary font-medium'
                                        : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="type"
                                    value="free"
                                    checked={type === 'free'}
                                    onChange={() => setType('free')}
                                    className="hidden"
                                />
                                Free
                            </label>
                            <label
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border cursor-pointer transition-all text-sm ${
                                    type === 'paid'
                                        ? 'border-primary bg-primary/10 text-primary font-medium'
                                        : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="type"
                                    value="paid"
                                    checked={type === 'paid'}
                                    onChange={() => setType('paid')}
                                    className="hidden"
                                />
                                Paid
                            </label>
                        </div>

                        {/* Amount Input (Conditional) */}
                        {type === 'paid' && (
                            <div className="animate-in slide-in-from-top-2 fade-in duration-300 space-y-2 mt-3">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Course Price
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                        <IndianRupee size={14} />
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        value={amount}
                                        onChange={e =>
                                            setAmount(
                                                e.target.value
                                                    ? Number(e.target.value)
                                                    : ''
                                            )
                                        }
                                        placeholder="0.00"
                                        className="w-full pl-8 px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm shadow-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <TagIcon size={14} className="text-primary" /> Tags
                        </label>

                        <div className="w-full min-h-[40px] p-1.5 rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/50 transition-all shadow-sm flex flex-wrap gap-1.5 items-center cursor-text">
                            {/* Render Tag Pills */}
                            {tags.map(tag => (
                                <span
                                    key={tag}
                                    className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium animate-in zoom-in-95"
                                >
                                    {tag}
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        className="hover:text-red-500 transition-colors focus:outline-none"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}

                            {/* Tag Input Field */}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder={
                                    tags.length === 0
                                        ? 'e.g., nodejs, full-stack (Press Enter)'
                                        : ''
                                }
                                className="flex-1 min-w-[120px] bg-transparent outline-none text-sm p-1"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Press enter or comma to add a tag.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            Publish Status
                        </label>
                        <div className="flex gap-3">
                            <label
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border cursor-pointer transition-all text-sm ${
                                    status === 'draft'
                                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 font-medium'
                                        : 'border-border bg-background text-muted-foreground hover:border-amber-500/50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    value="draft"
                                    checked={status === 'draft'}
                                    onChange={() => setStatus('draft')}
                                    className="hidden"
                                />
                                <EyeOff size={16} /> Draft
                            </label>
                            <label
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border cursor-pointer transition-all text-sm ${
                                    status === 'published'
                                        ? 'border-green-500 bg-green-500/10 text-green-600 font-medium'
                                        : 'border-border bg-background text-muted-foreground hover:border-green-500/50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    value="published"
                                    checked={status === 'published'}
                                    onChange={() => setStatus('published')}
                                    className="hidden"
                                />
                                <Eye size={16} /> Published
                            </label>
                        </div>
                    </div>

                    {/* 🔥 NEW: Archive Toggle */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Archive
                                size={14}
                                className="text-muted-foreground"
                            />{' '}
                            Danger Zone
                        </label>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background transition-all">
                            <div className="space-y-0.5">
                                <span className="text-sm font-medium text-foreground">
                                    Archive Course
                                </span>
                                <p className="text-xs text-muted-foreground">
                                    Hide this course from the student catalog.
                                </p>
                            </div>
                            <Switch
                                checked={archived}
                                onCheckedChange={setArchived}
                                aria-label="Archive Course"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="pt-2 flex justify-end">
                <Button
                    size="default"
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="w-full sm:w-auto min-w-[140px] h-10 text-sm shadow-md shadow-primary/10 gap-2 transition-transform hover:scale-[1.02] rounded-lg"
                >
                    {saveMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Save size={16} />
                    )}
                    {isCreated ? 'Update Course' : 'Create Course'}
                </Button>
            </div>
        </div>
    );
};
