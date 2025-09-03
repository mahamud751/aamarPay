"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";

import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { Event } from "@/services/types/Types";
import { useAuth } from "@/contexts/hooks/auth";
import { getEvent, rsvpEvent } from "@/services/apis/events";

const MySwal = withReactContent(Swal);

const EventDetails = () => {
  const { id } = useParams();
  console.log("id", id);

  const [event, setEvent] = useState<Event | null>(null);
  console.log("event", event);

  const [loading, setLoading] = useState(false);
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
      Conference: "bg-blue-100 text-blue-800",
      Workshop: "bg-green-100 text-green-800",
      Social: "bg-purple-100 text-purple-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <svg
          className="animate-spin h-12 w-12 text-blue-500"
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
      </div>
    );
  }

  if (!event) {
    return (
      <motion.div
        className="max-w-4xl mx-auto p-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-2xl font-semibold text-gray-700">
          Event not found
        </h2>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Beautiful Header with Gradient */}
      <motion.div
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-4xl font-bold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {event.title}
        </motion.h1>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`text-sm font-semibold px-3 py-1 rounded-full ${getCategoryColor(
              event.category
            )}`}
          >
            {event.category}
          </span>
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
            {new Date(event.date).toLocaleDateString()}
          </span>
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
            RSVPs: {event.rsvpCount}
          </span>
        </div>
      </motion.div>

      <motion.div
        className="bg-white rounded-2xl shadow-xl p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Description
            </h2>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Location
              </h3>
              <p className="text-gray-600">{event.location}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Date</h3>
              <p className="text-gray-600">
                {new Date(event.date).toLocaleDateString()}
              </p>
            </div>
            // Show event creator if available
            {event.user && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Created by
                </h3>
                <p className="text-gray-600">
                  <span className="font-medium">{event.user.name}</span>
                  {event.user.email && (
                    <span className="block text-sm text-gray-500">
                      {event.user.email}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="pt-6">
            <div className="flex flex-wrap gap-3">
              {user && event.userId === user.id && (
                <motion.button
                  onClick={() => router.push(`/events/edit/${event.id}`)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium py-2 px-6 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit Event
                </motion.button>
              )}

              <motion.button
                onClick={handleRsvp}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium py-2 px-6 rounded-lg hover:from-green-600 hover:to-teal-600 disabled:opacity-50 transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white mx-auto"
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
                ) : (
                  "RSVP to Event"
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventDetails;
