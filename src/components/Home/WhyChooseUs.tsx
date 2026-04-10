const features = [
    {
        title: 'Project Based Learning',
        desc: 'Every course includes real world projects to help you build strong hands-on skills.',
    },
    {
        title: 'Beginner Friendly',
        desc: 'Start from basics and grow to advanced topics with structured guidance.',
    },
    {
        title: 'Modern Tech Stack',
        desc: 'Learn React, Node, Fastify, MongoDB, SQL and more in a practical flow.',
    },
    {
        title: 'Doubt Support',
        desc: "Get help quickly whenever you're stuck during your learning.",
    },
];

const WhyChooseUs = () => {
    return (
        <section className="w-full py-20 flex flex-col items-center gap-10 relative">
            <div className="w-full backdrop-blur-lg bg-teal-700 h-[50px] absolute blur-3xl bottom-56 sm:bottom-36 rounded-full -z-40"></div>
            {/* Swapped bg-teal-700 for dynamic primary glow */}
            <div className="w-full backdrop-blur-lg bg-primary/20 dark:bg-primary/40 h-[50px] absolute blur-3xl bottom-56 sm:bottom-36 rounded-full -z-40 transition-colors duration-500"></div>

            {/* Swapped text-white for text-foreground */}
            <h1 className="text-3xl sm:text-4xl text-center font-bold text-foreground transition-colors">
                Why Choose Us?
            </h1>

            <div className="max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
                {features.map((item, idx) => (
                    <div
                        key={idx}
                        // Swapped bg-white/10 and border-white/20 for dynamic card variables
                        className="backdrop-blur-xl bg-card/60 border border-border p-5 rounded-2xl 
                       shadow-xl transition-colors duration-300 hover:bg-card/80"
                    >
                        {/* Swapped text-white for text-card-foreground */}
                        <h2 className="text-xl text-card-foreground font-semibold mb-2 transition-colors">
                            {item.title}
                        </h2>
                        {/* Swapped text-white/80 for text-muted-foreground */}
                        <p className="text-muted-foreground text-sm transition-colors">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WhyChooseUs;
