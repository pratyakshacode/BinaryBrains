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
            <h1 className="text-3xl sm:text-4xl text-center text-white mb-10">
                Frequently Asked Questions
            </h1>

            <div className="w-full max-w-5xl relative">
                <Accordion
                    type="single"
                    collapsible
                    className="backdrop-blur-xl bg-white/10 border border-white/20 p-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
                >
                    {faqList.map((item, idx) => (
                        <AccordionItem key={idx} value={`item-${idx}`}>
                            <AccordionTrigger className="text-white text-lg hover:text-teal-300 transition">
                                {item.q}
                            </AccordionTrigger>

                            <AccordionContent className="text-white/70 text-sm leading-relaxed pb-4">
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
