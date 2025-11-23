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
        <section className="w-full py-20 relative">
            <h1 className="text-center text-3xl sm:text-4xl text-white mb-10">
                How It Works
            </h1>

            <div className="flex flex-col sm:flex-row justify-center gap-8 px-6">
                <div className="w-10/12 backdrop-blur-lg bg-teal-800 h-[70px] absolute blur-3xl sm:bottom-36 rounded-full -z-40"></div>
                {steps.map((step, idx) => (
                    <div
                        key={idx}
                        className="backdrop-blur-xl bg-white/10 border border-white/20 flex flex-col 
                       items-center text-center p-6 rounded-2xl w-full sm:w-[250px]"
                    >
                        <div className="text-4xl text-teal-300 font-bold mb-3">
                            {idx + 1}
                        </div>
                        <h2 className="text-xl text-white font-semibold">
                            {step.title}
                        </h2>
                        <p className="text-white/80 text-sm mt-2">
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HowItWorks;
