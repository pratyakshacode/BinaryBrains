import React from 'react';
import { useState } from 'react';
import { ADMIN_MENU_TO_PAGES_MAP } from './adminUtils';
import { isInvalid } from '@/utils/utils';
import NotFoundPage from '../Error/NotFound';
import { ShieldIcon, UserRoundCog } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
} from '@/components/ui/BreadCrumb/BreadCrumb';

const Admin = () => {
    const [selected] = useState<string>('admin_pages');
    const items: BreadcrumbItem[] = [
        { title: 'Home', url: '/' },
        { title: 'Admin', url: '/admin' },
    ];

    return (
        <div className="flex text-foreground items-center min-h-screen flex-col relative">
            <div className="w-full max-w-6xl flex justify-start mt-5">
                <Breadcrumb items={items} />
            </div>
            <div className="fixed top-10 right-10 w-[500px] h-[500px] bg-primary/40 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-10 left-10 w-[400px] h-[400px] bg-primary/40 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="w-full max-w-6xl flex items-center gap-3 mb-5">
                <UserRoundCog className="text-primary" size={36} />
                <h1 className="text-left text-3xl font-bold">Admin Options</h1>
            </div>
            <div className="controller-container w-full max-w-6xl h-full border border-border rounded-xl overflow-auto">
                {isInvalid(ADMIN_MENU_TO_PAGES_MAP[selected]) ? (
                    <NotFoundPage />
                ) : (
                    React.createElement(ADMIN_MENU_TO_PAGES_MAP[selected])
                )}
            </div>
        </div>
    );
};

export default Admin;
