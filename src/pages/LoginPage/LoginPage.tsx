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
        <div className="py-20 flex items-center justify-center">
            <div className="bg-black-1000 rounded-2xl p-10 border border-gray-500 max-w-md w-full text-center">
                {/* Heading */}
                <h1 className="text-2xl font-semibold mb-1">Welcome to</h1>
                <h2 className="text-red-600 text-4xl font-bold mb-6">
                    Binary <span className="text-white">Brains</span>
                </h2>

                <div className="text-gray-500 mb-6">
                    — or sign in with email —
                </div>

                {/* Login Form */}
                <form className="space-y-4 text-left">
                    {/* Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type="email"
                            value={email}
                            color="black"
                            onChange={e => setEmail(e.target.value)}
                            placeholder="binarybrains@gmail.com"
                            className="pl-10 pr-4 py-2 w-full text-black border rounded-lg"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            color="black"
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            className="pl-10 pr-10 py-2 w-full text-black border rounded-lg"
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
                    <div className="flex justify-center mb-6">
                        <button
                            type="button"
                            onClick={loginWithMail}
                            disabled={isLoading}
                            className={`w-40 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg px-5 py-2.5 text-sm ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? 'Logging In...' : 'Login'}
                        </button>
                    </div>

                    {/* Google Login */}
                    <div className="flex justify-center mb-6 py-3">
                        <GoogleLogin
                            width={250}
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

                    {/* Footer Links */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            className="hover:text-red-500 mb-4"
                        >
                            Forgot Password?
                        </button>

                        <div className="mt-2">
                            Don't have an account?{' '}
                            <span onClick={() => navigate('/signup')}>
                                <span className="text-red-500 text-lg cursor-pointer">
                                    Sign Up
                                </span>
                            </span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
