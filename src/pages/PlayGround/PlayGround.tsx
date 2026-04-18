import { useNavigate } from 'react-router-dom';
import {
    TerminalSquare,
    Gamepad2,
    Code2,
    Target,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/BreadCrumb/BreadCrumb';

const PlaygroundHub = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-[80vh] flex flex-col items-center px-4 overflow-hidden bg-background w-full">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-6xl space-y-8 mt-8">
                <Breadcrumb
                    items={[
                        { title: 'Home', url: '/' },
                        { title: 'Playground', url: '/playground' },
                    ]}
                />

                {/* Header Section */}
                <div className="text-center space-y-4 mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-secondary rounded-2xl mb-2 text-foreground shadow-sm">
                        <Sparkles size={28} className="text-primary" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
                        Interactive Learning Hub
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Choose your environment. Build projects in the live code
                        sandbox or test your knowledge with interactive quizzes.
                    </p>
                </div>

                {/* The Two Massive Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                    {/* CARD 1: Code Sandbox */}
                    <div
                        onClick={() => navigate('/playground/sandbox')}
                        className="group relative flex flex-col justify-between bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-10 text-left shadow-xl hover:shadow-2xl hover:border-blue-500/50 transition-all duration-300 cursor-pointer overflow-hidden min-h-[350px]"
                    >
                        {/* Subtle background gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <TerminalSquare size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                                    Code Sandbox{' '}
                                    <Code2
                                        size={20}
                                        className="text-muted-foreground"
                                    />
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    A full-featured IDE in your browser. Write
                                    HTML, CSS, and JavaScript and see your
                                    results instantly. Perfect for rapid
                                    prototyping and completing coding
                                    challenges.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 pt-8 mt-auto">
                            <Button className="w-full sm:w-auto gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                                Enter Sandbox <ArrowRight size={18} />
                            </Button>
                        </div>
                    </div>

                    {/* CARD 2: Knowledge Check (Quizzes) */}
                    <div
                        onClick={() => navigate('/playground/quizzes')}
                        className="group relative flex flex-col justify-between bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-10 text-left shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden min-h-[350px]"
                    >
                        {/* Subtle background gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Gamepad2 size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                                    Knowledge Check{' '}
                                    <Target
                                        size={20}
                                        className="text-muted-foreground"
                                    />
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Put your skills to the test. Browse a
                                    library of interactive mock tests and
                                    topic-specific quizzes with real-time
                                    grading and explanations.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 pt-8 mt-auto">
                            <Button className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20">
                                Browse Quizzes <ArrowRight size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaygroundHub;
