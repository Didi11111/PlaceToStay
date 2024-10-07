//Components/Navbar.js
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { UserAuth } from "../auth/AuthContext";

const Navbar = () => {
    const { user, isAdmin, logOut } = UserAuth(); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await logOut();
            setIsDropdownOpen(false);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const userLoggedIn = !!user;
        setIsLoggedIn(userLoggedIn);
    }, [user]);

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 50));
            setLoading(false);
        };
        checkAuthentication();
    }, [user]);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-md flex items-center justify-between p-4">
            <div className="flex items-center space-x-6">
                <Link href="/" className="text-2xl font-bold hover:text-gray-300 transition-colors duration-300">
                    PlacesToStay
                </Link>
                <ul className="hidden md:flex space-x-6">
                    <li className="hover:text-gray-300 transition-colors duration-300">
                        <Link href="/">Home</Link>
                    </li>
                    <li className="hover:text-gray-300 transition-colors duration-300">
                        <Link href="/profile">Profile</Link>
                    </li>
                    {isLoggedIn && isAdmin && ( // Only show Admin link if the user is admin
                        <li className="hover:text-gray-300 transition-colors duration-300">
                            <Link href="/admin">Admin</Link>
                        </li>
                    )}
                </ul>
            </div>

            <div className="flex items-center space-x-4">
                {loading ? (
                    <p>Loading...</p>
                ) : isLoggedIn && user ? (
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded-md focus:outline-none"
                        >
                            <span>Welcome, {user.displayName || 'User'}</span>
                            <svg
                                className={`w-4 h-4 transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {isDropdownOpen && (
                            <ul className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg overflow-hidden">
                                <li className="hover:bg-gray-200 transition-colors duration-300">
                                    <Link href="/profile" className="block px-4 py-2">Profile</Link>
                                </li>
                                <li className="hover:bg-gray-200 transition-colors duration-300">
                                    <button
                                        onClick={handleSignOut}
                                        className="block w-full text-left px-4 py-2"
                                    >
                                        Sign Out
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>
                ) : (
                    <>
                        <Link href="/login" className="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded-md transition-colors duration-300">
                            Login
                        </Link>
                        <Link href="/signup" className="px-4 py-2 bg-gray-500 hover:bg-gray-700 rounded-md transition-colors duration-300">
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
