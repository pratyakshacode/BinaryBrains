import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface OfferingCardProps {
    iconSrc: any;
    descriptionList: string[];
    title: string;
    background: string;
    direction: 'left' | 'right';
}

const OfferingCard = ({
    iconSrc,
    descriptionList,
    title,
    background,
    direction,
}: OfferingCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!cardRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: cardRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
            },
        });

        const offset = direction === 'right' ? -50 : 50;

        tl.fromTo(
            cardRef.current.querySelector('.offering-icon'),
            { opacity: 0, x: offset },
            { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }
        );

        tl.fromTo(
            cardRef.current.querySelector('.offering-title'),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4 },
            '-=0.4'
        );

        tl.fromTo(
            cardRef.current.querySelectorAll('.offering-list li'),
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.2, stagger: 0.12 },
            '-=0.3'
        );
    }, []);

    return (
        <div
            ref={cardRef}
            className={`flex flex-col ${
                direction === 'right' ? 'sm:flex-row' : 'sm:flex-row-reverse'
            } items-center w-full gap-5 mt-10`}
        >
            {/* FIXED: className instead of broken id */}
            <div className="offering-icon w-full flex justify-center">
                <img src={iconSrc} className="h-[20vh] sm:h-[20vh]" />
            </div>

            <div
                className="w-[300px] sm:w-full flex flex-col items-center justify-center rounded-2xl p-6 gap-4
                   backdrop-blur-xl bg-white/10 border border-white/20 
                   shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
                style={{ background }}
            >
                <h1 className="offering-title text-2xl font-semibold text-white text-center">
                    {title}
                </h1>

                <ul className="offering-list text-white/90 text-sm space-y-2 w-11/12">
                    {descriptionList.map((description, idx) => (
                        <li key={idx} className="leading-relaxed">
                            {description}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default OfferingCard;
