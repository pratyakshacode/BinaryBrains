import { Link } from 'react-router-dom';
import { AdminPagesType, adminPages } from './adminUtils';

const AdminPages = () => {
    return (
        <div className="md:p-10 flex justify-center w-full">
            <div className="flex flex-wrap p-4 w-5/6 justify-center gap-4">
                {adminPages.map((pageDetail: AdminPagesType) => {
                    // Always move the 'key' to the outermost element in a map!
                    return (
                        <PageCard key={pageDetail.identifier} {...pageDetail} />
                    );
                })}
            </div>
        </div>
    );
};

export const PageCard = ({
    icon: Icon,
    identifier, // You can omit this from destructuring if you only use it for the key, which is now handled in the map above
    title,
    url,
}: AdminPagesType) => {
    return (
        <Link
            to={url}
            // Added 'group' for synchronized hover effects.
            // Swapped hardcoded borders for border-border and bg-card/60
            className="group flex flex-col border border-border bg-card/60 backdrop-blur-xl m-2 justify-between rounded-2xl p-3 transition-all duration-300 hover:bg-card/80 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
            style={{ height: 170, width: 170 }}
        >
            <div className="page-card-icon flex justify-center items-center h-[70%]">
                {/* The icon starts as muted gray, but turns to your brand primary color when hovered! */}
                <Icon
                    size={60}
                    className="text-muted-foreground transition-colors duration-300 group-hover:text-primary"
                />
            </div>

            <div
                // Removed the hardcoded black gradient.
                // Replaced with a dynamic primary-tinted background that adapts to dark/light mode
                className="page-card-title text-center py-2 flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 transition-colors"
            >
                <span className="text-sm font-semibold text-primary tracking-wide">
                    {title}
                </span>
            </div>
        </Link>
    );
};

export default AdminPages;
