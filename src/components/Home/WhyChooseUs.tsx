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
            <h1 className="text-3xl sm:text-4xl text-center text-white">
                Why Choose Us?
            </h1>

            <div className="max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
                {features.map((item, idx) => (
                    <div
                        key={idx}
                        className="backdrop-blur-xl bg-white/10 border border-white/20 p-5 rounded-2xl 
                       shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
                    >
                        <h2 className="text-xl text-white font-semibold mb-2">
                            {item.title}
                        </h2>
                        <p className="text-white/80 text-sm">{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WhyChooseUs;
