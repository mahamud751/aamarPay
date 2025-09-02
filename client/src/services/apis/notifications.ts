import API from "./api";
import {
  CreateNotificationDto,
  UpdateNotificationStatusDto,
  NotificationsResponse,
  Notification,
} from "../types/Types";

export const createNotification = async (
  data: CreateNotificationDto
): Promise<Notification> => {
  const response = await API.post("/notifications", data);
  return response.data;
};

export const getNotifications = async (
  page: number = 1,
  perPage: number = 10,
  email?: string,
  status?: string
): Promise<NotificationsResponse> => {
  const response = await API.get("/notifications", {
    params: { page, perPage, email, status },
  });
  return response.data;
};

export const getUserNotifications = async (
  email: string
): Promise<Notification[]> => {
  const response = await API.get(`/notifications/user/${email}`);
  return response.data;
};

export const updateNotificationStatus = async (
  id: string,
  data: UpdateNotificationStatusDto
): Promise<Notification> => {
  const response = await API.patch(`/notifications/${id}`, data);
  return response.data;
};

export const deleteNotification = async (
  id: string
): Promise<{ message: string }> => {
  const response = await API.delete(`/notifications/${id}`);
  return response.data;
};
