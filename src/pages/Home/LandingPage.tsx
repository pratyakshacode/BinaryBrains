import { Button } from '@/components/ui/button';
import { showToast } from '@/utils/toast';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CoursesDescription } from '@/utils/utils';
import OfferingCard from '@/components/Home/OfferingCard';
import HorizontalScrollReviews from '@/components/Home/HorizontalScrollReviews';
import WhyChooseUs from '@/components/Home/WhyChooseUs';
import HowItWorks from '@/components/Home/HowItWorks';
import FAQ from '@/components/Home/FAQ';
import { useTheme } from '@/components/ui/Theme/ThemeProvider';
import { Sparkles, ArrowRight, Terminal } from 'lucide-react';

const LandingPage = () => {
    const { theme } = useTheme();

    useGSAP(() => {
        // HERO LEFT ANIMATIONS (Text sliding in from the left)
        gsap.fromTo(
            '.appear',
            { x: -30, opacity: 0 },
            { x: 0, opacity: 1, stagger: 0.15, duration: 1, ease: 'power3.out' }
        );

        // HERO RIGHT ANIMATIONS (Code window sliding in from right)
        gsap.fromTo(
            '.floating-code-container',
            { x: 30, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.3 }
        );

        // Gentle floating effect for the code window
        gsap.to('.floating-code', {
            y: -15,
            duration: 3,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            delay: 1.3,
        });

        // ACHIEVEMENTS ANIMATIONS
        gsap.fromTo(
            '.achievements-left',
            { x: -200, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 0.9,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#achievements-container',
                    start: 'top 85%',
                    end: 'top 50%',
                    scrub: true,
                },
            }
        );

        gsap.fromTo(
            '.achievements-right',
            { x: 200, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 6,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#achievements-container',
                    start: 'top 85%',
                    end: 'top 50%',
                    scrub: true,
                },
            }
        );
    }, []);

    return (
        <div className="w-full overflow-x-hidden">
            {/* 🔥 LEFT/RIGHT HERO SECTION */}
            <div className="w-full flex flex-col lg:flex-row items-center justify-between min-h-[90vh] relative overflow-hidden px-6 sm:px-12 lg:px-24 xl:px-36">
                {/* Ambient Background Glows */}
                <div className="fixed top-32 left-20 w-[600px] h-[600px] bg-primary/40 blur-[150px] rounded-full pointer-events-none"></div>
                <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-primary/40 blur-[150px] rounded-full pointer-events-none"></div>

                {/* LEFT SIDE: Typography & CTAs */}
                <div className="w-full lg:w-1/2 flex flex-col items-start text-left z-10 pt-24 lg:pt-0 pb-10">
                    {/* Top AI Badge */}
                    <div className="appear inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border text-primary mb-6 text-sm font-semibold shadow-sm">
                        <Sparkles size={16} className="text-primary" />
                        <span>AI-Powered Learning Platform</span>
                    </div>

                    {/* Main Headlines */}
                    <h1 className="text-foreground text-5xl sm:text-6xl md:text-7xl font-black tracking-tight appear leading-[1.1] mb-2">
                        Think{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 drop-shadow-sm">
                            Binary.
                        </span>
                    </h1>
                    <h1 className="text-foreground text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight appear leading-tight">
                        Code the Future.
                    </h1>

                    {/* Subtitle */}
                    <h2 className="text-muted-foreground text-lg sm:text-xl max-w-lg mt-6 appear leading-relaxed font-medium">
                        Welcome to Binary Brains. Master full-stack development,
                        deep-dive into algorithms, and build your career with
                        our interactive curriculum.
                    </h2>

                    {/* Call to Action */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 appear">
                        <Button
                            size="lg"
                            onClick={() => {
                                showToast({
                                    title: 'Welcome to Binary Brains',
                                    description:
                                        'Loading the course catalog...',
                                    duration: 1500,
                                });
                            }}
                            className="h-14 px-8 text-lg shadow-xl shadow-primary/25 transition-transform hover:scale-105 gap-2 font-bold w-full sm:w-auto"
                        >
                            Explore Courses <ArrowRight size={20} />
                        </Button>
                    </div>
                </div>

                {/* RIGHT SIDE: Floating Code Window */}
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-12 lg:mt-0 z-10 floating-code-container pb-16 lg:pb-0">
                    <div className="floating-code w-full max-w-md bg-slate-950 dark:bg-[#0d1117] border border-slate-800 dark:border-slate-800/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative group">
                        {/* Glow effect strictly behind the code block */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Window Header (Mac Style) */}
                        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <div className="flex-1 flex justify-center text-xs text-slate-500 font-medium font-mono items-center gap-1.5">
                                <Terminal size={12} /> future.js
                            </div>
                        </div>

                        {/* Window Body (Code) */}
                        <div className="p-6 text-sm font-mono leading-relaxed overflow-x-auto text-slate-300">
                            <p>
                                <span className="text-pink-500">import</span>{' '}
                                {'{'}{' '}
                                <span className="text-blue-400">Success</span>{' '}
                                {'}'}{' '}
                                <span className="text-pink-500">from</span>{' '}
                                <span className="text-green-400">
                                    './hard-work'
                                </span>
                                ;
                            </p>
                            <br />
                            <p>
                                <span className="text-pink-500">const</span>{' '}
                                <span className="text-blue-400">student</span>{' '}
                                <span className="text-pink-500">=</span>{' '}
                                <span className="text-pink-500">new</span>{' '}
                                <span className="text-yellow-300">
                                    BinaryBrain
                                </span>
                                ();
                            </p>
                            <br />
                            <p>
                                <span className="text-blue-400">student</span>.
                                <span className="text-yellow-300">learn</span>(
                                <span className="text-green-400">
                                    'Full-Stack Web'
                                </span>
                                );
                            </p>
                            <p>
                                <span className="text-blue-400">student</span>.
                                <span className="text-yellow-300">
                                    practice
                                </span>
                                (
                                <span className="text-green-400">
                                    'Algorithms'
                                </span>
                                );
                            </p>
                            <br />
                            <p>
                                <span className="text-pink-500">if</span> (
                                <span className="text-blue-400">student</span>.
                                <span className="text-blue-400">
                                    isConsistent
                                </span>
                                ) {'{'}
                            </p>
                            <p className="pl-4">
                                <span className="text-blue-400">console</span>.
                                <span className="text-yellow-300">log</span>(
                                <span className="text-green-400">
                                    'Future Secured 🚀'
                                </span>
                                );
                            </p>
                            <p className="pl-4">
                                <span className="text-pink-500">return</span>{' '}
                                <span className="text-blue-400">Success</span>;
                            </p>
                            <p>{'}'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <HowItWorks />

            <section className="px-4 sm:px-10 lg:px-36 flex flex-col w-full sm:py-5">
                <h1 className="text-center text-3xl sm:text-4xl sm:my-5 w-full text-foreground font-bold">
                    Our Offerings
                </h1>
                {CoursesDescription.map((course, index) => {
                    return (
                        <OfferingCard
                            key={index}
                            title={course.title}
                            iconSrc={course.icon}
                            background={
                                theme === 'dark'
                                    ? course.darkBackground
                                    : course.lightBackground
                            }
                            descriptionList={course.points}
                            direction={index % 2 == 0 ? 'right' : 'left'}
                            invert={course.invert}
                        />
                    );
                })}
            </section>

            <div
                className="w-full h-[400px] flex justify-center items-center m-0 gap-3 flex-wrap p-4 relative"
                id="achievements-container"
            >
                {/* Secondary Glow */}
                <div className="w-11/12 backdrop-blur-lg bg-primary/20 dark:bg-primary/40 h-[50px] absolute blur-2xl dark:blur-3xl bottom-40 rounded-full -z-40 transition-colors duration-500"></div>

                <div className="border border-border bg-card/60 backdrop-blur-md h-[100px] p-3 w-[300px] flex justify-center items-center flex-col rounded-2xl achievements-left transition-colors shadow-lg">
                    <p className="text-3xl font-black text-primary">1000+</p>
                    <p className="font-semibold text-muted-foreground mt-1 tracking-wide uppercase text-sm">
                        Daily Users
                    </p>
                </div>

                <div className="border border-border bg-card/60 backdrop-blur-md h-[100px] p-3 w-[300px] flex justify-center items-center flex-col rounded-2xl transition-colors shadow-lg z-10 scale-110">
                    <p className="text-3xl font-black text-primary">1000+</p>
                    <p className="font-semibold text-muted-foreground mt-1 tracking-wide uppercase text-sm">
                        Mentored Students
                    </p>
                </div>

                <div className="border border-border bg-card/60 backdrop-blur-md h-[100px] p-3 w-[300px] flex justify-center items-center flex-col rounded-2xl achievements-right transition-colors shadow-lg">
                    <p className="text-3xl font-black text-primary">7+</p>
                    <p className="font-semibold text-muted-foreground mt-1 tracking-wide uppercase text-sm">
                        Cities
                    </p>
                </div>
            </div>

            <HorizontalScrollReviews />
            <WhyChooseUs />
            <FAQ />
        </div>
    );
};

export default LandingPage;
