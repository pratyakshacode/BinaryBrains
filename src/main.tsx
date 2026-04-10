import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store.ts';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PersistGate } from 'redux-persist/integration/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/ui/Theme/ThemeProvider.tsx';

gsap.registerPlugin(ScrollTrigger);

const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <GoogleOAuthProvider clientId={clientID}>
                <PersistGate loading={null} persistor={persistor}>
                    <QueryClientProvider client={queryClient}>
                        <ThemeProvider defaultTheme="dark">
                            <App />
                        </ThemeProvider>
                    </QueryClientProvider>
                </PersistGate>
            </GoogleOAuthProvider>
        </Provider>
    </StrictMode>
);
