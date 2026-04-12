import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { Navigate, useNavigate } from 'react-router-dom';
import { GOOGLE_LOGIN_ROUTE, MAIL_LOGIN_ROUTE } from '@/utils/Urlpaths';
import { useDispatch } from 'react-redux';
import { getIsLoggedIn, setUser } from '@/redux/slices/User';
import { showToast } from '@/utils/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; // Imported your UI button
import { EyeClosed, Eye, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRequest } from '@/utils/request';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isLoggedIn = useAppSelector(getIsLoggedIn);

    const request = useRequest();

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
                    variant: 'destructive', // Updated to shadcn variant
                });
                return;
            }

            setIsLoading(true);

            const response = await request.post(GOOGLE_LOGIN_ROUTE, { token });

            handleLoginSuccess(response?.data);
        } catch (error: any) {
            console.error('Google login error:', error);
            showToast({
                title: 'ERROR',
                description:
                    error.response?.data?.message || 'Google login failed',
                variant: 'destructive',
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
                variant: 'destructive',
            });
            return;
        }

        if (!password) {
            showToast({
                title: 'ERROR',
                description: 'Please enter your password',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsLoading(true);

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
                variant: 'destructive',
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
            variant: 'default', // Updated to default (or whatever your success variant is)
        });

        navigate('/');
    };

    // ---------------- JSX ---------------- //
    if (isLoggedIn) return <Navigate to="/" />;

    return (
        // Wrapper with padding to ensure it looks good on mobile
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-9/12 backdrop-blur-lg bg-primary/20 dark:bg-primary/40 h-[70vh] absolute blur-[150px] dark:blur-[200px] bottom-24 rounded-full transition-colors duration-500"></div>
            {/* Added frosted glass effect: bg-card/60, backdrop-blur, and border-border */}
            <div className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-8 sm:p-10 max-w-md w-full text-center  transition-colors duration-300">
                {/* Heading using theme colors */}
                <h1 className="text-xl sm:text-2xl font-semibold mb-1 text-foreground">
                    Welcome back to
                </h1>
                <h2 className="text-3xl sm:text-4xl font-bold mb-8 flex justify-center gap-2">
                    <span className="text-primary">Binary</span>
                    <span className="text-foreground">Brains</span>
                </h2>

                {/* Login Form */}
                <form className="space-y-5 text-left flex flex-col items-center">
                    {/* Replaced native div wrappers with our upgraded Input sections */}
                    <div className="w-full space-y-4">
                        <Input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="binarybrains@gmail.com"
                            className="h-12 bg-background border-input focus-visible:ring-primary text-foreground transition-colors"
                            leftSection={
                                <Mail
                                    size={18}
                                    className="text-muted-foreground"
                                />
                            }
                        />

                        <Input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            className="h-12 bg-background border-input focus-visible:ring-primary text-foreground transition-colors"
                            leftSection={
                                <Lock
                                    size={18}
                                    className="text-muted-foreground"
                                />
                            }
                            rightSection={
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <Eye size={18} />
                                    ) : (
                                        <EyeClosed size={18} />
                                    )}
                                </button>
                            }
                        />
                    </div>

                    <div className="w-full flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    {/* Replaced gradient button with shadcn UI Button + Glow */}
                    <Button
                        type="button"
                        onClick={loginWithMail}
                        disabled={isLoading}
                        className="w-full h-12 text-md font-semibold shadow-lg shadow-primary/20 transition-all"
                    >
                        {isLoading ? 'Logging In...' : 'Login'}
                    </Button>

                    <div className="flex items-center w-full my-6">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="px-3 text-muted-foreground text-sm">
                            or sign in with
                        </span>
                        <div className="flex-grow border-t border-border"></div>
                    </div>

                    {/* Google Login */}
                    <div className="flex justify-center w-full pb-2">
                        <GoogleLogin
                            theme="filled_black"
                            useOneTap
                            onSuccess={googleResponse}
                            onError={() =>
                                showToast({
                                    title: 'ERROR',
                                    description: 'Google login failed',
                                    variant: 'destructive',
                                })
                            }
                        />
                    </div>

                    {/* Footer Links */}
                    <div className="text-center mt-2 text-muted-foreground text-sm">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/signup')}
                            className="text-primary font-semibold hover:underline ml-1"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
