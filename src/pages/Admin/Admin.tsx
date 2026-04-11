import React from 'react';
import { useState } from 'react';
import { ADMIN_MENU_TO_PAGES_MAP } from './adminUtils';
import { isInvalid } from '@/utils/utils';
import NotFoundPage from '../Error/NotFound';

const Admin = () => {
    const [selected] = useState<string>('admin_pages');

    return (
        <div className="flex p-5 text-white justify-center min-h-screen">
            <div className="controller-container w-10/12 h-full border border-gray-500 rounded-xl ml-1 overflow-auto">
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
