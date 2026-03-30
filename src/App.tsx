import './App.css';
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { KEY_TO_PAGE_MAP, USER_ALLOWED_ROUTES } from './utils/routes';
import { isInvalid } from './utils/utils';
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

// always import the react pages with React.lazy
const Admin = React.lazy(() => import('@/pages/Admin/Admin'));

function App() {
    return (
        <>
            <Router>
                <Toaster />
                <Navbar />
                <div className="pt-16">
                    <Routes>
                        {/* --------------------------- public routes -----------------------------------  */}

                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/playground" element={<PlayGround />} />

                        {/* --------------------------- admin routes -----------------------------------  */}

                        <Route element={<AdminRoute />}>
                            <Route path="/admin" element={<Admin />} />
                        </Route>

                        {/* --------------------------- private routes ------------------------------------ */}

                        <Route element={<PrivateRoute />}>
                            {Object.keys(USER_ALLOWED_ROUTES).map(
                                (page, index: number) => {
                                    if (isInvalid(KEY_TO_PAGE_MAP[page]))
                                        return (
                                            <Route
                                                key={index}
                                                element={
                                                    <Suspense
                                                        fallback={<Spinner />}
                                                    >
                                                        <NotFoundPage />
                                                    </Suspense>
                                                }
                                                path={`/not-found`}
                                            />
                                        );
                                    else
                                        return (
                                            <Route
                                                key={index}
                                                element={
                                                    <Suspense
                                                        fallback={<Spinner />}
                                                    >
                                                        {React.createElement(
                                                            KEY_TO_PAGE_MAP[
                                                                page
                                                            ]
                                                        )}
                                                    </Suspense>
                                                }
                                                path={`${USER_ALLOWED_ROUTES[page].route}`}
                                            />
                                        );
                                }
                            )}
                        </Route>

                        <Route path="/*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </Router>
        </>
    );
}

export default App;
