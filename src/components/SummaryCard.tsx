import { useNavigate } from "react-router-dom";
import { FaUserCheck, FaUserEdit, FaBullhorn, FaEnvelope } from "react-icons/fa";
import clsx from "clsx";

type Message = { id: number; title: string; status: { name: string; color: string }, priority: string; creator: { name: string; department: { name: string; color: string } } };

type SummaryCardsProps = { title: string; messages: Message[]; count: number; onClick: () => void;};

export default function SummaryCards({ title, messages, count, onClick }: SummaryCardsProps) {
    const navigate = useNavigate();

    // Choose icon based on card title
    const getCardIcon = () => {
      switch (title.toLowerCase()) {
        case "zugewiesen":
          return <FaUserCheck className="text-blue-500 w-5 h-5" />;
        case "erstellt":
          return <FaUserEdit className="text-green-500 w-5 h-5" />;
        case "ankündigungen":
          return <FaBullhorn className="text-yellow-500 w-5 h-5" />;
        default:
          return <FaUserCheck className="w-5 h-5" />;
      }
    };

    const getPriorityBg = (priority: string) => {
      switch (priority.toLowerCase()) {
        case "hoch":
          return "bg-red-200/30";
        case "mittel":
          return "bg-yellow-200/30";
        case "niedrig":
          return "bg-blue-200/30";
        default:
          return "bg-gray-100";
      }
    };
    
    return (
        <div
          onClick={onClick}
          className="cursor-pointer bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col"
        >
          <div className="flex items-center mb-4 space-x-2">
            {getCardIcon()}
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>
          {messages.length === 0 ? (
            <p className="text-gray-500 flex-1">Keine neuen Nachrichten</p>
          ) : (
            <ul className="flex-1 space-y-1 mb-2">
              {messages.map(msg => (
                <li
                    key={msg.id}
                    className={clsx(
                      "flex items-center justify-between p-3 rounded-md transition hover:bg-gray-100",
                      "shadow-sm",
                      getPriorityBg(msg.priority)
                    )}
                    onClick={e => {
                        e.stopPropagation();
                        navigate(`/messages/${msg.id}`);
                    }}
                    title={msg.title}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FaEnvelope
                      className="w-4 h-4"
                      style={{ color: msg.status.color }}
                      title={msg.status.name}
                    />
                    <span className="truncate font-medium">{msg.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span
                      className="px-2 py-0.5 rounded-full font-semibold text-white text-xs"
                      style={{ backgroundColor: msg.status.color }}
                    >
                      {msg.status.name}
                    </span>
                    <span className="truncate text-gray-600">{msg.creator.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-blue-600 font-bold">{count} {count === 1 ? "Nachricht" : "Nachrichten"}</p>
        </div>
    );
}
