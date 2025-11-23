const Footer = () => {
    return (
        <footer className="w-full py-10 border-t border-white/10 bg-black/30 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center">
                <p className="text-white/70 text-sm">
                    © 2025 BinaryBrains. All Rights Reserved.
                </p>

                <div className="flex gap-6 mt-4 sm:mt-0 text-white/70">
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                    <a href="#">Contact</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
