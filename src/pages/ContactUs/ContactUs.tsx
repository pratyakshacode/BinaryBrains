import { useState } from 'react';
import {
    Mail,
    Phone,
    MapPin,
    Send,
    MessageSquare,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ContactUs = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate an API call
        setTimeout(() => {
            setIsSubmitting(false);
            alert('Message Sent successfully! We will get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1500);
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-[#050b14] flex flex-col animate-in fade-in duration-700 transition-colors">
            {/* --- GLASSMORPHISM BACKGROUND GLOWS --- */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] dark:blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] dark:blur-[150px] pointer-events-none translate-y-1/3 -translate-x-1/3"></div>
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[100px] dark:blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

            {/* --- HERO SECTION --- */}
            <div className="w-full relative z-10 pt-20 pb-12 lg:pt-28 lg:pb-16 text-center px-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white transition-colors">
                    Get in{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-500">
                        Touch
                    </span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed transition-colors">
                    Have a question about our courses, weekend bootcamps, or
                    want to collaborate? We would love to hear from you. Drop us
                    a message below.
                </p>
            </div>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="flex-1 max-w-7xl mx-auto w-full px-6 pb-24 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 relative z-10">
                {/* LEFT COLUMN: Contact Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Binary Brains Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-extrabold text-3xl shadow-lg shadow-teal-500/20 dark:shadow-[0_0_20px_rgba(45,212,191,0.3)]">
                            B
                        </div>
                        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">
                            Brains
                        </span>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
                            Contact Information
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 transition-colors">
                            Reach out to us directly through email or phone. We
                            aim to respond to all inquiries within 24 hours.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Email Card (Responsive Glass) */}
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-teal-500/50 hover:bg-white/80 dark:hover:bg-white/10 transition-all shadow-xl shadow-slate-200/40 dark:shadow-lg group">
                            <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0 group-hover:bg-teal-500/20 transition-colors text-teal-600 dark:text-teal-400">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Email Us
                                </h4>
                                <a
                                    href="mailto:pratyakshaverma2018@gmail.com"
                                    className="text-base font-semibold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors break-all"
                                >
                                    pratyakshaverma2018@gmail.com
                                </a>
                            </div>
                        </div>

                        {/* Phone Card (Responsive Glass) */}
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 hover:bg-white/80 dark:hover:bg-white/10 transition-all shadow-xl shadow-slate-200/40 dark:shadow-lg group">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 transition-colors text-cyan-600 dark:text-cyan-400">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Call Us
                                </h4>
                                <a
                                    href="tel:+918171180311"
                                    className="text-base font-semibold text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                >
                                    +91 81711 80311
                                </a>
                            </div>
                        </div>

                        {/* Location Card (Responsive Glass) */}
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-white/80 dark:hover:bg-white/10 transition-all shadow-xl shadow-slate-200/40 dark:shadow-lg group">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors text-blue-600 dark:text-blue-400">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Location
                                </h4>
                                <p className="text-base font-semibold text-slate-900 dark:text-white">
                                    Roorkee, Uttarakhand
                                    <br />
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        India
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Contact Form (Responsive Glass) */}
                <div className="lg:col-span-3">
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden transition-colors">
                        {/* Decorative subtle background icon */}
                        <MessageSquare className="absolute -bottom-10 -right-10 w-64 h-64 text-slate-100 dark:text-white/5 pointer-events-none rotate-12 transition-colors" />

                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 transition-colors">
                                Send us a Message
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Name Input */}
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="name"
                                            className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                                        >
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        />
                                    </div>

                                    {/* Email Input */}
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="email"
                                            className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                                        >
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>

                                {/* Subject Input */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="subject"
                                        className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                                    >
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="How can we help you?"
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                </div>

                                {/* Message Textarea */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="message"
                                        className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                                    >
                                        Your Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Write your message here..."
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none custom-scrollbar"
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-xl bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 text-white shadow-lg shadow-teal-500/30 dark:shadow-[0_0_15px_rgba(20,184,166,0.2)] dark:hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] border border-transparent dark:border-teal-400/50 transition-all gap-2 flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2
                                                size={20}
                                                className="animate-spin text-white"
                                            />
                                            <span className="text-white">
                                                Sending...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Send
                                                size={20}
                                                className="text-white"
                                            />
                                            <span className="text-white">
                                                Send Message
                                            </span>
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
