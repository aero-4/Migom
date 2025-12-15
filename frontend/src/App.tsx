import {Suspense, lazy, JSX} from 'react';
import {Routes, Route} from 'react-router-dom';
import Product from "./pages/Product.tsx";
import Category from "./pages/Category.tsx";
import Profile from "./pages/Profile.tsx";
import SearchPage from "./pages/Search.tsx";
import Orders from "./pages/Orders.tsx";

const Home = lazy(() => import('./pages/Home.tsx'));
const Login = lazy(() => import('./pages/Login.tsx'));
const Register = lazy(() => import('./pages/Register.tsx'));
const NotFound = lazy(() => import('./pages/NotFound.tsx'));
const Loader = lazy(() => import("./components/Loaders/Loader.tsx"));
const Layout = lazy(() => import("./components/Layout/Layout.tsx"))

function App(): JSX.Element {
    return (
        <Suspense fallback={<Loader/>}>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route index element={<Home/>}/>
                    <Route path="profile" element={<Profile/>}/>
                    <Route path="orders" element={<Orders/>}/>
                    <Route path="product/:id" element={<Product/>}/>
                    <Route path="category/:id" element={<Category/>}/>
                    <Route path="register" element={<Register/>}/>
                    <Route path="login" element={<Login/>}/>
                    <Route path="search" element={<SearchPage/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Route>
            </Routes>
        </Suspense>
    );
}

export default App;
