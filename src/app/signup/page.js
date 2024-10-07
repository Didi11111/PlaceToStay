'use client';

import React, { useEffect, useState } from "react";
import { UserAuth } from "../auth/AuthContext";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore"; 

const SignUpPage = () => {
    const { user, googleSignIn, createUser, logOut } = UserAuth(); 
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [authError, setAuthError] = useState("");

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 50));
            setLoading(false);
        };
        checkAuthentication();
    }, [user]);

    const handleInputChange = () => {
        setFormErrors({});
        setAuthError("");
    };

    const validateForm = ({ username, firstName, email, password }) => {
        const errors = {};
        const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

        if (!username) errors.username = "Username is required.";
        if (!firstName) errors.firstName = "First Name is required.";
        if (!email || !emailPattern.test(email)) errors.email = "Invalid email address.";
        if (!password || password.length < 6) errors.password = "Password must be at least 6 characters long.";

        return errors;
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        const firstName = e.target.firstName.value;
        const username = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        const errors = validateForm({ username, firstName, email, password });
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        try {
            setLoading(true);
            // Create a new user with email and password
            const userCredential = await createUser(email, password);
            if (!userCredential || !userCredential.user) {
                throw new Error('User credential not returned properly.');
            }
            const user = userCredential.user;
            // Store additional user data in Firestore
            const usersCollectionRef = collection(db, "users");
            await addDoc(usersCollectionRef, {
                userId: user.uid,
                firstName: firstName,
                username: username,
                email: email,
                createdAt: new Date(),
            });
            console.log("User signed up successfully");
        } catch (error) {
            console.error("Error signing up:", error);
            setAuthError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => { 
        try {
            await logOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                {loading ? (
                    <p>Loading...</p>
                ) : user ? (
                    <div className="flex items-center justify-center space-x-4">
                        <p className="text-gray-800 font-semibold">You have already logged in</p>
                        <button
                            onClick={handleSignOut} 
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <div>
                        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">Sign Up</h1>
                        {authError && <p className="text-red-500 mb-4">{authError}</p>}
                        <form onSubmit={handleSignUp}>
                            <div className="mb-4">
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">
                                    Username:
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    className="w-full px-3 py-2 leading-tight text-gray-700 border rounded-md shadow-sm appearance-none focus:outline-none focus:shadow-outline"
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.username && <p className="text-red-500 text-sm">{formErrors.username}</p>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-700">
                                    First Name:
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    className="w-full px-3 py-2 leading-tight text-gray-700 border rounded-md shadow-sm appearance-none focus:outline-none focus:shadow-outline"
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.firstName && <p className="text-red-500 text-sm">{formErrors.firstName}</p>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                                    Email:
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="w-full px-3 py-2 leading-tight text-gray-700 border rounded-md shadow-sm appearance-none focus:outline-none focus:shadow-outline"
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
                            </div>
                            <div className="mb-6">
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                                    Password:
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="w-full px-3 py-2 leading-tight text-gray-700 border rounded-md shadow-sm appearance-none focus:outline-none focus:shadow-outline"
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 px-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:shadow-outline"
                            >
                                Sign Up
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignUpPage;
