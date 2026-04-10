import brainImage from '@/assets/computer.png';
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

const LandingPage = () => {
    const { theme } = useTheme();

    useGSAP(() => {
        // HERO ANIMATIONS
        gsap.fromTo(
            '.appear',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.15, duration: 1 }
        );

        gsap.fromTo(
            '.image-appear',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 }
        );

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
        <>
            {/* HERO SECTION */}
            <div
                className="w-full flex justify-center m-0"
                style={{ height: '90vh' }}
            >
                <div className="hero-section flex flex-col md:flex-row gap-0 h-full rounded-3xl backdrop-blur-sm w-11/12 relative items-center justify-center">
                    {/* Glowing effect now uses your brand's --primary variable */}
                    <div className="w-9/12 backdrop-blur-lg bg-primary/20 dark:bg-primary/40 h-[70vh] absolute blur-[150px] dark:blur-[200px] bottom-24 rounded-full -z-40 transition-colors duration-500"></div>

                    <div className="left-content-section w-full flex flex-col gap-5 justify-center items-center h-full">
                        {/* Using text-foreground automatically adapts to black/white based on theme */}
                        <h1 className="text-foreground text-4xl mt-10 text-center md:text-6xl font-bold appear">
                            Enlight Your Future
                        </h1>
                        <h1 className="text-foreground text-4xl md:text-6xl font-bold text-center appear">
                            With Us
                        </h1>
                        {/* Using text-muted-foreground for subtitles */}
                        <h2 className="text-muted-foreground text-center text-lg appear">
                            We provide the best courses for your future and for
                            your career
                        </h2>

                        <Button
                            onClick={() => {
                                showToast({
                                    title: 'Hello world',
                                    description:
                                        'Exploring the courses with notification',
                                    duration: 1500,
                                });
                            }}
                            className="w-6/12"
                        >
                            Explore Courses
                        </Button>
                    </div>

                    <div className="right-content-section flex h-full justify-center items-center w-full m-0">
                        <img
                            src={brainImage}
                            alt="brain"
                            className="w-full h-4/6 image-appear"
                        />
                    </div>
                </div>
            </div>

            <HowItWorks />

            <section className="px-36 flex flex-col w-full sm:py-5">
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

                {/* Using bg-card and border-border to naturally adapt to the theme */}
                <div className="border border-border bg-card/60 backdrop-blur-md h-[100px] p-3 w-[300px] flex justify-center items-center flex-col rounded-2xl achievements-left transition-colors">
                    <p className="text-2xl font-bold text-primary">1000+</p>
                    <p className="font-medium text-card-foreground">
                        Daily Users
                    </p>
                </div>

                <div className="border border-border bg-card/60 backdrop-blur-md h-[100px] p-3 w-[300px] flex justify-center items-center flex-col rounded-2xl transition-colors">
                    <p className="text-2xl font-bold text-primary">1000+</p>
                    <p className="font-medium text-card-foreground">
                        Mentored Students
                    </p>
                </div>

                <div className="border border-border bg-card/60 backdrop-blur-md h-[100px] p-3 w-[300px] flex justify-center items-center flex-col rounded-2xl achievements-right transition-colors">
                    <p className="text-2xl font-bold text-primary">7+</p>
                    <p className="font-medium text-card-foreground">Cities</p>
                </div>
            </div>

            <HorizontalScrollReviews />
            <WhyChooseUs />
            <FAQ />
        </>
    );
};

export default LandingPage;
