import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

const faqList = [
    {
        q: 'Is this beginner-friendly?',
        a: 'Yes! All courses start from the basics and gradually move to intermediate and advanced levels.',
    },
    {
        q: 'Do I get lifetime access?',
        a: 'Absolutely. Once you enroll, you get lifetime access to all course materials.',
    },
    {
        q: 'Are projects included?',
        a: 'Yes. Every course includes hands-on real-world projects to help you build a strong portfolio.',
    },
    {
        q: 'Will I get a certificate?',
        a: 'Yes. After completing each course, you will receive a certificate of completion.',
    },
    {
        q: 'Do you offer doubt support?',
        a: 'Yes! You can ask doubts anytime and get guidance throughout your learning journey.',
    },
];

const FAQ = () => {
    return (
        <section
            id="faq"
            className="w-full py-16 flex flex-col items-center px-6"
        >
            {/* Swapped text-white for text-foreground */}
            <h1 className="text-3xl sm:text-4xl text-center font-bold text-foreground mb-10 transition-colors">
                Frequently Asked Questions
            </h1>

            <div className="w-full max-w-5xl relative">
                <Accordion
                    type="single"
                    collapsible
                    // Swapped bg-white/10 and border-white/20 for your dynamic card and border variables
                    className="backdrop-blur-xl bg-card/60 border border-border p-4 rounded-2xl shadow-xl transition-colors duration-300"
                >
                    {faqList.map((item, idx) => (
                        <AccordionItem
                            key={idx}
                            value={`item-${idx}`}
                            // Ensuring the bottom border of each item adapts to the theme
                            className="border-border"
                        >
                            {/* Swapped text-white for text-card-foreground and hover:text-teal-300 for hover:text-primary */}
                            <AccordionTrigger className="text-card-foreground text-lg hover:text-primary transition-colors">
                                {item.q}
                            </AccordionTrigger>

                            {/* Swapped text-white/70 for text-muted-foreground */}
                            <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 transition-colors">
                                {item.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};

export default FAQ;
