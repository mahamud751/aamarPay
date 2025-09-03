"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Event } from "@/services/types/Types";
import { useEvents } from "@/contexts/EventsProviders";
import { useAuth } from "@/contexts/hooks/auth";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

const MySwal = withReactContent(Swal);

interface EventCardProps {
  event: Event;
  showDelete?: boolean;
}

export default function EventCard({
  event,
  showDelete = false,
}: EventCardProps) {
  const { deleteEvent, rsvpEvent } = useEvents();
  const { user } = useAuth();

  // Get a beautiful color based on category
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Conference: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800",
      Workshop: "bg-gradient-to-r from-green-100 to-green-200 text-green-800",
      Social: "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800",
      Other: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800",
    };
    return (
      colors[category] ||
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
    );
  };

  const handleRsvpClick = async () => {
    // Check if user is logged in
    if (!user) {
      const result = await MySwal.fire({
        title: "Login Required",
        text: "You need to be logged in to RSVP to events. Would you like to login now?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#8B5CF6",
        cancelButtonColor: "#EF4444",
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        customClass: {
          confirmButton: "px-6 py-3 text-white rounded-lg font-medium",
          cancelButton: "px-6 py-3 text-white rounded-lg font-medium",
          title: "text-xl font-bold",
          popup: "rounded-xl shadow-lg",
        },
      });

      if (result.isConfirmed) {
        // Redirect to login page
        window.location.href = "/login";
      }
      return;
    }

    const result = await MySwal.fire({
      title: "Confirm RSVP",
      text: `Are you sure you want to RSVP to "${event.title}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#8B5CF6",
      cancelButtonColor: "#EF4444",
      confirmButtonText: "Yes, RSVP me!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        confirmButton: "px-6 py-3 text-white rounded-lg font-medium",
        cancelButton: "px-6 py-3 text-white rounded-lg font-medium",
        title: "text-xl font-bold",
        popup: "rounded-xl shadow-lg",
      },
    });

    if (result.isConfirmed) {
      try {
        await rsvpEvent(event.id);
        await MySwal.fire({
          title: "RSVP Successful!",
          text: `You have successfully RSVP'd to "${event.title}".`,
          icon: "success",
          confirmButtonColor: "#8B5CF6",
          customClass: {
            confirmButton: "px-6 py-3 text-white rounded-lg font-medium",
            title: "text-xl font-bold",
            popup: "rounded-xl shadow-lg",
          },
        });
      } catch (error) {
        // Error handling is already done in the context
      }
    }
  };

  return (
    <motion.div
      className="border-none rounded-lg p-0 relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-24 h-24 -mt-6 -mr-6 opacity-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-indigo-500"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M8 12H16M12 8V16"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-16 h-16 -mb-4 -ml-4 opacity-10">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full text-purple-500"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-3 line-clamp-1 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent relative z-10">
        {event.title}
      </h3>
      <p className="text-gray-600 mb-2 relative z-10">
        <span className="font-medium text-indigo-700">Date:</span>{" "}
        <span className="font-medium">
          {new Date(event.date).toLocaleDateString()}
        </span>
      </p>
      <p className="text-gray-600 mb-2 relative z-10">
        <span className="font-medium text-indigo-700">Location:</span>{" "}
        {event.location}
      </p>

      {/* Show event creator if available */}
      {event.user && (
        <p className="text-gray-600 text-sm mb-3 relative z-10">
          <span className="font-medium text-indigo-700">Created by:</span>{" "}
          <span className="text-purple-600 font-medium">{event.user.name}</span>
        </p>
      )}

      <div className="flex items-center justify-between mb-4 relative z-10">
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${getCategoryColor(
            event.category
          )}`}
        >
          {event.category}
        </span>
        {/* Enhanced RSVP display */}
        <div className="flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full px-3 py-1 border border-indigo-200 shadow-sm">
          <svg
            className="w-4 h-4 text-indigo-600 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-sm font-bold text-indigo-700">
            {event.rsvpCount} attending
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 relative z-10">
        <Link
          href={`/events/${event.id}`}
          className="flex-1 min-w-[120px] text-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          View Details
        </Link>
        <button
          onClick={handleRsvpClick}
          className="flex-1 min-w-[120px] bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          RSVP
        </button>
        {showDelete && (
          <button
            onClick={() => deleteEvent && deleteEvent(event.id)}
            className="flex-1 min-w-[120px] bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Delete
          </button>
        )}
      </div>
    </motion.div>
  );
}
