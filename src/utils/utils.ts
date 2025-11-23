import ReactIcon from '@/assets/react.svg';
import NodeIcon from '@/assets/nodejs.svg';
import Stack from '@/assets/stack.svg';

export function isInvalid(value: unknown): boolean {
    return (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && Object.keys(value || {}).length === 0) ||
        (typeof value === 'number' && isNaN(value))
    );
}

export const CoursesDescription = [
    {
        title: 'React JS',
        points: [
            'Build modern, fast, and scalable web apps',
            'Learn components, hooks, and state management',
            'Work with real-world projects & APIs',
            'Master best practices used by top developers',
        ],
        icon: ReactIcon,
        background: 'linear-gradient(90deg, black, #047aaa)',
    },
    {
        title: 'Node JS',
        points: [
            'Build fast and scalable backend applications',
            'Learn APIs, routing, middleware, and async programming',
            'Work with databases, authentication, and real-world projects',
            'Master production-ready backend best practices',
        ],
        icon: NodeIcon,
        background: 'linear-gradient(270deg, black, #3b9302)',
    },
    {
        title: 'Databases (MongoDB + SQL)',
        points: [
            'Understand core database concepts and data modeling',
            'Learn MongoDB for NoSQL document-based applications',
            'Learn SQL for relational, structured, and transactional systems',
            'Work with queries, schemas, indexing, and real-world databases',
        ],
        icon: Stack,
        background: 'linear-gradient(90deg, black, #b3105c)',
    },
];
