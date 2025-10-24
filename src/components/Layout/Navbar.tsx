import React from 'react';
import { NavLink } from 'react-router-dom';
import profileSvg from "../../assets/user-32.png";
import homeSvg from "../../assets/fire-32.png";

const Navbar: React.FC = () => {
    return (
        <nav className="flex flex-row gap-3 w-screen text-xl bg-white rounded-b-2xl p-6">
            <NavLink to="/" className="flex gap-1 justify-center items-center hover:text-red-100">
                <img src={homeSvg} alt=""/>
                Мигом
            </NavLink>
            <NavLink to="/profile" className="ml-auto flex">
                <img src={profileSvg} alt=""/>
            </NavLink>
        </nav>
    );
};

export default Navbar;
