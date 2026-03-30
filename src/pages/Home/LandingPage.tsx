import brainImage from '@/assets/brain.svg';
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
import Footer from '@/components/Footer/Footer';

const LandingPage = () => {
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
                    start: 'top 85%', // when section just enters viewport
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
                style={{ height: '90vh', paddingTop: '70px' }}
            >
                <div
                    className="hero-section flex flex-col md:flex-row gap-0 h-full rounded-3xl backdrop-blur-sm w-11/12 relative items-center justify-center"
                    // style={{ background: 'radial-gradient(circle at 50% 50%, teal, black)' }}
                >
                    <div className="w-9/12 backdrop-blur-lg bg-teal-900 h-[70vh] absolute blur-[200px] bottom-24 rounded-full -z-40"></div>
                    <div className="left-content-section w-full flex flex-col gap-5 justify-center items-center h-full">
                        <h1 className="text-white text-4xl mt-10 text-center md:text-6xl appear">
                            Enlight Your Future
                        </h1>
                        <h1 className="text-white text-4xl md:text-6xl text-center appear">
                            With Us
                        </h1>
                        <h2 className="text-white text-center appear">
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
                            className="appear w-5/12 text-black"
                            variant={'outline'}
                        >
                            Explore Courses
                        </Button>
                    </div>

                    <div className="right-content-section flex h-full justify-center items-center w-full m-0">
                        <img
                            src={brainImage}
                            alt="brain"
                            className="w-4/6 h-4/6 image-appear"
                        />
                    </div>
                </div>
            </div>
            <HowItWorks />
            <section className="px-36 flex flex-col w-full sm:py-5">
                <h1 className="text-center text-3xl sm:text-4xl sm:my-5 w-full">
                    Our Offerings
                </h1>
                {CoursesDescription.map((course, index) => {
                    return (
                        <OfferingCard
                            title={course.title}
                            iconSrc={course.icon}
                            background={course.background}
                            descriptionList={course.points}
                            direction={index % 2 == 0 ? 'right' : 'left'}
                        />
                    );
                })}
            </section>

            <div
                className="w-full h-[400px] flex justify-center items-center m-0 gap-3 flex-wrap p-4 relative"
                id="achievements-container"
            >
                <div className="w-11/12 backdrop-blur-lg bg-teal-700 h-[50px] absolute blur-3xl bottom-40 rounded-full -z-40"></div>
                <div className="border h-[100px] p-3 w-[300px] flex justify-center items-center flex-col rounded-2xl achievements-left">
                    <p>1000+</p>
                    <p>Daily Users</p>
                </div>

                <div className="border h-[100px] p-3 w-[300px] flex justify-center items-center flex-col rounded-2xl">
                    <p>1000+</p>
                    <p>Mentored Students</p>
                </div>

                <div className="border h-[100px] p-3 w-[300px] flex justify-center items-center flex-col rounded-2xl achievements-right">
                    <p>7+</p>
                    <p>Cities</p>
                </div>
            </div>

            <HorizontalScrollReviews />
            <WhyChooseUs />
            <FAQ />
            <Footer />
        </>
    );
};

export default LandingPage;
