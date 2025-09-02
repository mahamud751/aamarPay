import API from "./api";
import {
  CreateEventDto,
  UpdateEventDto,
  EventResponse,
  EventsResponse,
} from "../types/Types";

export const createEvent = async (
  data: CreateEventDto
): Promise<EventResponse> => {
  const response = await API.post("/events", data);
  return response.data;
};

export const getEvents = async (): Promise<EventsResponse> => {
  const response = await API.get("/events");
  return response.data;
};

export const getUserEvents = async (): Promise<EventsResponse> => {
  const response = await API.get("/events/my-events");
  return response.data;
};

export const getEvent = async (id: string): Promise<EventResponse> => {
  const response = await API.get(`/events/${id}`);
  return response.data;
};

export const updateEvent = async (
  id: string,
  data: UpdateEventDto
): Promise<EventResponse> => {
  const response = await API.patch(`/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id: string): Promise<{ message: string }> => {
  const response = await API.delete(`/events/${id}`);
  return response.data;
};

export const rsvpEvent = async (id: string): Promise<EventResponse> => {
  const response = await API.post(`/events/${id}/rsvp`, {});
  return response.data;
};
