interface SettingItem {
    id: number;
    name: string;
    color: string;
  }
  
  interface Props {
    items: SettingItem[];
    onEdit: (item: SettingItem) => void;
    onDelete: (id: number) => void;
  }
  
  export default function SettingsTable({ items, onEdit, onDelete }: Props) {
    return (
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left border-b">
            <th className="p-3">Name</th>
            <th className="p-3">Farbe</th>
            <th className="p-3">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="border-b">
              <td className="p-3">{item.name}</td>
              <td className="p-3">
                <span
                  className="px-3 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: item.color }}
                >
                  {item.color}
                </span>
              </td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => onEdit(item)}
                  className="text-blue-600"
                >
                    Bearbeiten
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-600"
                >
                    Löschen
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-500">
                Keine Einstellungen gefunden
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
  