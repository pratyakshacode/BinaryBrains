import { Link } from 'react-router-dom';

const Footer = () => {
    // Dynamically get the current year so it's always up to date!
    const currentYear = new Date().getFullYear();

    return (
        // Swapped bg-black/30 for the exact same adaptive glass effect used in your Navbar
        <footer className="w-full py-8 border-t border-border bg-secondary/30 dark:bg-background/40 backdrop-blur-xl transition-colors mt-5">
            <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                {/* Brand & Copyright Section */}
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                    {/* Added the BBrains logo mark to make it look like a premium app footer */}
                    <Link
                        to="/"
                        className="text-xl font-bold flex items-center"
                    >
                        <span className="text-primary">B</span>
                        <span className="text-foreground transition-colors">
                            Brains
                        </span>
                    </Link>

                    <span className="hidden md:block text-muted-foreground/30">
                        |
                    </span>

                    {/* Swapped text-white/70 for text-muted-foreground */}
                    <p className="text-muted-foreground text-sm transition-colors text-center md:text-left">
                        © {currentYear} BinaryBrains. All Rights Reserved.
                    </p>
                </div>

                {/* Footer Links */}
                <div className="flex gap-6 text-sm text-muted-foreground">
                    <Link
                        to="#"
                        className="hover:text-primary transition-colors"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        to="#"
                        className="hover:text-primary transition-colors"
                    >
                        Terms of Service
                    </Link>
                    <Link
                        to="/contact-us"
                        className="hover:text-primary transition-colors"
                    >
                        Contact Us
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
