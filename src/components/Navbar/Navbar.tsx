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
    Settings,
    ShieldUserIcon,
    User,
} from 'lucide-react';
import { getRole, getToken, removeUser } from '@/redux/slices/User';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { showToast } from '@/utils/toast';
import { isInvalid } from '@/utils/utils';
import { LOGOUT_ROUTE } from '@/utils/Urlpaths';
import axios from 'axios';
import Tooltip from '../CustomTooltip';

export default function Navbar() {
    const location = useLocation();
    const [active, setActive] = useState(location.pathname);
    const dispatch = useAppDispatch();
    const role = useAppSelector(getRole);
    const token = useAppSelector(getToken);
    const [open, setOpen] = useState(false);

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
            <nav className="navbar flex rounded-xl w-11/12 justify-between border mt-4 border-l-teal-400 border-b-teal-400 border-t-0 border-r-0 backdrop-blur-sm">
                <Link
                    to={'/'}
                    className="nav-image flex justify-end items-center"
                    style={{ height: '100%', width: '120px' }}
                >
                    <span className="text-teal-600 font-bold text-4xl">B</span>
                    <span className="text-teal-200 text-lg">Brains</span>
                </Link>

                <div className="nav-links w-full flex items-center justify-end">
                    <ul className="mt-3 hidden md:flex">
                        {navLinks.map((item, index: number) => (
                            <li className="mx-4 cursor-pointer" key={index}>
                                <Link
                                    key={item.url}
                                    to={item.url}
                                    className={`${
                                        active === item.url
                                            ? 'underline decoration-teal-300 underline-offset-4 text-teal-500'
                                            : 'text-teal-100 no-underline'
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
                                            className="rounded-3xl"
                                            alt="User Avatar"
                                            height={45}
                                            width={45}
                                        />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-40 bg-white border border-gray-200 rounded-sm mt-3"
                                    style={{ zIndex: 1000 }}
                                >
                                    {role === 'admin' && (
                                        <MenuItem
                                            children={
                                                <Link to={'/admin'}>Admin</Link>
                                            }
                                            icon={<ShieldUserIcon />}
                                            separator
                                            setOpen={setOpen}
                                            onClick={() => setActive('/admin')}
                                        />
                                    )}
                                    <MenuItem
                                        children={
                                            <Link to={'/profile'}>Profile</Link>
                                        }
                                        icon={<User />}
                                        setOpen={setOpen}
                                        onClick={setActiveToPath}
                                    />
                                    <MenuItem
                                        children="Settings"
                                        icon={<Settings />}
                                        setOpen={setOpen}
                                    />
                                    {!isInvalid(token) && (
                                        <MenuItem
                                            children={
                                                <button
                                                    className="w-full flex"
                                                    onClick={handleLogout}
                                                >
                                                    Logout
                                                </button>
                                            }
                                            icon={<LogOutIcon />}
                                            setOpen={setOpen}
                                            onClick={setActiveToPath}
                                        />
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center  h-full text-gray-300">
                                <Tooltip content="Login">
                                    <Link
                                        to="/login"
                                        className="mt-3"
                                        onClick={() => setActive('')}
                                    >
                                        <LogInIcon />
                                    </Link>
                                </Tooltip>
                            </div>
                        )}
                    </div>
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
                className="p-2 hover:bg-gray-600 cursor-pointer focus:outline-none focus:ring-0 bg-background text-black m-0"
                onClick={() => {
                    setOpen((prev: boolean) => !prev);
                    onClick();
                }}
            >
                <div className="flex gap-2 items-center">
                    {icon as ReactNode} {children}
                </div>
            </DropdownMenuItem>
            {separator ? (
                <DropdownMenuSeparator className="h-[1px] bg-gray-700 my-1" />
            ) : null}
        </>
    );
};
