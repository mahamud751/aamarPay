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
import { getUserEvents, getEvents } from "@/services/apis/events";
import { Event } from "@/services/types/Types";

const MySwal = withReactContent(Swal);

interface EventsContextType {
  events: Event[];
  loading: boolean;
  fetchEvents: (fetchUserEvents: boolean) => Promise<void>;
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

  return (
    <EventsContext.Provider value={{ events, loading, fetchEvents }}>
      {children}
    </EventsContext.Provider>
  );
};
