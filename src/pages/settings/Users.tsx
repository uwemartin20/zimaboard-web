import { useEffect, useState } from "react";
import api from "../../api/client";
import { FaUserShield } from "react-icons/fa";
import UserFormModal from "../../components/settings/UserFormModal";

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  department: {
    id: number;
    name: string;
    color: string;
  } | null;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/settings/users");
      setUsers(res.data.users || res.data); // depending on backend
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (data: any) => {
    try {
      if (editing?.id) {
        await api.put(`/settings/users/${editing.id}`, data);
      } else {
        await api.post("/settings/users", data);
      }
      setEditing(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/settings/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Benutzer werden geladen...</p>;

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold"></h2>
        <button
          onClick={() => setEditing({} as any)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Benutzer hinzufügen
        </button>
      </div>

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left border-b">
            <th className="p-3">Name</th>
            <th className="p-3">E-mail</th>
            <th className="p-3">Abteilung</th>
            <th className="p-3">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b">
              <td className="p-3">{u.name} {!!u.is_admin && <FaUserShield className="text-blue-600 inline" />}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">
                {u.department ? (
                  <span
                    className="px-2 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: u.department.color }}
                  >
                    {u.department.name}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">Keine Abteilung</span>
                )}
              </td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => setEditing(u)}
                  className="text-blue-600"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="text-red-600"
                >
                    Löschen
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                Keine Benutzer gefunden.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {editing && (
        <UserFormModal
          initial={editing.id ? editing : undefined}
          onSubmit={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
