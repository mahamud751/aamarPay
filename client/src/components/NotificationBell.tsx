"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationProvider";
import { useAuth } from "@/contexts/hooks/auth";
import {
  FaBell,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } =
    useNotifications();
  const { user } = useAuth();

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleNotificationClick = async (
    id: string,
    status: "read" | "unread"
  ) => {
    if (status === "unread") {
      await markAsRead(id);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) return null;

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-full hover:bg-indigo-500 hover:bg-opacity-30 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              ref={modalRef}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2 py-1 rounded-full transition-all"
                    >
                      Mark all as read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto max-h-[60vh]">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <FaBell className="mx-auto text-3xl text-gray-300 mb-2" />
                    <p className="text-gray-500">No notifications</p>
                  </div>
                ) : (
                  <ul>
                    {notifications.map((notification) => (
                      <motion.li
                        key={notification.id}
                        className={`border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                          notification.status === "unread"
                            ? "bg-indigo-50"
                            : "bg-white"
                        }`}
                        onClick={() =>
                          handleNotificationClick(
                            notification.id,
                            notification.status
                          )
                        }
                        whileHover={{ backgroundColor: "#f0f4ff" }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="p-4 flex items-start">
                          <div className="mr-3 mt-1">
                            {notification.status === "unread" ? (
                              <FaExclamationCircle className="text-indigo-500" />
                            ) : (
                              <FaCheckCircle className="text-green-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm ${
                                notification.status === "unread"
                                  ? "font-semibold text-gray-800"
                                  : "text-gray-600"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                          {notification.status === "unread" && (
                            <span className="ml-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-3 text-center text-sm text-gray-500 border-t border-gray-100">
                {notifications.length > 0
                  ? `${notifications.length} notification${
                      notifications.length > 1 ? "s" : ""
                    }`
                  : "No notifications"}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
