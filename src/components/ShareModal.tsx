import { useState, useEffect } from "react";
import { FaTimes, FaUserPlus } from "react-icons/fa";
import api from "../api/client";
import { getUser } from "../api/auth";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Message {
    id: number;
    title: string;
    description: string;
    priority: "Niedrig" | "Mittel" | "Hoch";
    attachments: { id: number; path: string; original_name: string; mime_type: string; size: number }[];
    chat_messages: { id: number; user: { id: number; name: string }; content: string; created_at: string }[];
    activities: { id: number; user: { id: number; name: string }; assignee: { id: number; name: string }; action: string; created_at: string }[];
    creator: { id: number; name: string; department: { name: string } | null };
    status: { name: string; color: string };
    assignees: Array<{ id: number; name: string; department: { id: number; name: string; color: string } }>;
    is_archived: boolean;
    is_announcement: boolean;
}

interface ShareModalProps {
  message: Message;
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess: () => void; // Callback after sharing
}

const user = getUser();

export default function ShareModal({ message, isOpen, onClose, onShareSuccess }: ShareModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  // const [confirmOpen, setConfirmOpen] = useState(false);


  useEffect(() => {
    if (!isOpen) return;

    if (message?.assignees) {
        setSelectedUsers(message.assignees.map(a => a.id));
    }
    // Fetch all users when modal opens
    api.get("/users")
      .then(res => setUsers(res.data.users))
      .catch(err => console.error(err));
  }, [isOpen, message]);

  const handleShare = async () => {
    if (selectedUsers.length === 0) return;

    setLoading(true);
    try {
      await api.post(`/messages/${message.id}/assign`, { assignees: selectedUsers });
      onShareSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const excludeUserIds = [
    message?.creator?.id, 
    user.id
  ].filter(Boolean);

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-w-full p-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaUserPlus /> Nachricht teilen
        </h2>

        <div className="max-h-64 overflow-y-auto mb-4">
          {users
            .filter(u => !excludeUserIds.includes(u.id))
            .map(u => (
            <label key={u.id} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedUsers.includes(u.id)}
                disabled={selectedUsers.includes(u.id)}
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedUsers(prev => [...prev, u.id]);
                  } else {
                    setSelectedUsers(prev => prev.filter(id => id !== u.id));
                  }
                }}
              />
              <span>{u.name} ({u.email})</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100 transition"
          >
            Stornieren
          </button>
          <button
            // onClick={() => setConfirmOpen(true)}
            onClick={async () => {
              await handleShare();
            }}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {loading ? "Teilen..." : "Teilen"}
          </button>
        </div>
      </div>
    </div>

    {/* {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-96 max-w-full p-6">
            <h3 className="text-lg font-semibold mb-2">
            Nachricht wirklich teilen?
            </h3>
    
            <p className="text-sm text-gray-600 mb-4">
            Diese Aktion entfernt die Nachricht aus den Pin Wand.
            Möchten Sie fortfahren?
            </p>
    
            <div className="flex justify-end gap-2">
            <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100 transition"
            >
                Abbrechen
            </button>
    
            <button
                onClick={async () => {
                setConfirmOpen(false);
                await handleShare();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
                Ja, teilen
            </button>
            </div>
        </div>
        </div>
    )}   */}
  </>
  );
}
