"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";

import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { Event } from "@/services/types/Types";
import { useAuth } from "@/contexts/hooks/auth";
import { getEvent, rsvpEvent } from "@/services/apis/events";
import EditEventModal from "@/components/EditEventModal";

const MySwal = withReactContent(Swal);

const EventDetails = () => {
  const { id } = useParams();
  console.log("id", id);

  const [event, setEvent] = useState<Event | null>(null);
  console.log("event", event);

  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (id && typeof id === "string") {
      const fetchEvent = async () => {
        setLoading(true);
        try {
          const response = await getEvent(id);
          console.log("response", response);

          // Type assertion needed due to TypeScript conflict between
          // the Event type from our API and a potential conflicting type
          setEvent(response as unknown as Event | null);
          console.log("eventData", event);
        } catch (err: any) {
          MySwal.fire({
            icon: "error",
            title: "Error",
            text: err.response?.data?.message || "Failed to fetch event",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [id]);

  const handleRsvp = async () => {
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
        router.push("/login");
      }
      return;
    }

    if (id && typeof id === "string") {
      setLoading(true);
      try {
        const response = await rsvpEvent(id);
        setEvent(response.event);
        MySwal.fire({
          icon: "success",
          title: "Success",
          text: "RSVP recorded successfully",
        });
      } catch (err: any) {
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "Failed to RSVP",
        });
      } finally {
        setLoading(false);
      }
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-20 w-20 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!event) {
    return (
      <motion.div
        className="max-w-4xl mx-auto p-6 text-center py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-dashed border-indigo-300 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center"
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <svg
            className="h-12 w-12 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          Event not found
        </h2>
        <p className="text-gray-600 text-lg">
          The event you're looking for doesn't exist or has been removed.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Beautiful Header with Gradient */}
      <motion.div
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 mb-8 text-white shadow-2xl"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{
          scale: 1.01,
          transition: { duration: 0.3 },
        }}
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          {event.title}
        </motion.h1>
        <div className="flex flex-wrap items-center gap-4">
          <span
            className={`text-sm font-bold px-4 py-2 rounded-full ${getCategoryColor(
              event.category
            )}`}
          >
            {event.category}
          </span>
          <span className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
            {new Date(event.date).toLocaleDateString()}
          </span>
          <span className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
            RSVPs: {event.rsvpCount}
          </span>
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl p-8 border border-indigo-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-indigo-200 inline-block">
              Description
            </h2>
            <motion.p
              className="text-gray-700 text-lg leading-relaxed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {event.description}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-3">Location</h3>
              <p className="text-gray-700 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                {event.location}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-3">Date</h3>
              <p className="text-gray-700 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </motion.div>

            {/* Show event creator if available */}
            {event.user && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Created by
                </h3>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-gray-800 font-bold text-lg">
                    {event.user.name}
                  </p>
                </div>
              </motion.div>
            )}

            {/* RSVP Count Display */}
            <motion.div
              className="flex justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl p-6 shadow-lg w-full max-w-sm">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {event.rsvpCount}
                  </div>
                  <div className="text-lg font-medium">People Attending</div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex flex-wrap gap-4">
              {user && event.userId === user.id && (
                <motion.button
                  onClick={() => setEditingEvent(event)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 px-8 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit Event
                </motion.button>
              )}

              <motion.button
                onClick={handleRsvp}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "RSVP to Event"
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  );
};

export default EventDetails;
