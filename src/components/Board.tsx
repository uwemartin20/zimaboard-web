import { useEffect, useState } from "react";
import api from "../api/client";
import MessageModal from "./MessageModal";
import { FaShareAlt, FaUserCircle, FaTrash } from "react-icons/fa";
import ShareModal from "./ShareModal";

interface Message {
    id: number;
    title: string;
    description: string;
    priority: "Niedrig" | "Mittel" | "Hoch";
    attachments: { id: number; path: string; url: string; original_name: string; mime_type: string; size: number }[];
    chat_messages: { id: number; user: { id: number; name: string }; content: string; created_at: string }[];
    activities: { id: number; user: { id: number; name: string }; assignee: { id: number; name: string }; action: string; created_at: string }[];
    creator: { id: number; name: string; department: { name: string } | null };
    status: { name: string; color: string };
    status_id: number;
    assignees: Array<{ id: number; name: string; department: { id: number; name: string; color: string } }>;
    assignee: { id: number; name: string; };
    is_archived: boolean;
    is_announcement: boolean;
}

interface Department {
    id: number;
    name: string;
    color: string;
}

interface BoardProps {
  type: "assigned" | "created" | "announcement";
}

export default function Board({ type }: BoardProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterArchived, setFilterArchived] = useState(false); // null = all
    const [filterCreator, setFilterCreator] = useState<number | null>(null); // creator id
    const [filterPriority, setFilterPriority] = useState<"hoch" | "mittel" | "niedrig" | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null); // status name

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareMessage, setShareMessage] = useState<Message | null>(null);

  const fetchBoard = async () => {
    setLoading(true);
    try {
        const params: any = {};
        if (filterArchived !== null) params.is_archived = filterArchived;
        if (filterCreator) params.creator_id = filterCreator;
        if (filterPriority) params.priority = filterPriority;
        if (filterStatus) params.status = filterStatus;
      const res = await api.get(`/${type}`, { params }); // endpoint to get specific board
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for the board
  useEffect(() => {
    const fetchDepartments = async () => {
        try {
          const res = await api.get("/departments");
          setDepartments(res.data);
        } catch (err) {
          console.error(err);
        }
    };
    fetchDepartments();
    fetchBoard();
  }, [type, filterArchived, filterCreator, filterPriority, filterStatus]);

  // Filter messages by department
  const messagesByDept = (dept: string) =>
    messages.filter(msg => msg.creator?.department?.name === dept);

  if (loading) return <p>Laden {type} board...</p>;
  if (messages.length === 0) return <p>Kein {type} Nachrichten verfügbar.</p>;

  return (
    <>
    <div className="flex flex-wrap gap-4 mb-4 items-center">

        {/* Creator filter */}
        <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Ersteller</label>
            <select
            className="border rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={filterCreator ?? ""}
            onChange={e => setFilterCreator(e.target.value ? Number(e.target.value) : null)}
            >
            <option value="">Alle Ersteller</option>
            {messages
                .map(m => m.creator)
                .filter((v, i, a) => v && a.findIndex(x => x?.name === v.name) === i)
                .map(c => (
                <option key={c?.name} value={c?.name}>{c?.name}</option>
                ))}
            </select>
        </div>

        {/* Priority filter */}
        <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Priorität</label>
            <select
            className="border rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={filterPriority ?? ""}
            onChange={e => setFilterPriority(e.target.value as any || null)}
            >
            <option value="">Alle Prioritäten</option>
            <option value="hoch">Hoch</option>
            <option value="mittel">Mittel</option>
            <option value="niedrig">Niedrig</option>
            </select>
        </div>

        {/* Status filter */}
        <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Status</label>
            <select
            className="border rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={filterStatus ?? ""}
            onChange={e => setFilterStatus(e.target.value || null)}
            >
            <option value="">Alle Status</option>
            {messages.map(m => m.status.name)
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map(status => (
                    <option key={status} value={status}>{status}</option>
            ))}
            </select>
        </div>

        {/* Archived filter */}
        <div className="flex items-center gap-2 mt-4">
            <span className="text-sm font-medium text-gray-700"><FaTrash className="text-2xl text-gray-700" /></span>
            <button
                type="button"
                className={`relative inline-flex flex-shrink-0 h-6 w-12 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200 ease-in-out
                ${filterArchived ? "bg-blue-600" : "bg-gray-300"}`}
                onClick={() => setFilterArchived(prev => !prev)}
            >
                <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition-transform duration-200 ease-in-out
                    ${filterArchived ? "translate-x-6" : "translate-x-0"}`}
                />
            </button>
        </div>
    </div>

    <div className="flex gap-6 overflow-x-auto py-4">
      {departments.map(dept => (
        <div key={dept.id} className="flex-1 bg-gray-100 rounded-lg p-4 min-w-[250px]">
          <h3 className="font-semibold mb-4">{dept.name}</h3>
          <div className="space-y-3">
            {messagesByDept(dept.name).map(msg => {
                // determine background based on priority
                let priorityBg = "";
                switch (msg.priority.toLowerCase()) {
                  case "hoch":
                    priorityBg = "bg-red-200/30"; // red with 30% opacity
                    break;
                  case "mittel":
                    priorityBg = "bg-yellow-200/30"; // yellow with 30% opacity
                    break;
                  case "niedrig":
                    priorityBg = "bg-blue-200/30"; // blue with 30% opacity
                    break;
                  default:
                    priorityBg = "bg-gray-100";
                }

                // Add faded style if archived
                const archivedStyle = msg.is_archived ? "opacity-50 pointer-events-none" : "";

              return (
                <div
                    key={msg.id}
                    className={`${priorityBg} p-3 rounded shadow cursor-pointer hover:bg-opacity-50 transition ${archivedStyle}`}
                    onClick={() => setSelectedMessage(msg)} // replace with navigation to ticket page
                >
                    {/* Title + Status */}
                    <h2 className="text-lg font-semibold flex items-center justify-between">
                        <span className="truncate">{msg.title}</span>
                        <span
                        className="ml-2 px-2 py-1 rounded text-white text-sm"
                        style={{ backgroundColor: msg.status.color }}
                        >
                        {msg.status.name}
                        </span>
                    </h2>
                    {/* Description */}
                    <p className="text-gray-700 mt-2 text-sm line-clamp-5">
                        {msg.description}
                    </p>

                    {/* Footer */}
                    <div className="border-t border-gray-200 mt-3 pt-2 flex justify-between items-center">
                        {/* Share icon */}
                        <button
                        className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                        onClick={e => {
                            e.stopPropagation();
                            setShareMessage(msg);
                            setShareModalOpen(true);
                        }}
                        >
                        <FaShareAlt /> Teilen
                        </button>

                        {/* Creator + Assignees */}
                        <div className="text-gray-600 text-sm">
                            {type === "created" ? (
                                msg.assignees.map((a, i) => (
                                    <span key={a.id} className="flex items-center gap-1">
                                        <FaUserCircle className="text-red-500 text-xs" />
                                        {a.name}{i < msg.assignees.length - 1 ? "," : ""}
                                    </span>
                                ))
                            ) : (
                                <span className="flex items-center gap-1">
                                    <FaUserCircle className="text-blue-500 text-xs" />
                                    {msg.creator?.name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                );
            })}
            {messagesByDept(dept.name).length === 0 && (
              <p className="text-gray-500 text-sm">Keine Nachrichten</p>
            )}
          </div>
        </div>
      ))}
    </div>

    {shareModalOpen && shareMessage && (
        <ShareModal
            message={shareMessage}
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            onShareSuccess={() => {
            fetchBoard(); // refresh board messages
            setShareModalOpen(false);
            }}
        />
    )}

    {/* Modal */}
    {selectedMessage && (
    <MessageModal
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onArchiveToggle={async archived => {
        await api.put(`/messages/${selectedMessage.id}`, { is_archived: archived });
        fetchBoard(); // refresh board
        setSelectedMessage(prev => prev && { ...prev, is_archived: archived });
        }}
        onAddComment={async text => {
        const res = await api.post(`/messages/${selectedMessage.id}/comments`, { text });
        return res.data.data;
        // fetchBoard(); // refresh board
        }}
    />
    )}
    </>
  );
}
