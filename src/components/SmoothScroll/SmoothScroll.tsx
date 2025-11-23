import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

const SmoothScroll = () => {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1, // smoothness
            easing: t => 1 - Math.pow(1 - t, 3), // custom easing (Apple-like)
            smoothWheel: true,
            touchMultiplier: 2,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    }, []);

    return null;
};

export default SmoothScroll;
