import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface CourseCardProps {
    imageSrc: string;
    title: string;
    description: string;
}

const CourseCard = ({ imageSrc, title, description }: CourseCardProps) => {
    const cardRef = useRef(null);

    useGSAP(() => {
        if (!cardRef.current) return;

        gsap.fromTo(
            cardRef.current,
            {
                opacity: 0,
            },
            {
                opacity: 1,
                duration: 2,
                scrollTrigger: {
                    trigger: cardRef.current,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
            }
        );
    }, []);

    return (
        <div
            className="w-full max-w-sm rounded-2xl overflow-hidden 
        backdrop-blur-xl bg-white/10 border border-white/20 
        shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex flex-col"
            ref={cardRef}
        >
            {/* IMAGE */}
            <img
                src={imageSrc}
                className="w-full h-48 object-cover"
                alt={title}
            />

            {/* CONTENT */}
            <div className="p-5 flex flex-col gap-3">
                <h2 className="text-xl font-semibold text-white">{title}</h2>

                <p className="text-white/80 text-sm leading-relaxed">
                    {description}
                </p>

                <Button
                    variant="outline"
                    className="w-full mt-2 text-black font-semibold"
                >
                    Go to Course
                </Button>
            </div>
        </div>
    );
};

export default CourseCard;
