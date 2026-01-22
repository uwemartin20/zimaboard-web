import { useState, useEffect, useRef, Fragment } from "react";
import { FaTimes, FaTrash, FaHistory, FaEdit, FaArrowRight } from "react-icons/fa";
import { timeAgo } from "../utils/timeAgo";
import NewMessage from "./NewMessage";
import UserCircle from "./UserCircle";
import { getUser } from "../api/auth";
import api from "../api/client";

interface Comment {
  id: number;
  user: { id: number; name: string };
  content: string;
  created_at: string;
}

interface Activity {
  assignee: { id: number; name: string };
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

interface MessageModalProps {
  message: {
    creator: any;
    assignees: Array<any>;
    assignee: { id: number; name: string; };
    status: any;
    id: number;
    title: string;
    description: string;
    priority: "Niedrig" | "Mittel" | "Hoch";
    status_id: number;
    attachments: Attachment[];
    chat_messages: Comment[];
    activities: Activity[];
    is_archived: boolean;
    is_announcement: boolean;
  };
  onClose: () => void;
  onArchiveToggle: (archived: boolean) => void;
  onAddComment: (text: string) => Promise<Comment> | Comment;
}

export default function MessageModal({
  message,
  onClose,
  onArchiveToggle,
  onAddComment,
}: MessageModalProps) {
  const [newComment, setNewComment] = useState("");
  const [chatMessages, setChatMessages] = useState<Comment[]>(message.chat_messages || []);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [messageModal, setMessageModal] = useState(false);
  const [assignee, setAssignee] = useState<number | null>(
    message?.assignee?.id ?? null
  );

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [chatMessages]);

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
            const res: Comment = await onAddComment(newComment) as Comment;
            setChatMessages(prev => [...prev, res]);
            setNewComment("");
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const user = getUser();

    const [assignedToMe, setAssignedToMe] = useState<boolean>(() => {
      return message?.assignee?.id === user.id;
    });

    const onAssignToMeToggle = async (checked: boolean) => {
      setAssignedToMe(checked);

      try {
        await api.put(`/messages/${message.id}/assign-to-me`, {
          assigned_to: user.id,
        });
      } catch (error) {
        console.error("Assign failed:", error);
      }
    
      if (checked) {
        // assign message to current user
        setAssignee(user.id);
        console.log(assignee);
      } else {
        // unassign (set to null)
        setAssignee(null);
      }
    };
    

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes className="text-lg" />
          </button>
        </div>

        {messageModal && (
            <NewMessage 
            mode="edit"
            onClose={() => setMessageModal(false)}
            message={message} />
        )}

        <div className="grid grid-cols-4 gap-6 p-6">
          {/* Left column: content, attachments, comments */}
          <div className="col-span-3 space-y-4">
            {/* Message Description */}
            <div className={`${priorityBg} p-4 rounded shadow`}>
              <p>{message.description}</p>
            </div>

            {/* Attachments */}
            {message.attachments?.length > 0 && (
              <div>
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
            <div>
              <h3 className="font-semibold mb-2">Kommentare</h3>
              <div ref={containerRef} className="border rounded p-3 max-h-64 overflow-y-auto space-y-4">
                {chatMessages.map(c => {
                  const isMine = c.user.id === user.id;
                  return (
                    <div
                      key={c.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`
                          max-w-[80%] rounded-xl px-3 py-1.5 leading-snug 
                          ${isMine
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800"}
                        `}
                      >
                        {/* Username */}
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-[11px] font-medium opacity-80">
                            {isMine ? "Du" : c.user.name}
                          </span>
                          <span
                            className={`
                              text-[10px]
                              ${isMine ? "text-blue-200" : "text-gray-500"}
                            `}
                          >
                            {timeAgo(c.created_at)}
                          </span>
                        </div>

                        {/* Message */}
                        <p className="text-sm leading-snug whitespace-pre-wrap">
                          {c.content}
                        </p>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add new comment */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  className="flex-1 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Kommentar schreiben..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <button
                  type="button"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  onClick={handleAddComment}
                >
                  {loading ? "Wird gesendet..." : "Schicken"}
                </button>
              </div>
            </div>

            {/* Assign to me */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 leading-none">Mir Zuweisen</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignedToMe}
                    onChange={e => onAssignToMeToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                    peer-checked:bg-blue-600 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                    after:bg-white after:rounded-full after:h-5 after:w-5
                    after:transition-all peer-checked:after:translate-x-full">
                  </div>
                </label>
            </div>
          </div>

          {/* Right column: activities & archive */}
          <div className="col-span-1 space-y-4">

            {/* Creator, Receiver & Subscribers */}
            <div className="flex flex-col gap-3">

              <h3 className="font-semibold mb-2">Verantwortlicher</h3>
              {/* Creator → Receiver */}
              <div className="flex items-center gap-3">

                {/* Creator */}
                <UserCircle user={message.creator} color="bg-blue-600" />

                {/* Arrow / Sent To */}
                <FaArrowRight className="text-gray-400" />

                {/* Receiver (Assignee) */}
                {message.assignee ? (
                  <UserCircle user={message.assignee} color="bg-red-600" />
                ) : (
                  <span className="text-xs text-gray-400 italic">NA</span>
                )}
              </div>

              {/* Subscribers */}
              {message.assignees?.length > 0 && (
                <>
                  <h3 className="font-semibold mb-2">Abonnenten</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {message.assignees.map(u => (
                      <UserCircle key={u.id} user={u} color="bg-gray-600" size="sm" />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Activities */}
            <div>
              <h3 className="font-semibold mb-2">Aktivitäten</h3>
              <div className="border rounded p-3 max-h-80 overflow-y-auto space-y-2">
                {message.activities?.map(a => (
                  <Fragment key={a.id}>
                    <div className="flex gap-2 text-sm">
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
                  </Fragment>
                ))}
              </div>
            </div>

            {/* Archive Checkbox */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col items-end gap-2">
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700"><FaTrash className="text-2xl text-gray-700" /></span>
                    <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={message.is_archived}
                        onChange={e => onArchiveToggle(e.target.checked)}
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
            {/* <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={message.is_archived}
                onChange={e => onArchiveToggle(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-300"
              />
              <label className="font-medium">Archiviert</label>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
