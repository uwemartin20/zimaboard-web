import { useState } from "react";
import api from "../api/client";

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
        setError("Neue Passwörter stimmen nicht überein.");
        return;
        }

        try {
            setLoading(true);

            await api.post("/users/change-password", {
                currentPassword,
                newPassword,
            });

            onClose(); // ✅ close modal on success
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "Passwort konnte nicht geändert werden."
            );
        } finally {
            setLoading(false);
        }
    };
    
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            Passwort ändern
          </h3>
  
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Aktuelles Passwort
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium mb-1">
                Neues Passwort
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium mb-1">
                Passwort bestätigen
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
              />
            </div>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
  
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg border"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white"
              >
                {loading ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}