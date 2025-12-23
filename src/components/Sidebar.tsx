import { NavLink } from "react-router-dom";
import { getUser } from "../api/auth";

export default function Sidebar() {
    const user = getUser();
  const mainLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Zugewiesen", path: "/assigned" },
    { name: "Erstellt", path: "/created" },
    { name: "Ankündigungen", path: "/announcement" },
  ];

  const settingsLinks = [
    { name: "Benutzer", path: "/settings/users" },
    { name: "Abteilungen", path: "/settings/departments" },
    { name: "Status", path: "/settings/statuses" },
  ];

  const linkClass = (isActive: boolean) =>
    `block px-4 py-2 rounded transition ${
      isActive ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-300 p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Zimaboard</h1>

      <nav className="flex flex-col gap-3">
        {mainLinks.map(link => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) => linkClass(isActive)}
          >
            {link.name}
          </NavLink>
        ))}

        {user?.is_admin === 1 && (
            <div className="mt-6">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase">
                Einstellungen
            </p>

            {settingsLinks.map(link => (
                <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => linkClass(isActive)}
                >
                {link.name}
                </NavLink>
            ))}
            </div>
        )}
      </nav>
    </aside>
  );
}
