import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import { getUser } from "../api/auth";

interface MessageStatus {
  id: number;
  name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    department: { id: number; name: string; color: string };
};

export default function NewMessage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Niedrig" | "Mittel" | "Hoch">("Mittel");
  const [statusId, setStatusId] = useState<number | "">("");
  const [users, setUsers] = useState<User[]>([]);
  const [assignees, setAssignees] = useState<number[]>([]);
  const [assignee, setAssignee] = useState<number | null>(null);
  // const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [statuses, setStatuses] = useState<MessageStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/message-statuses").then(res => setStatuses(res.data));
    api.get("/users").then(res => setUsers(res.data.users));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      /** 1️⃣ Create Message */
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

      const messageId = messageRes.data.data.id;

      /** 2️⃣ Attachment (Optional) */
      if (attachments.length > 0) {
        const formData = new FormData();
        formData.append("message_id", String(messageId));

        attachments.forEach(file => {
          formData.append("files[]", file);
        });

        await api.post("/store-attachments", formData);
      }

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

      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Nachricht konnte nicht erstellt werden");
    } finally {
      setLoading(false);
    }
  };

  const user = getUser();
  // Determine the user to exclude
  const excludeUserId = user.id;

  const selectableUsers = useMemo(
    () => users.filter(u => u.id !== excludeUserId),
    [users, excludeUserId]
  );
  const selectableUserIds = useMemo(
    () => selectableUsers.map(u => u.id),
    [selectableUsers]
  );
  const allSelected = useMemo(
    () => selectableUserIds.every(id => assignees.includes(id)),
    [selectableUserIds, assignees]
  );

  const departments = useMemo(
    () =>
      Array.from(
        new Map(
        selectableUsers.map(u => [u.department.id, u.department])
      ).values()
    ),
    [selectableUsers]
  );

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
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
                {/* Filter / Select buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Alle button */}
                  <button
                    type="button"
                    onClick={() =>
                      setAssignees(allSelected ? [] : selectableUserIds)
                    }
                    className={`text-xs px-3 py-1 rounded border transition
                      ${
                        allSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-blue-600 text-blue-600 hover:bg-blue-50"
                      }`}
                  >
                    Alle
                  </button>

                  {/* Department buttons */}
                  {departments.map(dep => {
                    const depUserIds = users
                      .filter(
                        u => u.id !== excludeUserId && u.department.id === dep.id
                      )
                      .map(u => u.id);

                    const depFullySelected =
                      depUserIds.length > 0 &&
                      depUserIds.every(id => assignees.includes(id));

                    return (
                      <button
                        key={dep.id}
                        type="button"
                        onClick={() =>
                          setAssignees(prev =>
                            depFullySelected
                              ? prev.filter(id => !depUserIds.includes(id))
                              : Array.from(new Set([...prev, ...depUserIds]))
                          )
                        }
                        className={`text-xs px-3 py-1 rounded border transition`}
                        style={
                          depFullySelected
                            ? {
                                backgroundColor: dep.color,
                                borderColor: dep.color,
                                color: "#fff",
                              }
                            : {
                                borderColor: dep.color,
                                color: dep.color,
                              }
                        }
                      >
                        {dep.name}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {users
                    .filter(u => u.id !== excludeUserId)
                    .map(u => {
                      const isSelected = assignees.includes(u.id);

                      return (
                        <label
                          key={u.id}
                          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer
                            border transition
                            ${
                              isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-transparent hover:border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setAssignees(prev =>
                                isSelected
                                  ? prev.filter(id => id !== u.id)
                                  : [...prev, u.id]
                              );
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />

                          <span className="select-none">{u.name}</span>
                    </label>
                  );
                  })}
                </div>
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
                {loading ? "Wird gesendet..." : "Nachricht erstellen"}
            </button>
            </div>
        </form>
    </div>
  );
}
