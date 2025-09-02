"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { Category, CreateEventDto } from "@/services/types/Types";
import { useAuth } from "@/contexts/hooks/auth";
import { getEvent, updateEvent, createEvent } from "@/services/apis/events";

const MySwal = withReactContent(Swal);

const EventForm = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState<CreateEventDto>({
    title: "",
    description: "",
    date: "",
    location: "",
    category: Category.Conference,
  });
  const [loading, setLoading] = useState(false);
  const { user, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (id && typeof id === "string") {
      const fetchEvent = async () => {
        setLoading(true);
        try {
          const response = await getEvent(id);
          setFormData({
            title: response.event.title,
            description: response.event.description,
            date: new Date(response.event.date).toISOString().split("T")[0],
            location: response.event.location,
            category: response.event.category,
          });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id && typeof id === "string") {
        await updateEvent(id, formData);
        MySwal.fire({
          icon: "success",
          title: "Success",
          text: "Event updated successfully",
        });
      } else {
        await createEvent(formData);
        MySwal.fire({
          icon: "success",
          title: "Success",
          text: "Event created successfully",
        });
      }
      router.push("/events");
    } catch (err: any) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to save event",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !hasPermission("event.create")) {
    return <p className="text-center text-error">Unauthorized</p>;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {id ? "Edit Event" : "Create Event"}
      </h1>
      {loading && (
        <div className="flex justify-center">
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
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            disabled={loading}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            disabled={loading}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          />
        </div>
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            disabled={loading}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          />
        </div>
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            disabled={loading}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          />
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value as Category })
            }
            disabled={loading}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          >
            {Object.values(Category).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
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
          ) : id ? (
            "Update Event"
          ) : (
            "Create Event"
          )}
        </button>
      </form>
    </div>
  );
};

export default EventForm;
