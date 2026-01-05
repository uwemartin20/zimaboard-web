import { useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { getUser } from "../api/auth";

interface MessageStatus {
  id: number;
  name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
};

interface Message {
    id: number;
    title: string;
    description: string;
    creator: any;
    priority: "Niedrig" | "Mittel" | "Hoch";
    attachments: { id: number; path: string; original_name: string; mime_type: string; size: number }[];
    status_id: number;
    assignees: Array<{ id: number; name: string; }>;
    assignee: { id: number; name: string; };
    is_announcement: boolean;
}

type MessageFormMode = "create" | "edit";

type NewMessageProps = {
  mode: MessageFormMode;
  onClose: () => void;
  message?: Message;
};

export default function NewMessage({ mode, onClose, message }: NewMessageProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Niedrig" | "Mittel" | "Hoch">("Mittel");
  const [statusId, setStatusId] = useState<number | "">("");
  const [users, setUsers] = useState<User[]>([]);
  const [assignees, setAssignees] = useState<number[]>([]);
  const [assignee, setAssignee] = useState<number | null>(null);
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [statuses, setStatuses] = useState<MessageStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/message-statuses").then(res => setStatuses(res.data));
    api.get("/users").then(res => setUsers(res.data.users));
  }, []);

  useEffect(() => {
    if (mode === "edit" && message) {
      setTitle(message.title);
      setDescription(message.description);
      setPriority(message.priority);
      setStatusId(message.status_id);
      setAssignee(message.assignee?.id)
      setAssignees(message.assignees.map(a => a.id));
      setIsAnnouncement(message.is_announcement);
    }
  }, [mode, message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      /** 1️⃣ Create Message */
      let messageId: number;
      if (mode === "create") {
        const messageRes = await api.post("/new-message", {
          title,
          description,
          priority,
          status_id: statusId,
          // is_announcement: isAnnouncement,
          is_announcement: false,
          assignees,
          assignee,
        });

        //   console.log("Created message:", messageRes.data.data);

        messageId = messageRes.data.data.id;

        /** 3️⃣ Activity */
        await api.post("/store-activities", {
          message_id: messageId,
          action: "hat Nachricht erstellt",
        });

        /** 4️⃣ Activity — assignments */
          if (Array.isArray(assignees) && assignees.length > 0) {
              await Promise.all(
              assignees.map(assigneeId =>
                  api.post("/store-activities", {
                  message_id: messageId,
                  action: "hat geteilt mit",
                  assignee_id: assigneeId,
                  })
              )
              );
          }
        } else {
          await api.put(`/message-update/${message!.id}`, {
            title,
            description,
            priority,
            status_id: statusId,
            is_announcement: isAnnouncement,
            assignees,
            assignee,
          });
    
          messageId = message!.id;
    
          await api.post("/store-activities", {
            message_id: messageId,
            action: "hat Nachricht bearbeitet",
          });
        }

        /** 2️⃣ Attachment (Optional) */
        if (attachments.length > 0) {
          const formData = new FormData();
          formData.append("message_id", String(messageId));

          attachments.forEach(file => {
            formData.append("files[]", file);
          });

          await api.post("/store-attachments", formData);
        }

      onClose();
    } catch (err) {
      console.error(err);
      alert("Nachricht konnte nicht erstellt werden");
    } finally {
      setLoading(false);
    }
  };

  const user = getUser();
  // Determine the user to exclude
  const excludeUserId = message?.creator?.id ?? user.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b px-6 p-4">
          <div>
          <h2 className="text-lg font-semibold">
            {mode === "create" ? "Neue Nachricht" : "Nachricht bearbeiten"}
          </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes className="text-lg" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-6">
              {/* Left Column: 3/4 width */}
              <div className="col-span-3 space-y-4">
              {/* Title */}
              <div>
                  <label className="block font-medium mb-1">Titel</label>
                  <input
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  />
              </div>

              {/* Description */}
              <div>
                  <label className="block font-medium mb-1">Beschreibung</label>
                  <textarea
                  required
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  />
              </div>

              {/* Attachment */}
              <div>
                  <label className="block font-medium mb-1">Anhänge</label>
                  <input
                  type="file"
                  multiple
                  className="w-full"
                  onChange={e => setAttachments(Array.from(e.target.files ?? []))}
                  />
              </div>

              {/* Is Announcement */}
              {/* <div className="flex items-center gap-2">
                  <input
                  type="checkbox"
                  checked={isAnnouncement}
                  onChange={e => setIsAnnouncement(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-300"
                  />
                  <label className="font-medium">Ist eine Ankündigung</label>
              </div> */}
              </div>

              {/* Right Column: 1/4 width */}
              <div className="col-span-1 space-y-4">
                {/* Priority */}
                <div>
                    <label className="block font-medium mb-1">Priorität</label>
                    <select
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    >
                    <option value="Niedrig">Niedrig</option>
                    <option value="Mittel">Mittel</option>
                    <option value="Hoch">Hoch</option>
                    </select>
                </div>

                {/* Status */}
                <div>
                    <label className="block font-medium mb-1">Status</label>
                    <select
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={statusId}
                    onChange={e => setStatusId(Number(e.target.value))}
                    >
                    <option value="">Status auswählen</option>
                    {statuses.map(s => (
                        <option key={s.id} value={s.id}>
                        {s.name}
                        </option>
                    ))}
                    </select>
                </div>

                {/* Subscribers */}
                <div>
                    <label className="block font-medium mb-1">Abonnenten</label>
                    <select
                    multiple
                    className="w-full border border-gray-300 rounded-lg p-2 h-40 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={assignees.map(String)}
                    onChange={e =>
                        setAssignees(Array.from(e.target.selectedOptions, o => Number(o.value)))
                    }
                    >
                    {users
                      .filter(u => u.id !== excludeUserId)
                      .map(u => (
                        <option key={u.id} value={u.id}>
                        {u.name}
                        </option>
                    ))}
                    </select>
                </div>

                {/* Assignee */}
                <div>
                    <label className="block font-medium mb-1">Empfänger</label>
                    <select
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={ assignee ?? "" }
                    onChange={e =>
                      setAssignee(Number(e.target.value))
                    }
                    >
                    <option value="">Empfänger auswählen</option>
                    {users
                      .filter(u => u.id !== excludeUserId)
                      .map(u => (
                        <option key={u.id} value={u.id}>
                        {u.name}
                        </option>
                    ))}
                    </select>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-4 flex justify-end gap-4 pt-4">
              <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                  Stornieren
              </button>

              <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                  {loading ? "Wird gesendet..." : mode === "create" ? "Nachricht erstellen" : "Änderungen speichern"}
              </button>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
}
