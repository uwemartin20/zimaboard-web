import { getUser } from "../api/auth";

export default function Profile() {
    const user = getUser();
  
    return (
        <div className="bg-white rounded-lg p-6 max-w-lg">
            <p className="mb-2">
                <span className="font-semibold">E-mail:</span> {user.email}
            </p>
            <p>
                <span className="font-semibold">Abteilung:</span> {user.department.name}
            </p>
      </div>
    );
  }
  