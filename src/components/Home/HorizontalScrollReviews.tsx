import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { StarIcon } from 'lucide-react';
gsap.registerPlugin(ScrollTrigger);

const reviews = [
    {
        name: 'Aarav Sharma',
        message:
            'The teaching style is clear and practical. React finally makes sense now.',
        stars: 5,
    },
    {
        name: 'Priya Verma',
        message:
            'Fastify + Node backend was explained so well. Loved the structure!',
        stars: 5,
    },
    {
        name: 'Rohan Mehta',
        message: 'Perfect for full stack development. Learned a lot.',
        stars: 4,
    },
    {
        name: 'Sneha Gupta',
        message: 'Very clean explanations. I enjoyed the projects a lot.',
        stars: 5,
    },
    {
        name: 'Ishaan Patel',
        message: 'DSA + Dev both were great. Highly recommended.',
        stars: 5,
    },
    {
        name: 'Aarav Sharma',
        message:
            'The teaching style is clear and practical. React finally makes sense now.',
        stars: 5,
    },
];

const HorizontalScrollReviews = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current || !cardsRef.current) return;

        const totalWidth = cardsRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const scrollDistance = totalWidth - viewportWidth;

        gsap.to(cardsRef.current, {
            x: -scrollDistance,
            ease: 'none',
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 30%',
                end: `+=${scrollDistance}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1,
            },
        });
    }, []);

    return (
        <div ref={containerRef} className="w-full h-[40vh] overflow-hidden">
            <h1 className="text-3xl font-bold text-center text-white mb-8 pt-10">
                What Our Students Say
            </h1>

            {/* Horizontal Wrapper */}
            <div ref={cardsRef} className="flex gap-6 px-10">
                {reviews.map((review, index) => (
                    <div
                        key={index}
                        className="w-[300px] h-auto px-5 py-6 rounded-2xl 
                       backdrop-blur-xl bg-white/10 border border-white/20 
                       shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex-shrink-0"
                    >
                        {/* Stars */}
                        <div className="flex gap-1 mb-3">
                            {[...Array(review.stars)].map((_, i) => (
                                <StarIcon key={i} className="text-yellow-400" />
                            ))}
                        </div>

                        {/* Message */}
                        <p className="text-white/90 text-sm leading-relaxed mb-3">
                            "{review.message}"
                        </p>

                        {/* Name */}
                        <p className="text-white font-semibold text-right">
                            — {review.name}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HorizontalScrollReviews;
