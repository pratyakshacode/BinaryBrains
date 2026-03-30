import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { Navigate, useNavigate } from 'react-router-dom';
import { GOOGLE_LOGIN_ROUTE, MAIL_LOGIN_ROUTE } from '@/utils/Urlpaths';
import { useDispatch } from 'react-redux';
import { getIsLoggedIn, setUser } from '@/redux/slices/User';
import { showToast } from '@/utils/toast';
import { Input } from '@/components/ui/input';
import { EyeClosed, Eye, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRequest } from '@/utils/request';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isLoggedIn = useAppSelector(getIsLoggedIn);

    const request = useRequest(); // 🔥 create request instance

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // ---------------- Google Login ---------------- //
    const googleResponse = async (res: CredentialResponse) => {
        try {
            const token = res.credential;

            if (!token) {
                showToast({
                    title: 'ERROR',
                    description: 'No credential returned from Google',
                    color: 'red',
                });
                return;
            }

            setIsLoading(true);

            // 🔥 useRequest()
            const response = await request.post(GOOGLE_LOGIN_ROUTE, { token });

            handleLoginSuccess(response?.data);
        } catch (error: any) {
            console.error('Google login error:', error);
            showToast({
                title: 'ERROR',
                description:
                    error.response?.data?.message || 'Google login failed',
                color: 'red',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ---------------- Mail Login ---------------- //
    const loginWithMail = async () => {
        if (!email.includes('@')) {
            showToast({
                title: 'ERROR',
                description: 'Invalid email',
                color: 'red',
            });
            return;
        }

        if (!password) {
            showToast({
                title: 'ERROR',
                description: 'Please enter your password',
                color: 'red',
            });
            return;
        }

        try {
            setIsLoading(true);

            // 🔥 useRequest()
            const response = await request.post(MAIL_LOGIN_ROUTE, {
                email,
                password,
            });

            handleLoginSuccess(response?.data);
        } catch (error: any) {
            console.error('Login error:', error);
            showToast({
                title: 'ERROR',
                description: error.response?.data?.message || 'Login failed',
                color: 'red',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ---------------- Success Handler ---------------- //
    const handleLoginSuccess = (data: any) => {
        dispatch(
            setUser({
                firstName: data.firstName,
                lastName: data.lastName,
                avatar: data.avatar,
                userName: data.userName,
                newComer: data.newComer,
                token: data.token,
                refreshToken: data.refreshToken,
                isLoggedIn: true,
            })
        );

        showToast({
            title: 'Success',
            description: 'You have successfully logged in!',
            color: 'green',
        });

        navigate('/');
    };

    // ---------------- JSX ---------------- //
    if (isLoggedIn) return <Navigate to="/" />;

    return (
        <div className="h-[85vh] bg-gradient-to-r from-[#001f1f] via-[#013a3a] to-black flex items-center justify-center px-4">
            {/* Glass Card */}
            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
                {/* Heading */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold text-white">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        Login to continue your journey
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-5">
                    {/* Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="pl-10 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:ring-0 focus:border-teal-400"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:ring-0 focus:border-teal-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            {showPassword ? <Eye /> : <EyeClosed />}
                        </button>
                    </div>

                    {/* Login Button */}
                    <button
                        type="button"
                        onClick={loginWithMail}
                        disabled={isLoading}
                        className={`w-full bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl py-2.5 transition ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? 'Logging In...' : 'Login'}
                    </button>

                    {/* Divider */}
                    <div className="text-center text-gray-500 text-sm pt-2">
                        or continue with
                    </div>

                    {/* Google */}
                    <div className="flex justify-center">
                        <GoogleLogin
                            width={280}
                            theme="filled_black"
                            useOneTap
                            onSuccess={googleResponse}
                            onError={() =>
                                showToast({
                                    title: 'ERROR',
                                    description: 'Google login failed',
                                    color: 'red',
                                })
                            }
                        />
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm text-gray-400 pt-4">
                        <button
                            onClick={() => navigate('/forgot-password')}
                            className="hover:text-teal-400 transition"
                        >
                            Forgot Password?
                        </button>

                        <div className="mt-3">
                            Don't have an account?{' '}
                            <span
                                onClick={() => navigate('/signup')}
                                className="text-teal-400 font-medium cursor-pointer hover:text-teal-300"
                            >
                                Sign Up
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
