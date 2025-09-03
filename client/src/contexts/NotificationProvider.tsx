"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./hooks/auth";
import {
  getNotifications,
  updateNotificationStatus,
} from "@/services/apis/notifications";
import { Notification } from "@/services/types/Types";
import {
  initSocket,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from "@/services/lib/sockets";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Calculate unread count
  const unreadCount = notifications.filter(
    (notification) => notification.status === "unread"
  ).length;

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await getNotifications(1, 50, user.email);
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      const updatedNotification = await updateNotificationStatus(id, {
        status: "read",
      });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? updatedNotification : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        (notification) => notification.status === "unread"
      );

      // Update all unread notifications
      const updatedNotifications = await Promise.all(
        unreadNotifications.map((notification) =>
          updateNotificationStatus(notification.id, { status: "read" })
        )
      );

      // Update state with the updated notifications
      setNotifications((prev) =>
        prev.map((notification) => {
          const updated = updatedNotifications.find(
            (updatedNotification) => updatedNotification.id === notification.id
          );
          return updated ? updated : notification;
        })
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Initialize notifications and WebSocket connection
  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Initialize WebSocket connection
      const socket = initSocket();

      // Subscribe to notifications
      subscribeToNotifications((notification: Notification) => {
        // Add the new notification to the top of the list
        setNotifications((prev) => [notification, ...prev]);
      });

      // Cleanup function
      return () => {
        unsubscribeFromNotifications();
      };
    }
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
