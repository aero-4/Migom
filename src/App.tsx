import React, {Suspense, lazy, JSX} from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import NotFound from './pages/NotFound';
import Loader from "./components/Loaders/Loader.tsx";

const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));

function App(): JSX.Element {
    return (
        <Suspense fallback={<Loader/>}>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="login" element={<Login />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

export default App;
