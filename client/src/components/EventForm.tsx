"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { Category, CreateEventDto, Event } from "@/services/types/Types";
import { useAuth } from "@/contexts/hooks/auth";
import { useEvents } from "@/contexts/EventsProviders";
import { getEvent, updateEvent, createEvent } from "@/services/apis/events";
import { createNotification } from "@/services/apis/notifications";

interface EventFormProps {
  initialData?: Event | null;
  onSubmitSuccess?: () => void;
}

const MySwal = withReactContent(Swal);

const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmitSuccess,
}) => {
  const { id } = useParams();
  const { fetchEvents } = useEvents();
  const [formData, setFormData] = useState<CreateEventDto>({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    category: Category.Conference,
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Determine if we're in edit mode for UI display
  const isEditMode =
    (id && typeof id === "string") || (initialData && initialData.id);

  // 🔥 Fetch event for edit mode or use initialData
  useEffect(() => {
    const loadEventData = async () => {
      if (initialData) {
        // Use provided initial data
        setFormData({
          title: initialData.title,
          description: initialData.description,
          date: new Date(initialData.date).toISOString().split("T")[0],
          location: initialData.location,
          category: initialData.category,
        });
      } else if (id && typeof id === "string") {
        // Fetch data from API
        setLoading(true);
        try {
          const eventData = await getEvent(id);
          // Type assertion to ensure we're using our Event type
          const event = eventData as unknown as Event;
          setFormData({
            title: event.title,
            description: event.description,
            date: new Date(event.date).toISOString().split("T")[0],
            location: event.location,
            category: event.category,
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
      }
    };

    loadEventData();
  }, [id, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // ✅ Convert back to full ISO for backend
    const payload = {
      ...formData,
      date: new Date(formData.date).toISOString(),
    };

    try {
      // Determine if we're in edit mode
      const isEditMode =
        (id && typeof id === "string") || (initialData && initialData.id);
      const eventId =
        id && typeof id === "string" ? id : initialData ? initialData.id : null;

      if (isEditMode && eventId) {
        await updateEvent(eventId, payload);
        MySwal.fire({
          icon: "success",
          title: "Success",
          text: "Event updated successfully",
        });

        // Refetch events to update the UI with the new data
        // We fetch user events to get the updated event list
        await fetchEvents(true);
      } else {
        const response = await createEvent(payload);

        // Send notification to all users about the new event
        if (user?.email) {
          try {
            await createNotification({
              userEmail: "all",
              message: `New event created: ${response.event.title} by ${user.name}`,
            });
          } catch (notificationError) {
            console.error("Failed to send notification:", notificationError);
          }
        }

        MySwal.fire({
          icon: "success",
          title: "Success",
          text: "Event created successfully",
        });

        // Refetch events to include the new event
        // We fetch user events to get the updated event list
        await fetchEvents(true);
      }

      // Call the success callback if provided, otherwise redirect
      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        router.push("/events");
      }
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

  if (!user) {
    return <p className="text-center text-error">Unauthorized</p>;
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {isEditMode ? "Edit Event" : "Create Event"}
      </h1>
      {loading && (
        <div className="flex justify-center py-4">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
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
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Event title"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Event description"
            rows={4}
          />
        </div>

        {/* Date */}
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Event location"
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            {Object.keys(Category)
              .filter((key) => isNaN(Number(key)))
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition duration-300 flex items-center justify-center"
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
          ) : isEditMode ? (
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
