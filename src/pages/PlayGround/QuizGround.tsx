import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useRequest } from '@/utils/request';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    PlayCircle,
    BookOpen,
    HelpCircle,
    Loader2,
    AlertCircle,
    Clock,
    ListChecks,
} from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
} from '@/components/ui/BreadCrumb/BreadCrumb';

// Types matching the new generic getPublicSectionsWithResources API
interface ResourcePreview {
    id: string;
    title: string;
    type: string;
    resourceType: string;
    options: string[]; // Options array is safe; answers/explanations are stripped by backend
}

interface PublicSection {
    id: string;
    title: string;
    description: string;
    resources: ResourcePreview[];
}

const items: BreadcrumbItem[] = [
    { title: 'Home', url: '/' },
    { title: 'PlayGround', url: '/playground' },
    { title: 'QuizGround', url: '/quizground' },
];

const QuizGround = () => {
    const navigate = useNavigate();
    const request = useRequest();

    // ----------------------------------------------------------------
    // REACT QUERY: Fetch Public Sections & MCQs
    // ----------------------------------------------------------------
    const {
        data: sections = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['public-sections', 'mcq'],
        queryFn: async () => {
            // Hitting the new generic API, filtering specifically for MCQ sections
            const response = await request.get('/section/public?type=mcq');
            return (response?.data as PublicSection[]) || [];
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    // ----------------------------------------------------------------
    // Navigation
    // ----------------------------------------------------------------
    const handleStartQuiz = (sectionId: string, sectionTitle: string) => {
        // Navigate to the player initialization screen we will build next
        navigate(`/playground/quiz/play/${sectionId}`, {
            state: { title: sectionTitle },
        });
    };

    // ----------------------------------------------------------------
    // Loading & Error States
    // ----------------------------------------------------------------
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-lg">
                    Loading available quizzes...
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">
                    Failed to load the curriculum.
                </p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex flex-col items-center pt-5 overflow-hidden w-full">
            {/* Ambient Background Glows */}
            <div className="fixed top-20 left-10 w-[500px] h-[500px] bg-primary/40 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-primary/40 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-6xl">
                <div className="w-full flex justify-start px-4 md:px-0">
                    <Breadcrumb items={items} />
                </div>

                {/* Hero Header */}
                <div className="w-full flex flex-col items-start px-4 md:px-0">
                    <div className="inline-flex items-center rounded-2xl mb-2 text-primary w-full">
                        <BookOpen size={32} />
                        <h1 className="text-3xl sm:text-4xl ml-3 font-extrabold text-foreground tracking-tight">
                            Available Quizzes
                        </h1>
                    </div>
                    <p className="text-lg text-muted-foreground my-4">
                        Test your knowledge and practice your skills. Select a
                        topic below to review the questions and start the quiz.
                    </p>
                </div>

                {/* Main Content: The Accordion */}
                {sections.length === 0 ? (
                    <div className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-12 text-center shadow-xl">
                        <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            No Quizzes Available
                        </h3>
                        <p className="text-muted-foreground">
                            Your instructor hasn't published any public quizzes
                            yet. Check back later!
                        </p>
                    </div>
                ) : (
                    <div className="bg-transparent backdrop-blur-xl border border-border rounded-2xl p-2 sm:p-6 shadow-2xl">
                        <Accordion
                            type="single"
                            collapsible
                            defaultValue={sections[0]?.id} // Automatically opens the first section!
                            className="w-full space-y-4"
                        >
                            {sections.map(section => (
                                <AccordionItem
                                    key={section.id}
                                    value={section.id}
                                    className="border border-border bg-background/50 rounded-xl px-4 sm:px-6 overflow-hidden data-[state=open]:border-primary/30 transition-colors"
                                >
                                    {/* ACCORDION HEADER */}
                                    <AccordionTrigger className="hover:no-underline py-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left gap-4 pr-4">
                                            <div>
                                                <h2 className="text-xl font-semibold text-foreground">
                                                    {section.title}
                                                </h2>
                                                {section.description && (
                                                    <p className="text-sm text-muted-foreground mt-1 font-normal line-clamp-1">
                                                        {section.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Resource Count Badge */}
                                            <div className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium shrink-0">
                                                <ListChecks size={16} />
                                                {section.resources?.length ||
                                                    0}{' '}
                                                Questions
                                            </div>
                                        </div>
                                    </AccordionTrigger>

                                    {/* ACCORDION BODY */}
                                    <AccordionContent className="pb-6 pt-2">
                                        <div className="space-y-6">
                                            {/* Question Preview List */}
                                            {section.resources?.length > 0 ? (
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-medium text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                                                        <Clock
                                                            size={16}
                                                            className="text-muted-foreground"
                                                        />
                                                        Quiz Preview
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {section.resources.map(
                                                            (resource, idx) => (
                                                                <li
                                                                    key={
                                                                        resource.id
                                                                    }
                                                                    className="flex gap-3 items-start p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                                                                >
                                                                    <span className="text-sm font-bold text-primary bg-primary/10 w-6 h-6 flex items-center justify-center rounded-md shrink-0">
                                                                        {idx +
                                                                            1}
                                                                    </span>
                                                                    <div>
                                                                        <p className="text-sm text-foreground line-clamp-2">
                                                                            {
                                                                                resource.title
                                                                            }
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                                                                            {resource.type
                                                                                .replace(
                                                                                    '_',
                                                                                    ' '
                                                                                )
                                                                                .toLowerCase()}{' '}
                                                                            •{' '}
                                                                            {resource
                                                                                .options
                                                                                ?.length ||
                                                                                0}{' '}
                                                                            Options
                                                                        </p>
                                                                    </div>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">
                                                    This section is currently
                                                    empty.
                                                </p>
                                            )}

                                            {/* Action Area */}
                                            <div className="pt-4 border-t border-border flex justify-end">
                                                <Button
                                                    size="lg"
                                                    onClick={() =>
                                                        handleStartQuiz(
                                                            section.id,
                                                            section.title
                                                        )
                                                    }
                                                    disabled={
                                                        !section.resources ||
                                                        section.resources
                                                            .length === 0
                                                    }
                                                    className="w-full sm:w-auto gap-2 font-semibold text-md shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                                                >
                                                    <PlayCircle size={20} />
                                                    Attempt Quiz
                                                </Button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizGround;
