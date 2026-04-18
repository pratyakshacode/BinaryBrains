import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { useRequest } from '@/utils/request';
import { showToast } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    Edit2,
    Trash2,
    Loader2,
    Plus,
    AlertCircle,
    ListChecks,
    SearchIcon,
} from 'lucide-react';

// Import the pagination component you provided
import Pagination from '@/components/Pagination/Pagination'; // Adjust import path as needed
import { UpdateMcqModal } from './UpdateMcqModal';
import { onConfirmModal } from '@/components/Modal/onConfirmModal';
import {
    Breadcrumb,
    BreadcrumbItem,
} from '@/components/ui/BreadCrumb/BreadCrumb';

// Interface precisely matching your provided JSON API response
interface Mcq {
    id: string;
    title: string;
    explanation: string;
    type: string;
    options: string[];
    // Optional fallbacks in case you add these to the backend later
    isPublic?: boolean;
    createdAt?: string;
}

const McqListPage = () => {
    const navigate = useNavigate();
    const request = useRequest();
    const queryClient = useQueryClient();

    // ----------------------------------------------------------------
    // STATE: Pagination & Search
    // ----------------------------------------------------------------
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMcqId, setEditingMcqId] = useState<string | null>(null);

    // Change the handleEdit function
    const handleEdit = (id: string) => {
        setEditingMcqId(id);
        setIsEditModalOpen(true);
    };

    // ----------------------------------------------------------------
    // REACT QUERY: Fetch List & Calculate Pagination
    // ----------------------------------------------------------------
    const { data, isLoading, isError } = useQuery({
        queryKey: ['mcqs', page, limit, debouncedSearchTerm],
        queryFn: async () => {
            // Make sure the endpoint matches your backend exactly
            const response = await request.get(
                `/mcq?page=${page}&limit=${limit}&title=${debouncedSearchTerm}`
            );

            // 1. Dig into the nested data object
            const responseData = response?.data;

            // 2. Extract the actual array of questions
            const records = responseData?.data || [];

            // 3. Extract the total count for pagination math
            const totalCount = responseData?.totalCount || 0;

            // 4. Calculate total pages mathematically
            const calculatedTotalPages = Math.ceil(totalCount / limit) || 1;

            return {
                records,
                totalPages: calculatedTotalPages,
                totalRecords: totalCount,
            };
        },
        // Keeps old data visible while fetching new pages (prevents UI flickering)
        placeholderData: previousData => previousData,
    });

    const mcqs: Mcq[] = data?.records || [];
    const totalPages = data?.totalPages || 0;

    // ----------------------------------------------------------------
    // REACT QUERY: Delete Mutation
    // ----------------------------------------------------------------
    const deleteMutation = useMutation({
        mutationFn: (id: string) => request.del(`/mcq/${id}`),
        onSuccess: () => {
            showToast({
                title: 'Success',
                description: 'Question deleted successfully.',
            });
            // Instantly refresh the table cache
            queryClient.invalidateQueries({ queryKey: ['mcqs'] });
        },
        onError: () => {
            showToast({
                title: 'Error',
                description: 'Failed to delete question.',
                variant: 'destructive',
            });
        },
    });

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    const items: BreadcrumbItem[] = [
        { title: 'Home', url: '/' },
        { title: 'Admin', url: '/admin' },
        { title: "MCQ's", url: '/admin/mcq' },
    ];

    return (
        <div className="relative min-h-screen flex flex-col items-center py-5 px-4 overflow-hidden w-full">
            <UpdateMcqModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingMcqId(null);
                }}
                mcqId={editingMcqId}
            />
            {/* Ambient Background Glows */}
            <div className="fixed top-20 left-10 w-[500px] h-[500px] bg-primary/30 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-primary/40 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-6xl">
                <div className="flex w-full justify-left">
                    <Breadcrumb items={items} />
                </div>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                            MCQ's
                        </h1>
                        <p className="text-muted-foreground my-4">
                            Manage, edit, and organize all your multiple-choice
                            questions.
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/admin/mcq/create')}
                        className="gap-2 shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} /> Author MCQ's
                    </Button>
                </div>

                {/* Main Content Card */}
                <div className="bg-transparent backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl flex flex-col min-h-[600px]">
                    {/* Toolbar: Search */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search questions by title..."
                                rightSection={<SearchIcon size={15} />}
                                value={searchTerm}
                                onChange={e => {
                                    setSearchTerm(e.target.value);
                                    setPage(1); // Reset to page 1 on new search
                                }}
                                className="pl-10 h-11 bg-background text-foreground"
                            />
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="flex-grow overflow-x-auto rounded-xl border border-border bg-background/50">
                        <table className="w-full text-left text-sm text-foreground">
                            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                                <tr>
                                    <th className="px-4 py-4">
                                        Title & Explanation
                                    </th>
                                    <th className="px-4 py-4 w-40">Type</th>
                                    <th className="px-4 py-4 w-32">
                                        Configuration
                                    </th>
                                    <th className="px-4 py-4 w-32">
                                        Date Added
                                    </th>
                                    <th className="px-4 py-4 w-24 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-20 text-center"
                                        >
                                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                                            <p className="text-muted-foreground">
                                                Loading questions...
                                            </p>
                                        </td>
                                    </tr>
                                ) : isError ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-20 text-center text-red-500"
                                        >
                                            <AlertCircle className="w-8 h-8 mx-auto mb-4" />
                                            <p>
                                                Failed to load questions. Please
                                                try again.
                                            </p>
                                        </td>
                                    </tr>
                                ) : mcqs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-20 text-center"
                                        >
                                            <p className="text-muted-foreground text-lg mb-2">
                                                No questions found.
                                            </p>
                                            <p className="text-sm text-muted-foreground/70">
                                                Try adjusting your search or
                                                author a new question.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    mcqs.map(mcq => (
                                        <tr
                                            key={mcq.id}
                                            className="hover:bg-muted/30 transition-colors group"
                                        >
                                            {/* Title & Explanation */}
                                            <td className="px-4 py-4 max-w-md">
                                                <p
                                                    className="font-medium line-clamp-1 text-foreground"
                                                    title={mcq.title}
                                                >
                                                    {mcq.title}
                                                </p>
                                                {mcq.explanation && (
                                                    <p
                                                        className="text-xs text-muted-foreground line-clamp-1 mt-1"
                                                        title={mcq.explanation}
                                                    >
                                                        {mcq.explanation}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Type (Safely handles empty string from API) */}
                                            <td className="px-4 py-4">
                                                <span className="bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-md font-medium tracking-wide">
                                                    {(
                                                        mcq.type || 'UNKNOWN'
                                                    ).replace('_', ' ')}
                                                </span>
                                            </td>

                                            {/* Options Count (Replaces missing Visibility) */}
                                            <td className="px-4 py-4">
                                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <ListChecks size={14} />{' '}
                                                    {mcq.options?.length || 0}{' '}
                                                    Options
                                                </span>
                                            </td>

                                            {/* Date (Safe fallback since missing from API) */}
                                            <td className="px-4 py-4 text-muted-foreground text-sm">
                                                {mcq.createdAt
                                                    ? new Date(
                                                          mcq.createdAt
                                                      ).toLocaleDateString()
                                                    : 'N/A'}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-end gap-2 transition-opacity">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(mcq.id)
                                                        }
                                                        className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10"
                                                        title="Edit Question"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            onConfirmModal({
                                                                title: 'Are you sure you want to delete this mcq ?',
                                                                confirmText:
                                                                    'Delete',
                                                                variant:
                                                                    'destructive',
                                                                onConfirm: () =>
                                                                    handleDelete(
                                                                        mcq.id
                                                                    ),
                                                            })
                                                        }
                                                        disabled={
                                                            deleteMutation.isPending
                                                        }
                                                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-md hover:bg-red-500/10 disabled:opacity-50"
                                                        title="Delete Question"
                                                    >
                                                        {deleteMutation.isPending ? (
                                                            <Loader2
                                                                size={16}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* The Pagination Component */}
                    {!isLoading && !isError && totalPages > 0 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={newPage => setPage(newPage)}
                            limit={limit}
                            onLimitChange={newLimit => setLimit(newLimit)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default McqListPage;
