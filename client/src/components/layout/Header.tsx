"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/hooks/auth";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome,
  FaPlus,
  FaCalendarAlt,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaTimes,
} from "react-icons/fa";
import AuthForm from "@/components/templates/AuthForm";

export default function Header() {
  const { user, logoutUser } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logoutUser();
  };

  const toggleAuthForm = () => {
    setShowAuthForm(!showAuthForm);
  };

  const closeAuthForm = () => {
    setShowAuthForm(false);
  };

  // Animation variants
  const navItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  const authFormVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white bg-opacity-90 backdrop-blur-md shadow-lg py-2"
          : "bg-gradient-to-r from-indigo-600 to-purple-600 py-4"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
      <nav className="container mx-auto flex justify-between items-center px-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-2 rounded-full"
            >
              <FaCalendarAlt className="text-indigo-600 text-xl" />
            </motion.div>
            <span
              className={`text-xl font-bold ${
                isScrolled ? "text-indigo-600" : "text-white"
              }`}
            >
              EventHub
            </span>
          </Link>
        </motion.div>

        <motion.ul
          className="flex space-x-1 md:space-x-4 items-center"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.li variants={navItemVariants}>
            <Link
              href="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                isScrolled
                  ? "text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
                  : "text-white hover:bg-indigo-500 hover:bg-opacity-30"
              }`}
            >
              <FaHome />
              <span className="hidden md:inline">Home</span>
            </Link>
          </motion.li>

          {user && (
            <>
              <motion.li variants={navItemVariants}>
                <Link
                  href="/create-event"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isScrolled
                      ? "text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
                      : "text-white hover:bg-indigo-500 hover:bg-opacity-30"
                  }`}
                >
                  <FaPlus />
                  <span className="hidden md:inline">Create</span>
                </Link>
              </motion.li>
              <motion.li variants={navItemVariants}>
                <Link
                  href="/my-events"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isScrolled
                      ? "text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
                      : "text-white hover:bg-indigo-500 hover:bg-opacity-30"
                  }`}
                >
                  <FaUser />
                  <span className="hidden md:inline">My Events</span>
                </Link>
              </motion.li>
            </>
          )}

          <motion.li variants={navItemVariants}>
            {user ? (
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span
                  className={`hidden md:inline font-medium ${
                    isScrolled ? "text-indigo-600" : "text-white"
                  }`}
                >
                  Hi, {user.name}
                </span>
                <motion.button
                  onClick={handleLogout}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isScrolled
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-white text-indigo-600 hover:bg-gray-100"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaSignOutAlt />
                  <span className="hidden md:inline">Logout</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                onClick={toggleAuthForm}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isScrolled
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-white text-indigo-600 hover:bg-gray-100"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSignInAlt />
                <span className="hidden md:inline">Login</span>
              </motion.button>
            )}
          </motion.li>
        </motion.ul>
      </nav>

      <AnimatePresence>
        {showAuthForm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative"
              variants={authFormVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
            >
              <motion.button
                onClick={closeAuthForm}
                className="absolute -top-4 -right-4 bg-white text-gray-500 hover:text-gray-700 rounded-full p-2 shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes className="h-5 w-5" />
              </motion.button>
              <AuthForm onClose={closeAuthForm} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
