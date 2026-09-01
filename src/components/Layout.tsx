import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { logout, getUser } from "../api/auth";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import echo from "../api/echo"; // your existing Echo setup
import { notifyMessage, useNotifications } from "../context/NotificationContext";
import type { Comment, UserSummary } from "../types";
import { ToastContainer } from "react-toastify";

export default function Layout() {
    const { addNotification } = useNotifications();
  const location = useLocation();
  const subscriptionRef = useRef(false);

  useEffect(() => {
    if (subscriptionRef.current) return;
    subscriptionRef.current = true;
    // Subscribe to current user private channel
    const user = getUser();
    if (!user) return;

    const appEnv = import.meta.env.VITE_APP_ENV;

    const userChannel = echo.private(`${appEnv}.user.${user.id}`);
    // 1️⃣ Notifications (source of truth)
    userChannel.listen(".notification.created", (data: any) => {
      console.log("Received notification.created event:", data);
      addNotification(
        data.id,
        data.message_id,
        data.message
      );
      const comment: Comment = {
        id: data.id,
        message_id: data.message_id,
        content: data.content ?? data.body ?? "",
        created_at: data.created_at ?? new Date().toISOString(),
        user: (data.user ?? { id: 0, name: "Unbekannt" }) as UserSummary,
      };
      notifyMessage(comment.message_id ?? data.message_id, comment);
    });
    userChannel.listen(".chat.created", (data: any) => {
        console.log("Received chat.created event:", data);
        // Forward the new comment to any page currently rendering this message.
        // Shape mirrors the POST /messages/{id}/comments response: a Comment.
        const raw = data?.chat ?? data?.comment ?? data;
        if (!raw || raw.message_id == null) return;
        const comment: Comment = {
          id: raw.id,
          message_id: raw.message_id,
          content: raw.content ?? raw.body ?? "",
          created_at: raw.created_at ?? new Date().toISOString(),
          user: (raw.user ?? { id: 0, name: "Unbekannt" }) as UserSummary,
        };
        notifyMessage(comment.message_id ?? raw.message_id, comment);
    });

    // Tickets/messages
    userChannel.listen(".message.created", (data: any) => {
        console.log("Received message.created event:", data);
        // addNotification(data.id, `Neue Nachricht erstellt von ${data.creator.name}: ${data.title}`);
    });

    return () => {
        userChannel.stopListening(".chat.created");
        userChannel.stopListening(".message.created");
        echo.leave(`${appEnv}.user.${user.id}`);
        subscriptionRef.current = false;
    };
  }, [echo, addNotification, getUser]);

  const titleMap: Record<string, string> = {
    "/": "Dashboard",
    "/assigned": "Meine Nachrichten",
    "/created": "Zugewiesene Nachrichten",
    "/announcement": "Pin Wand",
    "/profile": "Profil",
    "/new-message": "Neue Nachricht",
    "/settings/departments": "Abteilungen",
    "/settings/statuses": "Status",
    "/settings/users": "Benutzer",
  };

  const title = titleMap[location.pathname] ?? "Nachricht";

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6">
        <Navbar
          title={title}
          logout={logout}
        />
        <ToastContainer />

        {/* PAGE CONTENT */}
        <Outlet />
      </main>
    </div>
  );
}
