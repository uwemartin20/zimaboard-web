import { useState } from "react";

interface Props {
    initial?: { name: string; color: string };
    onSubmit: (data: { name: string; color: string }) => void;
    onClose: () => void;
  }
  
  export default function SettingsFormModal({ initial, onSubmit, onClose }: Props) {
    const [name, setName] = useState(initial?.name ?? "");
    const [color, setColor] = useState(initial?.color ?? "#2563eb");
  
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
        <div className="bg-white rounded p-6 w-96">
          <h3 className="text-lg font-semibold mb-4">
            {initial ? "Bearbeiten" : "Erstellen"}
          </h3>
  
          <input
            className="w-full border p-2 mb-3"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
  
          <input
            type="color"
            className="w-full border p-2 mb-4"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
  
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-3 py-1 border rounded">
                Stornieren
            </button>
            <button
              onClick={() => onSubmit({ name, color })}
              className="px-4 py-1 bg-blue-600 text-white rounded"
            >
                Speichern
            </button>
          </div>
        </div>
      </div>
    );
  }
  