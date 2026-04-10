import { Link, useLocation } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import {
    LogInIcon,
    LogOutIcon,
    Moon,
    Settings,
    ShieldUserIcon,
    Sun,
    User,
} from 'lucide-react';
import { getRole, getToken, removeUser } from '@/redux/slices/User';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { showToast } from '@/utils/toast';
import { isInvalid } from '@/utils/utils';
import { LOGOUT_ROUTE } from '@/utils/Urlpaths';
import axios from 'axios';
import Tooltip from '../Tooltip';
import { Button } from '../ui/button';
import { useTheme } from '../ui/Theme/ThemeProvider';

export default function Navbar() {
    const location = useLocation();
    const [active, setActive] = useState(location.pathname);
    const dispatch = useAppDispatch();
    const role = useAppSelector(getRole);
    const token = useAppSelector(getToken);
    const [open, setOpen] = useState(false);

    const { theme, toggleTheme } = useTheme();

    const navLinks: { title: string; url: string }[] = [
        { title: 'Home', url: '/' },
        { title: 'Courses', url: '/courses' },
        { title: 'PlayGround', url: '/playground' },
        { title: 'Contact Us', url: '/contact-us' },
    ];

    const setActiveToPath = () => {
        setActive(location.pathname);
    };

    const handleLogout = async () => {
        const response = await axios.post(LOGOUT_ROUTE, {});

        if (response.status === 200) {
            showToast({
                title: 'Success',
                description: 'Logged Out!',
                color: 'green',
            });
            dispatch(removeUser());
        } else {
            showToast({
                title: 'Error',
                description:
                    response.data.messsage ?? 'Error while logging out user!',
                color: 'red',
            });
        }
    };

    return (
        <div className="flex w-full justify-center px-4 navbar-wrapper">
            <div className="mb-10"></div>

            {/* FIX IS HERE: Changed background opacity and added shadow-sm */}
            <nav className="navbar flex rounded-xl w-11/12 justify-between border mt-4 border-l-primary/60 border-b-primary/60 border-t-0 border-r-0 backdrop-blur-md bg-secondary/70 dark:bg-background/40 shadow-sm transition-colors">
                <Link
                    to={'/'}
                    className="nav-image flex justify-end items-center"
                    style={{ height: '100%', width: '120px' }}
                >
                    <span className="text-primary font-bold text-4xl">B</span>
                    <span className="text-foreground text-lg transition-colors">
                        Brains
                    </span>
                </Link>

                <div className="nav-links w-full flex items-center justify-end">
                    <ul className="mt-3 hidden md:flex">
                        {navLinks.map((item, index: number) => (
                            <li className="mx-4 cursor-pointer" key={index}>
                                <Link
                                    key={item.url}
                                    to={item.url}
                                    className={`transition-colors ${
                                        active === item.url
                                            ? 'underline decoration-primary underline-offset-4 text-primary font-medium'
                                            : 'text-muted-foreground hover:text-foreground no-underline'
                                    }`}
                                    onClick={() => setActive(item.url)}
                                >
                                    {item.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div
                        className="nav-profile flex justify-center items-center"
                        style={{ height: '100%', width: '100px' }}
                    >
                        {!isInvalid(token) ? (
                            <DropdownMenu open={open} onOpenChange={setOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="cursor-pointer">
                                        <AvatarImage
                                            src="https://github.com/shadcn.png"
                                            className="rounded-full"
                                            alt="User Avatar"
                                            height={40}
                                            width={40}
                                        />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-40 bg-popover text-popover-foreground border border-border rounded-md mt-3 shadow-md"
                                    style={{ zIndex: 1000 }}
                                >
                                    {role === 'admin' && (
                                        <MenuItem
                                            children={
                                                <Link to={'/admin'}>Admin</Link>
                                            }
                                            icon={<ShieldUserIcon size={18} />}
                                            separator
                                            setOpen={setOpen}
                                            onClick={() => setActive('/admin')}
                                        />
                                    )}
                                    <MenuItem
                                        children={
                                            <Link to={'/profile'}>Profile</Link>
                                        }
                                        icon={<User size={18} />}
                                        setOpen={setOpen}
                                        onClick={setActiveToPath}
                                    />
                                    <MenuItem
                                        children="Settings"
                                        icon={<Settings size={18} />}
                                        setOpen={setOpen}
                                    />
                                    {!isInvalid(token) && (
                                        <MenuItem
                                            children={
                                                <button
                                                    className="w-full flex text-left"
                                                    onClick={handleLogout}
                                                >
                                                    Logout
                                                </button>
                                            }
                                            icon={<LogOutIcon size={18} />}
                                            setOpen={setOpen}
                                            onClick={setActiveToPath}
                                        />
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center h-full text-muted-foreground hover:text-foreground transition-colors">
                                <Tooltip content="Login">
                                    <Link
                                        to="/login"
                                        onClick={() => setActive('')}
                                    >
                                        <LogInIcon />
                                    </Link>
                                </Tooltip>
                            </div>
                        )}
                    </div>

                    {/* Theme Toggle Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full text-muted-foreground hover:text-foreground transition-colors ml-2 mr-2"
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
                        ) : (
                            <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
                        )}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </nav>
        </div>
    );
}

export const MenuItem = ({
    children,
    icon,
    separator,
    setOpen,
    onClick,
}: {
    children: ReactNode;
    icon: unknown;
    separator?: boolean;
    setOpen?: any;
    onClick?: any;
}) => {
    return (
        <>
            <DropdownMenuItem
                className="p-2 cursor-pointer focus:outline-none focus:bg-accent focus:text-accent-foreground text-foreground m-0 rounded-sm transition-colors"
                onClick={() => {
                    if (setOpen) setOpen((prev: boolean) => !prev);
                    if (onClick) onClick();
                }}
            >
                <div className="flex gap-2 items-center">
                    {icon as ReactNode} {children}
                </div>
            </DropdownMenuItem>
            {separator ? (
                <DropdownMenuSeparator className="h-[1px] bg-border my-1" />
            ) : null}
        </>
    );
};
