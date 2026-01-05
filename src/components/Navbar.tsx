import { FaUserCircle, FaSignOutAlt, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import type { NavigateFunction } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { useEffect, useRef, useState } from "react";
import NewMessage from "../components/NewMessage";

type NavbarProps = {
  title: string;
  logout: (navigate?: NavigateFunction) => void;
};

export default function Navbar({ title, logout }: NavbarProps) {
    const { notifications, markAllAsRead, removeNotification } = useNotifications();
    const [open, setOpen] = useState(false);
    const [messageModel, setMessageModel] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const unreadCount = notifications.filter(n => !n.read).length;
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) return;
      
        const handleClickOutside = (event: MouseEvent) => {
          if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
          ) {
            setOpen(false);
          }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);
          
  return (
    <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="flex items-center gap-4">
        {/* New Message Button */}
        <div
            onClick={() => setMessageModel(true)}
            className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-blue-100 transition-colors"
            title="Neue Nachricht erstellen"
        >
            <span className="font-medium text-blue-600">Neue Nachricht</span>
        </div>

        {messageModel && (
            <NewMessage 
            mode="create"
            onClose={() => setMessageModel(false)} />
        )}

        <div className="flex items-center gap-4 relative">
            <div className="relative inline-flex items-center" ref={dropdownRef}>
                <button
                    className="relative"
                    onClick={() => setOpen(prev => !prev)}
                    title="Mitteilungen"
                >
                    <FaBell className="text-2xl text-gray-700" />
                    {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                    )}
                </button>

                {open && (
                    <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg border rounded-md z-50" style={{ top: "100%" }}>
                    <div className="flex justify-between items-center px-4 py-2 border-b">
                        <span className="font-semibold">Mitteilungen</span>
                        <button
                        className="text-sm text-blue-600"
                        onClick={() => markAllAsRead()}
                        >
                        Alle als gelesen markieren
                        </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 && (
                        <div className="p-4 text-gray-500 text-sm">Keine Mitteilungen</div>
                        )}
                        {notifications.map(n => (
                        <div
                            key={n.id}
                            className={`p-3 border-b cursor-pointer ${!n.read ? "bg-blue-50" : ""}`}
                            onClick={() => {
                                // Open the message modal for this notification
                                navigate(`/messages/${n.message_id}`);
                
                                // Remove the notification since it is read
                                removeNotification(n.id);
                            }}
                        >
                            {n.message}
                            <div className="text-xs text-gray-400">
                            {new Date(n.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                )}
            </div>
        </div>

        {/* Profile */}
        <div
            onClick={() => navigate("/profile")}
            className="flex items-center cursor-pointer px-1 py-1 rounded hover:bg-gray-100 transition-colors"
            title="Profil"
        >
            <FaUserCircle className="text-2xl text-gray-700 hover:text-blue-600 transition-colors" />
        </div>

        {/* Logout */}
        <button
            onClick={() => logout(navigate)}
            className="flex items-center px-1 py-1 rounded hover:bg-red-100 transition-colors"
            title="Abmelden"
        >
            <FaSignOutAlt className="text-2xl text-gray-700 hover:text-red-500 transition-colors" />
        </button>
      </div>
    </div>
  );
}
