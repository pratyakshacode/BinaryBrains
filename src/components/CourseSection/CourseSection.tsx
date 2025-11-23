import CourseCard from './CourseCard';
import DataStructures from '@/assets/dataStructures.png';

const CoursesSection = () => {
    return (
        <>
            <h1 className="text-center">Our Top Courses</h1>
            <div className="w-full flex flex-wrap gap-6 justify-center p-10">
                <CourseCard
                    imageSrc={DataStructures}
                    title="React JS"
                    description="Learn to build fast, modern and scalable front-end applications using React hooks, components and real-world projects."
                />

                <CourseCard
                    imageSrc="https://images.unsplash.com/photo-1518773553398-650c184e0bb3"
                    title="Node JS"
                    description="Master backend development with Node.js, APIs, authentication, databases and real production-ready patterns."
                />

                <CourseCard
                    imageSrc="https://images.unsplash.com/photo-1505678261036-a3fcc5e884ee"
                    title="Full Stack"
                    description="Become a complete developer by learning React, Node.js, databases, APIs, deployment and system design essentials."
                />
            </div>
        </>
    );
};

export default CoursesSection;
