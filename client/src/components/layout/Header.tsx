"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/hooks/auth";
import { useState } from "react";
import AuthForm from "@/components/templates/AuthForm";

export default function Header() {
  const { user, logoutUser } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState(false);

  const handleLogout = () => {
    logoutUser();
  };

  const toggleAuthForm = () => {
    setShowAuthForm(!showAuthForm);
  };

  const closeAuthForm = () => {
    setShowAuthForm(false);
  };

  return (
    <header className="bg-blue-600 text-white p-4 relative">
      <nav className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Event Management</h1>
        <ul className="flex space-x-4 items-center">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link href="/create-event" className="hover:underline">
                  Create Event
                </Link>
              </li>
              <li>
                <Link href="/my-events" className="hover:underline">
                  My Events
                </Link>
              </li>
            </>
          )}
          <li>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="hidden md:inline">Hi, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={toggleAuthForm}
                className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                Login
              </button>
            )}
          </li>
        </ul>
      </nav>

      {showAuthForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <button
              onClick={closeAuthForm}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              &times;
            </button>
            <AuthForm onClose={closeAuthForm} />
          </div>
        </div>
      )}
    </header>
  );
}
