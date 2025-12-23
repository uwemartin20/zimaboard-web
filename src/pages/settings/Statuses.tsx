import { useEffect, useState } from "react";
import api from "../../api/client";
import SettingsTable from "../../components/settings/SettingsTable";
import SettingsFormModal from "../../components/settings/SettingsFormModal";

export default function Statuses() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const fetchItems = async () => {
    const res = await api.get("/settings/statuses");
    setItems(res.data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async (data: any) => {
    if (editing?.id) {
      await api.put(`/settings/statuses/${editing.id}`, data);
    } else {
      await api.post("/settings/statuses", data);
    }
    setEditing(null);
    fetchItems();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/settings/statuses/${id}`);
    fetchItems();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold"></h2>
        <button
          onClick={() => setEditing({})}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Status hinzufügen
        </button>
      </div>

      <SettingsTable
        items={items}
        onEdit={setEditing}
        onDelete={handleDelete}
      />

      {editing && (
        <SettingsFormModal
          initial={editing.id ? editing : undefined}
          onSubmit={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
