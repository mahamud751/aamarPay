"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { Event } from "@/services/types/Types";
import { useAuth } from "@/contexts/hooks/auth";
import { getEvent, rsvpEvent } from "@/services/apis/events";

const MySwal = withReactContent(Swal);

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (id && typeof id === "string") {
      const fetchEvent = async () => {
        setLoading(true);
        try {
          const response = await getEvent(id);
          setEvent(response.event);
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

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <svg
          className="animate-spin h-8 w-8 text-primary"
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
    return <p className="text-center text-error">Event not found</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{event.title}</h1>
      <p className="text-gray-600 mb-2">
        <span className="font-semibold">Description:</span> {event.description}
      </p>
      <p className="text-gray-600 mb-2">
        <span className="font-semibold">Date:</span>{" "}
        {new Date(event.date).toLocaleDateString()}
      </p>
      <p className="text-gray-600 mb-2">
        <span className="font-semibold">Location:</span> {event.location}
      </p>
      <p className="text-gray-600 mb-2">
        <span className="font-semibold">Category:</span> {event.category}
      </p>
      <p className="text-gray-600 mb-4">
        <span className="font-semibold">RSVPs:</span> {event.rsvpCount}
      </p>
      <div className="space-x-2">
        {user && event.userId === user.id && (
          <button
            onClick={() => router.push(`/events/edit/${event.id}`)}
            className="bg-secondary text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Edit
          </button>
        )}
        {user && hasPermission("event.rsvp") && (
          <button
            onClick={handleRsvp}
            disabled={loading}
            className="bg-success text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              "RSVP"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
