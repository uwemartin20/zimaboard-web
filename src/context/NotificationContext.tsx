import api from "../api/client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export interface Notification {
  id: number;
  message_id: number;
  message: string;
  read: boolean;
  timestamp: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (id: number, message_id: number, message: string) => void;
  markAllAsRead: () => void;
  markAsRead: (id: number) => void;
  removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch initial notifications from backend
  useEffect(() => {
    api.get("/notifications").then(res => {
      const data = res.data.data.map((n: any) => ({
        id: n.recipient_id,
        read: !!n.read_at,
        message_id: n.notification.message.id,
        message: n.notification.title || n.notification.body,
        timestamp: n.notification.created_at,
      }));
      setNotifications(data);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (id: number, message_id: number, message: string) => {
    const newNotif: Notification = {
      id: id,
      message_id,
      message,
      read: false,
      timestamp: Date.now(),
    };
    setNotifications(prev => {
      const exists = prev.some(n => n.id === newNotif.id);
      if (exists) return prev;
      return [newNotif, ...prev];
    });

    // Show toast
    toast.info(message, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const markAsRead = async (id: number) => {
    await api.post(`/notifications/${id}/read`);
  
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = async () => {
    await api.post("/notifications/read-all");

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = async (id: number) => {
    await api.delete(`/notifications/${id}`);

    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllAsRead, markAsRead, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications muss innerhalb von NotificationProvider verwendet werden.");
  return ctx;
};
