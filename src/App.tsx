import './App.css';
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Spinner from './components/Loader/Spinner';
import NotFoundPage from './pages/Error/NotFound';
import Navbar from './components/Navbar/Navbar';
import LandingPage from './pages/Home/LandingPage';
import LoginPage from './pages/LoginPage/LoginPage';
import { Toaster } from './components/ui/toaster';
import SignUp from './pages/LoginPage/SignUp';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import AdminRoute from './components/AdminRoute/AdminRoute';
import PlayGround from './pages/PlayGround/PlayGround';
import Footer from './components/Footer/Footer';
import ShowArticle from './pages/Article/ShowArticle';
import AllArticles from './pages/Article/AllArticles';
import CreateArticle from './pages/Article/CreateArticle';
import ConfirmModal from './components/Modal/ConfirmModal';
import McqListPage from './pages/MCQs/McqListPage';
import CreateMcqPage from './pages/MCQs/MCQs';
import QuizGround from './pages/PlayGround/QuizGround';
import QuizPlayerPage from './pages/PlayGround/QuizPlayerPage';
import CodeGround from './pages/PlayGround/CodeGround';
import CourseLab from './components/Course/CourseLab';
import { CourseList } from './pages/Course/CoursesList';
import { StudentCourseCatalog } from './pages/Course/StudentCourseCatelog';
import { CourseDetail } from './pages/Course/CourseDetail';
import { LearnWorkspace } from './pages/Course/Learn/LearnWorkspace';

// always import the react pages with React.lazy
const Admin = React.lazy(() => import('@/pages/Admin/Admin'));

function App() {
    return (
        <>
            <Router>
                <ConfirmModal />
                <Toaster />
                <Navbar />
                <div className="pt-16">
                    <Routes>
                        {/* --------------------------- public routes -----------------------------------  */}

                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/playground" element={<PlayGround />} />

                        <Route
                            path="/playground/sandbox"
                            element={
                                <Suspense fallback={<Spinner />}>
                                    <CodeGround />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/playground/quiz/play/:sectionId"
                            element={
                                <Suspense fallback={<Spinner />}>
                                    <QuizPlayerPage />
                                </Suspense>
                            }
                        />

                        <Route
                            path="/playground/quizzes"
                            element={
                                <Suspense fallback={<Spinner />}>
                                    <QuizGround />
                                </Suspense>
                            }
                        />

                        {/* --------------------------- admin routes -----------------------------------  */}

                        <Route element={<AdminRoute />}>
                            <Route path="/admin" element={<Admin />} />
                            <Route
                                path="/admin/article/create"
                                element={
                                    <Suspense fallback={<Spinner />}>
                                        <CreateArticle />
                                    </Suspense>
                                }
                            />

                            <Route
                                path="/admin/article"
                                element={
                                    <Suspense fallback={<Spinner />}>
                                        <AllArticles />
                                    </Suspense>
                                }
                            />

                            <Route
                                path="/admin/article/:articleId/update"
                                element={
                                    <Suspense fallback={<Spinner />}>
                                        <CreateArticle />
                                    </Suspense>
                                }
                            />

                            <Route
                                path="/admin/mcq"
                                element={
                                    <Suspense fallback={<Spinner />}>
                                        <McqListPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path="/admin/mcq/create"
                                element={
                                    <Suspense fallback={<Spinner />}>
                                        <CreateMcqPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path="/admin/course/create"
                                element={
                                    <Suspense fallback={<Spinner />}>
                                        <CourseLab />
                                    </Suspense>
                                }
                            />
                            <Route
                                path="/admin/course"
                                element={
                                    <Suspense fallback={<Spinner />}>
                                        <CourseList />
                                    </Suspense>
                                }
                            />
                            <Route
                                path="/admin/course/:courseId/edit"
                                element={
                                    <Suspense fallback={<Spinner />}>
                                        <CourseLab />
                                    </Suspense>
                                }
                            />
                        </Route>

                        {/* --------------------------- private routes ------------------------------------ */}

                        <Route element={<PrivateRoute />}>
                            <Route
                                path="/article/:articleId"
                                element={
                                    <Suspense fallback={<Spinner />}>
                                        <ShowArticle />
                                    </Suspense>
                                }
                            />
                        </Route>
                        <Route
                            path="/courses"
                            element={
                                <Suspense fallback={<Spinner />}>
                                    <StudentCourseCatalog />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/course/:courseId"
                            element={
                                <Suspense fallback={<Spinner />}>
                                    <CourseDetail />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/course/:courseId/learn"
                            element={
                                <Suspense fallback={<Spinner />}>
                                    <LearnWorkspace />
                                </Suspense>
                            }
                        />

                        <Route path="/*" element={<NotFoundPage />} />
                    </Routes>
                </div>
                <Footer />
            </Router>
        </>
    );
}

export default App;
