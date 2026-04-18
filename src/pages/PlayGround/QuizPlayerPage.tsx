import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRequest } from '@/utils/request';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle,
    X,
    Lightbulb,
    Flag,
    PlayCircle,
    Trophy,
    Target,
    ListChecks,
} from 'lucide-react';

// --- Interfaces ---
interface PlayerMcq {
    id: string;
    title: string;
    type: 'SINGLE_CHOICE' | 'MULTI_SELECT' | 'TRUE_FALSE';
    options: string[];
}

interface EvaluationData {
    isCorrect: boolean;
    correctAnswers: string[];
    explanation: string;
}

type Phase = 'LOADING' | 'WELCOME' | 'TRANSITION' | 'PLAYING' | 'SUMMARY';

const QuizPlayerPage = () => {
    const { sectionId } = useParams<{ sectionId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const request = useRequest();

    const sectionTitle = location.state?.title || 'Quiz';

    // --- State Management ---
    const [phase, setPhase] = useState<Phase>('LOADING');
    const [countdown, setCountdown] = useState(3);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [highestIndexReached, setHighestIndexReached] = useState(0);

    const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>(
        {}
    );
    const [evaluations, setEvaluations] = useState<
        Record<string, EvaluationData>
    >({});

    // --- 1. Fetch MCQs ---
    const {
        data: mcqs = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['play-mcqs', sectionId],
        queryFn: async () => {
            const res = await request.get(
                `/mcq?sectionId=${sectionId}&limit=100&forPlayer=true`
            );
            return (res?.data?.data as PlayerMcq[]) || [];
        },
    });

    // --- 2. Evaluation Mutation ---
    const evaluateMutation = useMutation({
        mutationFn: async (payload: { mcqId: string; answers: string[] }) => {
            const res = await request.post(`/mcq/${payload.mcqId}/evaluate`, {
                userAnswers: payload.answers,
            });
            return res.data as EvaluationData;
        },
        onSuccess: (data, variables) => {
            setEvaluations(prev => ({ ...prev, [variables.mcqId]: data }));
        },
    });

    // --- Lifecycle & Transitions ---
    useEffect(() => {
        if (!isLoading && mcqs.length > 0 && phase === 'LOADING') {
            setPhase('WELCOME');
        }
    }, [isLoading, mcqs, phase]);

    useEffect(() => {
        if (phase === 'TRANSITION') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setPhase('PLAYING');
            }
        }
    }, [phase, countdown]);

    const startTransition = () => {
        setPhase('TRANSITION');
        setCountdown(3);
    };

    // --- Handlers ---
    const currentMcq = mcqs[currentIndex];
    const currentSelected = userAnswers[currentMcq?.id] || [];
    const currentEval = evaluations[currentMcq?.id];

    const toggleOption = (option: string) => {
        if (currentEval || evaluateMutation.isPending) return;

        if (currentMcq.type === 'MULTI_SELECT') {
            let newAnswers = [...currentSelected];
            if (newAnswers.includes(option))
                newAnswers = newAnswers.filter(o => o !== option);
            else newAnswers.push(option);
            setUserAnswers(prev => ({ ...prev, [currentMcq.id]: newAnswers }));
        } else {
            // Auto-submit for Single/TF
            const newAnswers = [option];
            setUserAnswers(prev => ({ ...prev, [currentMcq.id]: newAnswers }));
            evaluateMutation.mutate({
                mcqId: currentMcq.id,
                answers: newAnswers,
            });
        }
    };

    const handleCheckAnswer = () => {
        if (currentSelected.length === 0) return;
        evaluateMutation.mutate({
            mcqId: currentMcq.id,
            answers: currentSelected,
        });
    };

    const handleNext = () => {
        if (currentIndex < mcqs.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);

            if (nextIdx > highestIndexReached) {
                setHighestIndexReached(nextIdx);
                startTransition();
            } else {
                setPhase('PLAYING');
            }
        } else {
            setPhase('SUMMARY');
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setPhase('PLAYING');
        }
    };

    // --- Rendering Functions ---
    if (isLoading || isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                {isLoading ? (
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                ) : (
                    <AlertCircle className="w-12 h-12 text-red-500" />
                )}
            </div>
        );
    }

    if (mcqs.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-xl font-medium mb-4">
                    No questions found in this section.
                </p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    // 1. WELCOME SCREEN
    if (phase === 'WELCOME') {
        return (
            <div className="relative min-h-[87vh] flex flex-col items-center justify-center bg-background overflow-hidden animate-in px-4 fade-in zoom-in-95 duration-500">
                <div className="absolute top-24 left-24 w-96 h-96 bg-primary/40 rounded-full blur-[200px] pointer-events-none"></div>
                <div className="absolute bottom-24 right-24 w-96 h-96 bg-primary/40 rounded-full blur-[150px] pointer-events-none"></div>

                <div className="relative z-10 bg-card/80 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-8 sm:p-14 max-w-2xl w-full text-center space-y-8">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-2 rotate-3">
                        <Flag size={40} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">
                            Quiz Attempt
                        </h3>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight">
                            {sectionTitle}
                        </h1>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-muted-foreground bg-secondary/50 p-4 rounded-xl">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-foreground">
                                {mcqs.length}
                            </span>
                            <span className="text-xs uppercase tracking-wider">
                                Questions
                            </span>
                        </div>
                        <div className="w-px h-10 bg-border"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-foreground">
                                Practice
                            </span>
                            <span className="text-xs uppercase tracking-wider">
                                Mode
                            </span>
                        </div>
                    </div>
                    <Button
                        size="lg"
                        className="w-full text-xl h-16 rounded-2xl shadow-lg shadow-primary/25 hover:scale-[1.02] transition-transform"
                        onClick={startTransition}
                    >
                        Start Quiz <PlayCircle className="ml-3 w-6 h-6" />
                    </Button>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
                    >
                        Cancel and return to modules
                    </button>
                </div>
            </div>
        );
    }

    // 2. KAHOOT TRANSITION SCREEN
    if (phase === 'TRANSITION') {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary text-primary-foreground animate-in fade-in duration-300">
                <p className="text-2xl font-medium opacity-80 mb-2 uppercase tracking-widest">
                    Question {currentIndex + 1}
                </p>
                <h1 className="text-5xl sm:text-7xl font-extrabold mb-12 text-center px-4 drop-shadow-lg">
                    {currentMcq.type.replace('_', ' ')}
                </h1>
                <div className="w-32 h-32 flex items-center justify-center rounded-full bg-card/20 backdrop-blur-md text-6xl font-black shadow-2xl animate-pulse">
                    {countdown > 0 ? countdown : 'GO!'}
                </div>
            </div>
        );
    }

    // 3. PODIUM SUMMARY SCREEN
    if (phase === 'SUMMARY') {
        const score = Object.values(evaluations).filter(
            e => e.isCorrect
        ).length;
        const accuracy = Math.round((score / mcqs.length) * 100) || 0;

        return (
            <div className="min-h-[87vh] flex flex-col items-center justify-center bg-background overflow-hidden relative">
                <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-background to-background pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-6xl text-center space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="space-y-4">
                        <h1 className="text-5xl sm:text-7xl font-black text-foreground tracking-tight drop-shadow-sm">
                            Quiz Complete!
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Here is how you performed.
                        </p>
                    </div>

                    <div className="flex items-end justify-center gap-2 sm:gap-6 h-72 border-b-2 border-border/50 pb-0">
                        <div className="flex flex-col items-center w-24 sm:w-32 animate-in slide-in-from-bottom duration-700 delay-200">
                            <div className="mb-4 bg-slate-100 dark:bg-slate-800 p-3 rounded-full shadow-sm">
                                <Target className="w-8 h-8 text-slate-500" />
                            </div>
                            <div className="w-full h-32 bg-slate-200/50 dark:bg-slate-800/50 rounded-t-2xl border-t-4 border-slate-300 dark:border-slate-600 flex flex-col items-center justify-start pt-4 relative overflow-hidden">
                                <span className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-300">
                                    {accuracy}%
                                </span>
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">
                                    Accuracy
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center w-32 sm:w-44 animate-in slide-in-from-bottom duration-700">
                            <div className="mb-4 bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full shadow-lg ring-4 ring-yellow-500/20">
                                <Trophy className="w-12 h-12 text-yellow-500" />
                            </div>
                            <div className="w-full h-52 bg-gradient-to-t from-yellow-500/10 to-yellow-500/30 dark:from-yellow-500/5 dark:to-yellow-500/20 rounded-t-2xl border-t-4 border-yellow-500 flex flex-col items-center justify-start pt-6 shadow-[0_-10px_40px_-15px_rgba(234,179,8,0.3)]">
                                <span className="text-5xl sm:text-6xl font-black text-yellow-600 dark:text-yellow-400">
                                    {score}
                                </span>
                                <span className="text-sm font-bold text-yellow-600/80 dark:text-yellow-400/80 uppercase tracking-widest mt-1">
                                    Score
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center w-24 sm:w-32 animate-in slide-in-from-bottom duration-700 delay-300">
                            <div className="mb-4 bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full shadow-sm">
                                <ListChecks className="w-8 h-8 text-orange-500" />
                            </div>
                            <div className="w-full h-24 bg-orange-200/40 dark:bg-orange-900/20 rounded-t-2xl border-t-4 border-orange-400/60 dark:border-orange-700 flex flex-col items-center justify-start pt-3">
                                <span className="text-2xl sm:text-3xl font-bold text-orange-700 dark:text-orange-400">
                                    {mcqs.length}
                                </span>
                                <span className="text-xs font-medium text-orange-600/80 dark:text-orange-400/80 uppercase tracking-widest mt-1">
                                    Questions
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 flex justify-center">
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="min-w-[200px] h-14 text-lg rounded-xl shadow-sm hover:bg-secondary text-foreground"
                        >
                            Return to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 4. MAIN PLAYER UI
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-card/50 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="font-semibold text-foreground line-clamp-1">
                        {sectionTitle}
                    </h2>
                </div>
                <div className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    {currentIndex + 1} / {mcqs.length}
                </div>
            </header>

            <div className="w-full h-1.5 bg-secondary">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{
                        width: `${((currentIndex + 1) / mcqs.length) * 100}%`,
                    }}
                />
            </div>

            <main className="flex-grow flex flex-col items-center justify-start p-4 sm:p-8 animate-in slide-in-from-bottom-4 duration-500 mt-4 sm:mt-8">
                <div className="w-full max-w-3xl space-y-8">
                    <div className="space-y-3">
                        <span className="text-xs font-bold text-primary tracking-widest uppercase">
                            {currentMcq.type.replace('_', ' ')}
                        </span>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground leading-tight">
                            {currentMcq.title}
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentMcq.options.map((option, idx) => {
                            const isSelected = currentSelected.includes(option);

                            let stateStyles =
                                'bg-card border-border hover:border-primary/50 text-foreground';
                            let Icon = null;

                            if (currentEval) {
                                const isActuallyCorrect =
                                    currentEval.correctAnswers.includes(option);
                                if (isActuallyCorrect) {
                                    stateStyles =
                                        'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400';
                                    Icon = (
                                        <CheckCircle2
                                            className="text-green-500"
                                            size={20}
                                        />
                                    );
                                } else if (isSelected && !isActuallyCorrect) {
                                    stateStyles =
                                        'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400';
                                    Icon = (
                                        <XCircle
                                            className="text-red-500"
                                            size={20}
                                        />
                                    );
                                } else {
                                    stateStyles =
                                        'bg-card border-border opacity-50';
                                }
                            } else if (isSelected) {
                                stateStyles =
                                    'bg-primary/5 border-primary ring-1 ring-primary text-foreground';
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => toggleOption(option)}
                                    disabled={
                                        !!currentEval ||
                                        evaluateMutation.isPending
                                    }
                                    className={`relative p-6 rounded-xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${stateStyles}`}
                                >
                                    <div className="flex justify-between items-center gap-4 text-foreground">
                                        <span className="text-lg font-medium leading-snug">
                                            {option}
                                        </span>
                                        {Icon && (
                                            <span className="shrink-0 animate-in zoom-in">
                                                {Icon}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {currentEval && (
                        <div
                            className={`p-5 rounded-xl border animate-in slide-in-from-top-4 duration-300 ${
                                currentEval.isCorrect
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : 'bg-red-500/10 border-red-500/30'
                            } text-foreground`}
                        >
                            <div className="flex items-start gap-3">
                                <Lightbulb
                                    className={`shrink-0 mt-0.5 ${
                                        currentEval.isCorrect
                                            ? 'text-green-500'
                                            : 'text-red-500'
                                    }`}
                                    size={20}
                                />
                                <div>
                                    <h4
                                        className={`font-semibold mb-1 ${
                                            currentEval.isCorrect
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }`}
                                    >
                                        {currentEval.isCorrect
                                            ? 'Correct!'
                                            : 'Incorrect'}
                                    </h4>
                                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                                        {currentEval.explanation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 🔥 CENTERED INLINE NAVIGATION */}
                    <div className="pt-8 pb-12 flex items-center justify-center gap-4 border-t border-border mt-8">
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="shadow-sm font-medium min-w-[120px]"
                        >
                            <ChevronLeft size={18} className="mr-1.5" />
                            Previous
                        </Button>

                        {!currentEval && currentMcq.type === 'MULTI_SELECT' && (
                            <Button
                                onClick={handleCheckAnswer}
                                disabled={
                                    currentSelected.length === 0 ||
                                    evaluateMutation.isPending
                                }
                                className="shadow-lg shadow-primary/20 font-semibold min-w-[150px]"
                            >
                                {evaluateMutation.isPending ? (
                                    <Loader2
                                        className="animate-spin mr-2"
                                        size={18}
                                    />
                                ) : (
                                    <CheckCircle2
                                        className="mr-1.5"
                                        size={18}
                                    />
                                )}
                                Check Answer
                            </Button>
                        )}

                        {currentEval && (
                            <Button
                                onClick={handleNext}
                                className="shadow-lg shadow-primary/20 font-semibold min-w-[150px]"
                            >
                                {currentIndex === mcqs.length - 1 ? (
                                    <>
                                        Finish Quiz{' '}
                                        <Flag size={18} className="ml-1.5" />
                                    </>
                                ) : (
                                    <>
                                        Next Question{' '}
                                        <ChevronRight
                                            size={18}
                                            className="ml-1.5"
                                        />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default QuizPlayerPage;
