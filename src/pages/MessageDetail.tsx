import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";
import api from "../api/client";
import { FaTimes, FaUser, FaTrash, FaCommentDots, FaHistory, FaEdit } from "react-icons/fa";
import NewMessage from "../components/NewMessage";

interface Comment {
  id: number;
  user: { id: number; name: string };
  content: string;
  created_at: string;
}

interface Activity {
  assignee: { id: number; name: string } | null;
  id: number;
  user: { id: number; name: string };
  action: string;
  created_at: string;
}

interface Attachment {
  id: number;
  path: string;
  url: string;
  original_name: string;
  mime_type: string;
  size: number;
}

interface Message {
  id: number;
  title: string;
  description: string;
  priority: "Niedrig" | "Mittel" | "Hoch";
  status: { name: string; color: string };
  creator: { name: string };
  assignees: Array<{ id: number; name: string }>;
  chat_messages: Comment[];
  activities: Activity[];
  attachments: Attachment[];
  is_archived: boolean;
    is_announcement: boolean;
    status_id: number;
}

export default function MessageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState<Message | null>(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [messageModal, setMessageModal] = useState(false);

  // Fetch message by ID
  const fetchMessage = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/messages/${id}`);
      setMessage(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, [id]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [message?.chat_messages]);

  if (!message) return <p>Lade Nachricht...</p>;

  const priorityBg =
    message.priority === "Hoch"
      ? "bg-red-100"
      : message.priority === "Mittel"
      ? "bg-yellow-100"
      : "bg-blue-100";

  const handleAddComment = async () => {
    setLoading(true);
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/messages/${message.id}/comments`, { text: newComment });
      setMessage(prev => prev && {
        ...prev,
        chat_messages: [...prev.chat_messages, res.data.data]
      });
      setNewComment("");
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveToggle = async (archived: boolean) => {
    try {
      await api.put(`/messages/${message.id}`, { is_archived: archived });
      setMessage(prev => prev && { ...prev, is_archived: archived });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col items-end gap-2">
            </div>
            {/* Archive toggle */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700"><FaTrash className="text-2xl text-gray-700" /></span>
                <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={message.is_archived}
                    onChange={e => handleArchiveToggle(e.target.checked)}
                    className="sr-only peer"
                />
                <div
                    className={`w-12 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300
                                peer-checked:bg-blue-600 transition-all duration-300`}
                />
                <div
                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform
                                transition-transform duration-300
                                ${message.is_archived ? "translate-x-5" : ""}`}
                />
                </label>
            </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
                <span
                    className="mx-2 px-2 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: message.status.color }}
                    >
                    {message.status.name}
                </span>
                {message.title}
                <button onClick={() => setMessageModal(true)} className="px-4 text-gray-500 hover:text-blue-800">
                    <FaEdit className="w-6 h-6" />
                </button> 
            </h2>
            
            <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-800"
            >
            <FaTimes className="text-xl" />
            </button>
        </div>

        {messageModal && (
            <NewMessage 
              mode="edit"
              onClose={() => setMessageModal(false)}
              message={message} />
        )}

        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-9">

                {/* Status & Priority */}
                <div className={`p-4 rounded ${priorityBg} mb-4`}>
                    <p>{message.description}</p>
                </div>

                {/* Attachments */}
                {message.attachments?.length > 0 && (
                    <div className="mb-4">
                    <h3 className="font-semibold mb-2">Anhänge</h3>
                    <ul className="space-y-1">
                        {message.attachments.map(att => (
                        <li key={att.id} className="text-blue-600 hover:underline">
                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                            {att.original_name} ({Math.round(att.size / 1024)} KB)
                            </a>
                        </li>
                        ))}
                    </ul>
                    </div>
                )}

                {/* Comments */}
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Kommentare</h3>
                    <div
                    ref={containerRef}
                    className="border rounded p-3 max-h-64 overflow-y-auto space-y-3 mb-3"
                    >
                    {message.chat_messages.map(c => (
                        <div key={c.id} className="border-b pb-2 last:border-b-0">
                        <div className="flex items-center gap-2">
                            <FaCommentDots className="w-4 h-4 text-gray-400" />
                            <p className="text-sm font-medium">{c.user.name}</p>
                        </div>
                        <p className="text-gray-700 ml-6">{c.content}</p>
                        <div className="flex justify-end mt-1">
                            <span className="text-xs text-gray-400">
                            {timeAgo(c.created_at)}
                            </span>
                        </div>
                        </div>
                    ))}
                    </div>
                    <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="Kommentar hinzufügen..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Schicken
                    </button>
                    </div>
                </div>
            </div>

            <div className="col-span-12 lg:col-span-3 space-y-6">
                {/* Creator, Assignees & Archive */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    <span className="font-medium">{message.creator?.name || "Unbekannt"}</span>
                    </div>
                    {message.assignees.map(a => (
                    <div key={a.id} className="flex items-center gap-2">
                        <FaUser className="text-red-600" />
                        <span>{a.name}</span>
                    </div>
                    ))}
                </div>
                {/* Activities */}
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Aktivitäten</h3>
                    <div className="border rounded p-3 max-h-80 overflow-y-auto space-y-2">
                    {message.activities.map(a => (
                        <>
                        <div key={a.id} className="flex gap-2 text-sm">
                            <FaHistory className="w-4 h-4 text-gray-400 mt-1" />
                            <div>
                                <p className="font-medium">
                                    {a.user.name}{" "}
                                    <span className="text-gray-700">{a.action}</span>{" "}
                                    {a.assignee?.name || ""}
                                </p>
                            </div>
                        </div>
                        <div>
                            <div>
                                <div className="flex justify-end mt-1">
                                    <span className="text-xs text-gray-400">
                                        {timeAgo(a.created_at)}
                                    </span>
                                </div>
                                {/* <p className="text-xs text-gray-400">{timeAgo(a.created_at)}</p> */}
                            </div>
                        </div>
                        </>
                    ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
