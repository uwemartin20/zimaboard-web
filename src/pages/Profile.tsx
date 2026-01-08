import { useState } from "react";
import {
  Mail,
  Building2,
  User,
  Lock,
} from "lucide-react";
import { getUser } from "../api/auth";
import Avatar from "../components/Avatar";
import ChangePasswordModal from "../components/ChangePasswordModal";

export default function Profile() {
  const user = getUser();
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-lg bg-white rounded-xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {user.avatarUrl ? (
            <img
                src={user.avatarUrl}
                alt="User Avatar"
                className="w-20 h-20 rounded-full object-cover border"
            />
        ) : (
            <Avatar name={user.name} />
        )}

        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User size={18} />
            {user.name}
          </h2>
          <p className="text-gray-500 text-sm">
            {user.department.name}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <p className="flex items-center gap-2">
          <Mail size={16} className="text-gray-500" />
          <span className="font-medium">E-mail:</span>
          {user.email}
        </p>

        <p className="flex items-center gap-2">
          <Building2 size={16} className="text-gray-500" />
          <span className="font-medium">Abteilung:</span>
          {user.department.name}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
        >
          <Lock size={16} />
          Passwort ändern
        </button>
      </div>

      {open && <ChangePasswordModal onClose={() => setOpen(false)} />}
    </div>
  );
}
  
