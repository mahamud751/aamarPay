"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";

import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import {
  getUserEvents,
  getEvents,
  rsvpEvent as rsvpEventApi,
  deleteEvent as deleteEventApi,
} from "@/services/apis/events";
import { Event } from "@/services/types/Types";
import { useAuth } from "@/contexts/hooks/auth";

const MySwal = withReactContent(Swal);

interface EventsContextType {
  events: Event[];
  loading: boolean;
  fetchEvents: (fetchUserEvents: boolean) => Promise<void>;
  rsvpEvent: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};

interface EventsProviderProps {
  children: ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchEvents = useCallback(async (fetchUserEvents: boolean) => {
    setLoading(true);
    try {
      const response = fetchUserEvents
        ? await getUserEvents()
        : await getEvents();
      setEvents(response.data);
    } catch (err: any) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to fetch events",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const rsvpEvent = useCallback(
    async (id: string) => {
      // Check if user is authenticated
      if (!user) {
        MySwal.fire({
          icon: "warning",
          title: "Login Required",
          text: "You need to be logged in to RSVP to events.",
        });
        return;
      }

      try {
        const response = await rsvpEventApi(id);
        // Update the event in the state with the new RSVP count
        setEvents((prevEvents) =>
          prevEvents.map((event) => (event.id === id ? response.event : event))
        );
      } catch (err: any) {
        // Handle authentication errors specifically
        if (err.response?.status === 401) {
          MySwal.fire({
            icon: "error",
            title: "Authentication Error",
            text: "Your session has expired. Please log in again.",
          });
        } else {
          MySwal.fire({
            icon: "error",
            title: "Error",
            text: err.response?.data?.message || "Failed to RSVP to event",
          });
        }
      }
    },
    [user]
  );

  const deleteEvent = useCallback(async (id: string) => {
    try {
      await deleteEventApi(id);
      // Remove the event from the state
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
    } catch (err: any) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to delete event",
      });
    }
  }, []);

  return (
    <EventsContext.Provider
      value={{ events, loading, fetchEvents, rsvpEvent, deleteEvent }}
    >
      {children}
    </EventsContext.Provider>
  );
};
