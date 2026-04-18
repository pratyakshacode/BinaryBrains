import { JSX, lazy } from 'react';
const MCQs = lazy(() => import('@/pages/MCQs/McqListPage'));
const Articles = lazy(() => import('@/pages/Article/AllArticles'));

export enum PERMISSIONS {
    READ = 'read',
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
}

export const USER_ALLOWED_ROUTES: Record<
    string,
    { route: string; permissions: string[] }
> = {
    USERS: {
        route: '/users',
        permissions: ['read'],
    },
    MCQS: {
        route: 'admin/mcqs',
        permissions: ['read', 'create'],
    },
    ARTICLES: {
        route: '/admin/article',
        permissions: ['read', 'create'],
    },
} as const;

export const KEY_TO_PAGE_MAP: Record<
    string,
    React.LazyExoticComponent<
        ({ permissions }: { permissions: any }) => JSX.Element
    >
> = {
    MCQS: MCQs,
    ARTICLES: Articles,
};
