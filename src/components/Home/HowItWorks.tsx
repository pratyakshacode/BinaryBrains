const steps = [
    {
        title: 'Learn Concepts',
        desc: 'Understand each topic clearly with simple & clean explanations.',
    },
    {
        title: 'Practice Problems',
        desc: 'Apply your learning with hands-on coding tasks and challenges.',
    },
    {
        title: 'Build Projects',
        desc: 'Work on real-world full stack projects to build confidence.',
    },
    {
        title: 'Grow & Level Up',
        desc: 'Track your progress and continue improving your skills.',
    },
];

const HowItWorks = () => {
    return (
        <section className="w-full relative">
            {/* Swapped text-white for text-foreground */}
            <h1 className="text-center text-3xl sm:text-4xl text-foreground font-bold mb-10 transition-colors">
                How It Works
            </h1>

            <div className="flex flex-col sm:flex-row justify-center gap-8 px-6">
                {/* Updated Glow Effect to use the primary variable */}
                <div className="w-10/12 backdrop-blur-lg bg-primary/20 dark:bg-primary/40 h-[70px] absolute blur-3xl sm:bottom-36 rounded-full -z-40 transition-colors duration-500"></div>

                {steps.map((step, idx) => (
                    <div
                        key={idx}
                        // Used bg-card/60 and border-border for adaptive frosted glass
                        className="backdrop-blur-xl bg-card/60 border border-border flex flex-col 
                       items-center text-center p-6 rounded-2xl w-full sm:w-[250px] transition-colors hover:bg-card/80 duration-300"
                    >
                        {/* Numbers now use your brand's primary color */}
                        <div className="text-4xl text-primary font-bold mb-3">
                            {idx + 1}
                        </div>
                        {/* Titles adapt to the active theme's card text color */}
                        <h2 className="text-xl text-card-foreground font-semibold transition-colors">
                            {step.title}
                        </h2>
                        {/* Descriptions use muted-foreground for softer contrast */}
                        <p className="text-muted-foreground text-sm mt-2 transition-colors">
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HowItWorks;
