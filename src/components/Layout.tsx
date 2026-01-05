import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { logout } from "../api/auth";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import echo from "../api/echo"; // your existing Echo setup
// import { useUnread } from "../context/UnreadContext";
import { useNotifications } from "../context/NotificationContext";
import { ToastContainer } from "react-toastify";

export default function Layout() {
    const { addNotification } = useNotifications();
  const location = useLocation();
  const subscriptionRef = useRef(false);

  useEffect(() => {
    if (subscriptionRef.current) return;
    subscriptionRef.current = true;
    // Subscribe to current user private channel
    const userString = localStorage.getItem("user"); // or get from your auth
    if (!userString) return;

    let user: any;
    try {
      user = JSON.parse(userString);
    } catch {
      return;
    }
    if (!user) return;

    subscriptionRef.current = true;

    const userChannel = echo.private(`user.${user.id}`);
    userChannel.listen(".chat.created", (data: any) => {
        console.log("Received chat.created event:", data);
        addNotification(data.chat.message_id, `Neuer Kommentar von ${data.chat.user.name}: ${data.chat.content}`);
    });

    // Tickets/messages
    userChannel.listen(".message.created", (data: any) => {
        console.log("Received message.created event:", data);
        addNotification(data.id, `Neue Nachricht erstellt von ${data.creator.name}: ${data.title}`);
    });

    return () => {
        userChannel.stopListening(".chat.created");
        userChannel.stopListening(".message.created");
        echo.leave(`user.${user.id}`);
        subscriptionRef.current = false;
    };
  }, [echo, addNotification]);

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
