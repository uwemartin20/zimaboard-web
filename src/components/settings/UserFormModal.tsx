import { useEffect, useState } from "react";
import api from "../../api/client";

interface Department {
  id: number;
  name: string;
  color: string;
}

interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  department_id?: number | null;
  is_admin: boolean;
}

interface Props {
  initial?: User;
  onSubmit: (data: User) => void;
  onClose: () => void;
}

export default function UserFormModal({ initial, onSubmit, onClose }: Props) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [password, setPassword] = useState(""); // Only used for create
  const [departmentId, setDepartmentId] = useState<number | "">(initial?.department_id || "");
  const [isAdmin, setIsAdmin] = useState(initial?.is_admin || false);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    api.get("/settings/departments")
      .then(res => setDepartments(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = () => {
    const payload: User = {
      name,
      email,
      is_admin: isAdmin,
      department_id: departmentId === "" ? null : departmentId,
    };

    if (!initial?.id) {
      payload.password = password; // Only send password on creation
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-96 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          {initial?.id ? "Benutzer bearbeiten" : "Benutzer erstellen"}
        </h3>

        <input
          className="w-full border p-2 mb-3"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          type="email"
          className="w-full border p-2 mb-3"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        {!initial?.id && (
          <input
            type="password"
            className="w-full border p-2 mb-3"
            placeholder="Passwort"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        )}

        <select
          className="w-full border p-2 mb-3"
          value={departmentId}
          onChange={e => setDepartmentId(Number(e.target.value))}
        >
          <option value="">Abteilung auswählen</option>
          {departments.map(dep => (
            <option key={dep.id} value={dep.id}>
              {dep.name}
            </option>
          ))}
        </select>

        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={e => setIsAdmin(e.target.checked)}
            className="mr-2"
          />
          Admin
        </label>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Stornieren
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-1 bg-blue-600 text-white rounded"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
