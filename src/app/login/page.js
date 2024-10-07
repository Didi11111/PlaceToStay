// login/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { UserAuth } from '../auth/AuthContext';

const LoginPage = () => {
  const { user, googleSignIn, signIn } = UserAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params

  // Get the redirect URL from query parameters, defaulting to home page if not provided
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    const checkAuthentication = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setLoading(false);
    };
    checkAuthentication();
  }, [user]);

  const handleSignIn = async () => {
    try {
      setError(null);
      await googleSignIn();
      console.log('Google sign-in successful');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push(redirect); // Redirect to the target page after login
      }, 2000);
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;

    try {
      setError(null);
      await signIn(email, password);
      console.log('User logged in successfully with email:', email);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push(redirect); // Redirect to the target page after login
      }, 2000);
    } catch (error) {
      console.error('Error logging in with email:', error);
      setError('Failed to log in with email and password. Please check your credentials and try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-center text-gray-800">Login</h2>
        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-gray-800 font-semibold">Welcome, {user.displayName || user.email}</p>
          </div>
        ) : (
          <div>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <div className="flex justify-center mb-4">
              <button
                onClick={handleSignIn}
                className="px-4 py-2 mr-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors duration-300"
              >
                Sign in with Google
              </button>
            </div>
            <form onSubmit={handleEmailSignIn}>
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 leading-tight text-gray-700 border rounded-md shadow-sm appearance-none focus:outline-none focus:shadow-outline"
                  required
                />
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
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:shadow-outline"
              >
                Login
              </button>
            </form>
          </div>
        )}
        {showSuccess && <p className="text-green-500 text-center mt-4">Logged in successfully. Redirecting...</p>}
      </div>
    </div>
  );
};

export default LoginPage;
